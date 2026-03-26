import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

// Server-side admin client using secret key (sb_secret_) or legacy service_role key
function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const secretKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !secretKey) {
    throw new Error('Missing SUPABASE_SECRET_KEY (or SUPABASE_SERVICE_ROLE_KEY) environment variable')
  }

  return createClient(url, secretKey)
}

// Verify the requesting user is an admin
async function verifyAdmin(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) return null

  const token = authHeader.replace('Bearer ', '')
  const supabase = getAdminClient()

  const { data: { user }, error } = await supabase.auth.getUser(token)
  if (error || !user) return null

  // Check admin role
  const { data: roles } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .in('role', ['admin', 'moderator'])

  if (!roles || roles.length === 0) return null

  return { user, isGovernmentAdmin: roles.some(r => r.role === 'admin') }
}

// GET - List all users with their roles
export async function GET(req: NextRequest) {
  const admin = await verifyAdmin(req)
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  const supabase = getAdminClient()

  // Get all users from auth
  const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers()
  if (usersError) {
    return NextResponse.json({ error: usersError.message }, { status: 500 })
  }

  // Get all profiles
  const { data: profiles } = await supabase.from('profiles').select('*')
  const profileMap = new Map(profiles?.map(p => [p.id, p]) || [])

  // Get all active roles
  const { data: roles } = await supabase
    .from('user_roles')
    .select('*')
    .eq('is_active', true)

  const roleMap = new Map<string, string[]>()
  roles?.forEach(r => {
    const existing = roleMap.get(r.user_id) || []
    existing.push(r.role)
    roleMap.set(r.user_id, existing)
  })

  const userList = users.map(u => ({
    id: u.id,
    email: u.email,
    created_at: u.created_at,
    last_sign_in_at: u.last_sign_in_at,
    full_name: profileMap.get(u.id)?.full_name || u.user_metadata?.full_name || null,
    is_verified: profileMap.get(u.id)?.is_verified || false,
    roles: roleMap.get(u.id) || [],
  }))

  return NextResponse.json({ users: userList })
}

// POST - Create a new user or manage roles
export async function POST(req: NextRequest) {
  const admin = await verifyAdmin(req)
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  const body = await req.json()
  const { action } = body
  const supabase = getAdminClient()

  // Create new user
  if (action === 'create_user') {
    const { email, password, full_name } = body

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }

    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: full_name || '' },
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ user: data.user })
  }

  // Assign role
  if (action === 'assign_role') {
    if (!admin.isGovernmentAdmin) {
      return NextResponse.json({ error: 'Only government admins can assign roles' }, { status: 403 })
    }

    const { user_id, role } = body
    if (!user_id || !role) {
      return NextResponse.json({ error: 'user_id and role are required' }, { status: 400 })
    }

    if (!['admin', 'moderator', 'facilitator'].includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
    }

    // Check if role already exists
    const { data: existing } = await supabase
      .from('user_roles')
      .select('id, is_active')
      .eq('user_id', user_id)
      .eq('role', role)
      .eq('scope', 'platform')
      .maybeSingle()

    if (existing?.is_active) {
      return NextResponse.json({ error: 'User already has this role' }, { status: 400 })
    }

    let error
    if (existing) {
      // Reactivate existing role
      ({ error } = await supabase
        .from('user_roles')
        .update({ is_active: true, granted_by: admin.user.id, granted_at: new Date().toISOString() })
        .eq('id', existing.id))
    } else {
      // Insert new role
      ({ error } = await supabase
        .from('user_roles')
        .insert({
          user_id,
          role,
          scope: 'platform',
          granted_by: admin.user.id,
          is_active: true,
        }))
    }

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  }

  // Remove role
  if (action === 'remove_role') {
    if (!admin.isGovernmentAdmin) {
      return NextResponse.json({ error: 'Only government admins can remove roles' }, { status: 403 })
    }

    const { user_id, role } = body
    if (!user_id || !role) {
      return NextResponse.json({ error: 'user_id and role are required' }, { status: 400 })
    }

    const { error } = await supabase
      .from('user_roles')
      .update({ is_active: false })
      .eq('user_id', user_id)
      .eq('role', role)
      .eq('is_active', true)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  }

  // Delete user
  if (action === 'delete_user') {
    if (!admin.isGovernmentAdmin) {
      return NextResponse.json({ error: 'Only government admins can delete users' }, { status: 403 })
    }

    const { user_id } = body
    if (!user_id) {
      return NextResponse.json({ error: 'user_id is required' }, { status: 400 })
    }

    // Prevent self-deletion
    if (user_id === admin.user.id) {
      return NextResponse.json({ error: 'Cannot delete your own account' }, { status: 400 })
    }

    const { error } = await supabase.auth.admin.deleteUser(user_id)
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
}
