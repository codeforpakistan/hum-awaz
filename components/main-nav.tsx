'use client'

import Link from 'next/link'
import { useLanguage } from './language-provider'
import { useAuth } from '@/lib/auth-context'
import { Button } from './ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu'
import { User, LogOut } from 'lucide-react'

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
          <DropdownMenuContent align="end">
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
