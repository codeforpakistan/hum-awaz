'use client'

import { useState, useEffect } from 'react'
import { useAuth } from './auth-context'
import { supabase } from './supabase'

export function useAdmin() {
  const { user, loading: authLoading } = useAuth()
  const [isAdmin, setIsAdmin] = useState(false)
  const [isGovernmentAdmin, setIsGovernmentAdmin] = useState(false)
  const [adminLoading, setAdminLoading] = useState(true)

  useEffect(() => {
    if (authLoading) return

    if (!user) {
      setIsAdmin(false)
      setIsGovernmentAdmin(false)
      setAdminLoading(false)
      return
    }

    const checkAdminRole = async () => {
      try {
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .eq('is_active', true)
          .in('role', ['admin', 'moderator'])

        if (error) {
          console.error('Error checking admin role:', error)
          setIsAdmin(false)
          setIsGovernmentAdmin(false)
        } else if (data && data.length > 0) {
          setIsAdmin(true)
          setIsGovernmentAdmin(data.some(r => r.role === 'admin'))
        } else {
          setIsAdmin(false)
          setIsGovernmentAdmin(false)
        }
      } catch (err) {
        console.error('Error checking admin role:', err)
      } finally {
        setAdminLoading(false)
      }
    }

    checkAdminRole()
  }, [user, authLoading])

  return { isAdmin, isGovernmentAdmin, loading: authLoading || adminLoading }
}
