'use client'

import Link from 'next/link'
import { useLanguage } from './language-provider'
import { useAuth } from '@/lib/auth-context'
import { Button } from './ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu'
import { User, LogOut, Settings, BarChart3 } from 'lucide-react'

export function MainNav() {
  const { t } = useLanguage()
  const { user, signOut } = useAuth()

  const handleSignOut = async () => {
    await signOut()
  }

  return (
    <nav className="flex items-center space-x-6">
      <Link href="/" className="text-sm font-medium transition-colors hover:text-primary">
        {t('nav.home')}
      </Link>
      <Link href="/processes" className="text-sm font-medium transition-colors hover:text-primary">
        {t('nav.processes')}
      </Link>
      <Link href="/proposals" className="text-sm font-medium transition-colors hover:text-primary">
        {t('nav.proposals')}
      </Link>
      <Link href="/discussions" className="text-sm font-medium transition-colors hover:text-primary">
        {t('nav.discussions')}
      </Link>
      <Link href="/about" className="text-sm font-medium transition-colors hover:text-primary">
        {t('nav.about')}
      </Link>
      
      {user ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              {user.email}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem asChild>
              <Link href="/profile" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Profile Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/dashboard" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                My Dashboard
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut} className="flex items-center gap-2">
              <LogOut className="h-4 w-4" />
              {t('common.logout')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : null}
    </nav>
  )
}
