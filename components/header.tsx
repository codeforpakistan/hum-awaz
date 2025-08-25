'use client'

import Link from 'next/link'
import { Vote } from 'lucide-react'
import { MainNav } from './main-nav'
import { LanguageSwitcher } from './language-switcher'
import { Button } from './ui/button'
import { useAuth } from '@/lib/auth-context'
import { useLanguage } from './language-provider'

export function Header() {
  const { user } = useAuth()
  const { t } = useLanguage()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-4 md:gap-6">
          <Link href="/" className="flex items-center space-x-2">
            <Vote className="h-6 w-6 text-emerald-600" />
            <span className="font-bold text-xl">hum awaz</span>
          </Link>
          <MainNav />
        </div>
        
        <div className="flex items-center gap-2 md:gap-4">
          <LanguageSwitcher />
          
          {/* Desktop Auth Buttons */}
          {!user && (
            <div className="hidden md:flex items-center gap-2">
              <Button asChild variant="outline" size="sm">
                <Link href="/login">{t('common.login')}</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/register">{t('common.register')}</Link>
              </Button>
            </div>
          )}
          
          {/* Mobile shows user dashboard or auth in the mobile menu */}
          {user && (
            <div className="hidden md:block">
              <Button asChild variant="outline" size="sm">
                <Link href="/dashboard">Dashboard</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}