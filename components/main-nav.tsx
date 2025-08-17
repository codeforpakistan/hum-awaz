'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useLanguage } from './language-provider'
import { useAuth } from '@/lib/auth-context'
import { Button } from './ui/button'
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu'
import { User, LogOut, BarChart3, Menu } from 'lucide-react'

export function MainNav() {
  const { t } = useLanguage()
  const { user, signOut } = useAuth()
  const [isOpen, setIsOpen] = useState(false)

  const handleSignOut = async () => {
    await signOut()
  }

  const navLinks = [
    { href: '/', label: t('nav.home') },
    { href: '/processes', label: t('nav.processes') },
    { href: '/proposals', label: t('nav.proposals') },
    { href: '/budgets', label: t('nav.budgets') },
    { href: '/discussions', label: t('nav.discussions') },
    { href: '/about', label: t('nav.about') },
  ]

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden md:flex items-center space-x-6">
        {navLinks.map((link) => (
          <Link 
            key={link.href}
            href={link.href} 
            className="text-sm font-medium transition-colors hover:text-primary"
          >
            {link.label}
          </Link>
        ))}
        
        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span className="hidden lg:inline-block truncate max-w-32">
                  {user.email}
                </span>
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
        )}
      </nav>

      {/* Mobile Navigation */}
      <div className="md:hidden">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="sm" className="px-2">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-80">
            <div className="flex flex-col space-y-4 mt-8">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-lg font-medium transition-colors hover:text-primary px-4 py-2 rounded-md hover:bg-muted"
                  onClick={() => setIsOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              
              {user ? (
                <>
                  <div className="border-t pt-4 mt-4">
                    <div className="px-4 py-2 text-sm text-muted-foreground">
                      {user.email}
                    </div>
                    <Link
                      href="/profile"
                      className="flex items-center gap-3 text-lg font-medium px-4 py-2 rounded-md hover:bg-muted transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      <User className="h-5 w-5" />
                      Profile Settings
                    </Link>
                    <Link
                      href="/dashboard"
                      className="flex items-center gap-3 text-lg font-medium px-4 py-2 rounded-md hover:bg-muted transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      <BarChart3 className="h-5 w-5" />
                      My Dashboard
                    </Link>
                    <Button
                      variant="ghost"
                      className="w-full justify-start gap-3 text-lg font-medium px-4 py-2 h-auto mt-2"
                      onClick={() => {
                        handleSignOut()
                        setIsOpen(false)
                      }}
                    >
                      <LogOut className="h-5 w-5" />
                      {t('common.logout')}
                    </Button>
                  </div>
                </>
              ) : (
                <div className="border-t pt-4 mt-4 space-y-2">
                  <Link href="/login" onClick={() => setIsOpen(false)}>
                    <Button variant="outline" className="w-full">
                      {t('common.login')}
                    </Button>
                  </Link>
                  <Link href="/register" onClick={() => setIsOpen(false)}>
                    <Button className="w-full">
                      {t('common.register')}
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  )
}
