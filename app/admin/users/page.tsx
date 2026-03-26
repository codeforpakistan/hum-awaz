'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useLanguage } from '@/components/language-provider'
import { useAuth } from '@/lib/auth-context'
import { useAdmin } from '@/lib/use-admin'
import { toast } from 'sonner'
import { UserPlus, Shield, ShieldOff, Trash2, Search } from 'lucide-react'

interface UserEntry {
  id: string
  email: string
  full_name: string | null
  created_at: string
  last_sign_in_at: string | null
  is_verified: boolean
  roles: string[]
}

export default function AdminUsersPage() {
  const { t } = useLanguage()
  const { user } = useAuth()
  const { isGovernmentAdmin } = useAdmin()
  const [users, setUsers] = useState<UserEntry[]>([])
  const [filteredUsers, setFilteredUsers] = useState<UserEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  // Create user dialog
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [newEmail, setNewEmail] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [newFullName, setNewFullName] = useState('')
  const [createLoading, setCreateLoading] = useState(false)

  // Role dialog
  const [roleDialog, setRoleDialog] = useState<{ userId: string; userName: string; action: 'assign' | 'remove' } | null>(null)
  const [selectedRole, setSelectedRole] = useState('')
  const [roleLoading, setRoleLoading] = useState(false)

  // Delete dialog
  const [deleteDialog, setDeleteDialog] = useState<{ userId: string; userName: string } | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const getAuthHeaders = async () => {
    const session = await fetch('/api/admin/users', { method: 'HEAD' }).catch(() => null)
    // Get token from supabase client
    const { supabase } = await import('@/lib/supabase')
    const { data: { session: s } } = await supabase.auth.getSession()
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${s?.access_token}`,
    }
  }

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const headers = await getAuthHeaders()
      const res = await fetch('/api/admin/users', { headers })
      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error || t('common.error'))
        return
      }

      setUsers(data.users)
      setFilteredUsers(data.users)
    } catch (error) {
      console.error('Error fetching users:', error)
      toast.error(t('common.error'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  useEffect(() => {
    if (!search.trim()) {
      setFilteredUsers(users)
    } else {
      const q = search.toLowerCase()
      setFilteredUsers(users.filter(u =>
        u.email?.toLowerCase().includes(q) ||
        u.full_name?.toLowerCase().includes(q)
      ))
    }
  }, [search, users])

  const handleCreateUser = async () => {
    if (!newEmail || !newPassword) {
      toast.error(t('admin.emailPasswordRequired'))
      return
    }
    setCreateLoading(true)
    try {
      const headers = await getAuthHeaders()
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          action: 'create_user',
          email: newEmail,
          password: newPassword,
          full_name: newFullName,
        }),
      })
      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error || t('common.error'))
        return
      }

      toast.success(t('admin.userCreated'))
      setShowCreateDialog(false)
      setNewEmail('')
      setNewPassword('')
      setNewFullName('')
      fetchUsers()
    } catch (error) {
      console.error('Error creating user:', error)
      toast.error(t('common.error'))
    } finally {
      setCreateLoading(false)
    }
  }

  const handleRoleAction = async () => {
    if (!roleDialog || !selectedRole) return
    setRoleLoading(true)
    try {
      const headers = await getAuthHeaders()
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          action: roleDialog.action === 'assign' ? 'assign_role' : 'remove_role',
          user_id: roleDialog.userId,
          role: selectedRole,
        }),
      })
      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error || t('common.error'))
        return
      }

      toast.success(roleDialog.action === 'assign' ? t('admin.roleAssigned') : t('admin.roleRemoved'))
      setRoleDialog(null)
      setSelectedRole('')
      fetchUsers()
    } catch (error) {
      console.error('Error managing role:', error)
      toast.error(t('common.error'))
    } finally {
      setRoleLoading(false)
    }
  }

  const handleDeleteUser = async () => {
    if (!deleteDialog) return
    setDeleteLoading(true)
    try {
      const headers = await getAuthHeaders()
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          action: 'delete_user',
          user_id: deleteDialog.userId,
        }),
      })
      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error || t('common.error'))
        return
      }

      toast.success(t('admin.userDeleted'))
      setDeleteDialog(null)
      fetchUsers()
    } catch (error) {
      console.error('Error deleting user:', error)
      toast.error(t('common.error'))
    } finally {
      setDeleteLoading(false)
    }
  }

  const getRoleBadge = (role: string) => {
    const styles: Record<string, string> = {
      government_admin: 'bg-purple-100 text-purple-800 border-purple-200',
      moderator: 'bg-blue-100 text-blue-800 border-blue-200',
      facilitator: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    }
    const labels: Record<string, string> = {
      government_admin: t('admin.govAdmin'),
      moderator: t('admin.moderator'),
      facilitator: t('admin.facilitator'),
    }
    return (
      <Badge key={role} variant="outline" className={styles[role] || ''}>
        {labels[role] || role}
      </Badge>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t('admin.userManagement')}</h1>
          <p className="text-muted-foreground">{t('admin.userManagementDesc')}</p>
        </div>
        {isGovernmentAdmin && (
          <Button onClick={() => setShowCreateDialog(true)} className="bg-emerald-600 hover:bg-emerald-700">
            <UserPlus className="h-4 w-4 mr-2" />
            {t('admin.createUser')}
          </Button>
        )}
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={t('admin.searchUsers')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Users table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-muted-foreground">{t('common.loading')}</div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">{t('admin.noUsersFound')}</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="p-3 text-left text-sm font-medium">{t('admin.userName')}</th>
                    <th className="p-3 text-left text-sm font-medium">{t('admin.userEmail')}</th>
                    <th className="p-3 text-left text-sm font-medium hidden md:table-cell">{t('admin.userRoles')}</th>
                    <th className="p-3 text-left text-sm font-medium hidden lg:table-cell">{t('admin.lastSignIn')}</th>
                    <th className="p-3 text-left text-sm font-medium">{t('admin.actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="border-b hover:bg-muted/30 transition-colors">
                      <td className="p-3">
                        <div>
                          <p className="text-sm font-medium">{u.full_name || '-'}</p>
                          <p className="text-xs text-muted-foreground md:hidden">{u.email}</p>
                        </div>
                      </td>
                      <td className="p-3">
                        <span className="text-sm">{u.email}</span>
                      </td>
                      <td className="p-3 hidden md:table-cell">
                        <div className="flex flex-wrap gap-1">
                          {u.roles.length > 0
                            ? u.roles.map(r => getRoleBadge(r))
                            : <span className="text-xs text-muted-foreground">{t('admin.citizen')}</span>
                          }
                        </div>
                      </td>
                      <td className="p-3 hidden lg:table-cell">
                        <span className="text-sm text-muted-foreground">
                          {u.last_sign_in_at ? new Date(u.last_sign_in_at).toLocaleDateString() : '-'}
                        </span>
                      </td>
                      <td className="p-3">
                        {isGovernmentAdmin && u.id !== user?.id && (
                          <div className="flex items-center gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                              title={t('admin.assignRole')}
                              onClick={() => setRoleDialog({ userId: u.id, userName: u.full_name || u.email || '', action: 'assign' })}
                            >
                              <Shield className="h-4 w-4" />
                            </Button>
                            {u.roles.length > 0 && (
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                                title={t('admin.removeRole')}
                                onClick={() => setRoleDialog({ userId: u.id, userName: u.full_name || u.email || '', action: 'remove' })}
                              >
                                <ShieldOff className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              title={t('admin.deleteUser')}
                              onClick={() => setDeleteDialog({ userId: u.id, userName: u.full_name || u.email || '' })}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create user dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('admin.createUser')}</DialogTitle>
            <DialogDescription>{t('admin.createUserDesc')}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{t('admin.fullName')}</Label>
              <Input
                value={newFullName}
                onChange={(e) => setNewFullName(e.target.value)}
                placeholder={t('admin.fullNamePlaceholder')}
              />
            </div>
            <div className="space-y-2">
              <Label>{t('admin.userEmail')}</Label>
              <Input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="user@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label>{t('admin.password')}</Label>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder={t('admin.passwordPlaceholder')}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              {t('common.cancel')}
            </Button>
            <Button onClick={handleCreateUser} disabled={createLoading} className="bg-emerald-600 hover:bg-emerald-700">
              {createLoading ? t('common.loading') : t('admin.createUser')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Role assignment/removal dialog */}
      <Dialog open={!!roleDialog} onOpenChange={(open) => { if (!open) { setRoleDialog(null); setSelectedRole('') } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {roleDialog?.action === 'assign' ? t('admin.assignRole') : t('admin.removeRole')}
            </DialogTitle>
            <DialogDescription>
              {roleDialog?.action === 'assign'
                ? t('admin.assignRoleDesc').replace('{user}', roleDialog?.userName || '')
                : t('admin.removeRoleDesc').replace('{user}', roleDialog?.userName || '')
              }
            </DialogDescription>
          </DialogHeader>
          <Select value={selectedRole} onValueChange={setSelectedRole}>
            <SelectTrigger>
              <SelectValue placeholder={t('admin.selectRole')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="government_admin">{t('admin.govAdmin')}</SelectItem>
              <SelectItem value="moderator">{t('admin.moderator')}</SelectItem>
              <SelectItem value="facilitator">{t('admin.facilitator')}</SelectItem>
            </SelectContent>
          </Select>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setRoleDialog(null); setSelectedRole('') }}>
              {t('common.cancel')}
            </Button>
            <Button onClick={handleRoleAction} disabled={roleLoading || !selectedRole}>
              {roleLoading ? t('common.loading') : t('common.submit')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete user dialog */}
      <Dialog open={!!deleteDialog} onOpenChange={(open) => { if (!open) setDeleteDialog(null) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('admin.deleteUser')}</DialogTitle>
            <DialogDescription>
              {t('admin.deleteUserConfirm').replace('{user}', deleteDialog?.userName || '')}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialog(null)}>
              {t('common.cancel')}
            </Button>
            <Button variant="destructive" onClick={handleDeleteUser} disabled={deleteLoading}>
              {deleteLoading ? t('common.loading') : t('admin.deleteUser')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
