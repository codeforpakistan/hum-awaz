'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { useAdmin } from '@/lib/use-admin'
import { useLanguage } from '@/components/language-provider'
import { LanguageSwitcher } from '@/components/language-switcher'
import { Vote, LayoutDashboard, FileText, Settings, Shield, ArrowLeft, Users } from 'lucide-react'
import { cn } from '@/lib/utils'

const sidebarLinks = [
  { href: '/admin', icon: LayoutDashboard, labelKey: 'admin.overview' },
  { href: '/admin/proposals', icon: FileText, labelKey: 'admin.proposals' },
  { href: '/admin/processes', icon: Settings, labelKey: 'admin.processes' },
  { href: '/admin/users', icon: Users, labelKey: 'admin.users' },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth()
  const { isAdmin, loading: adminLoading } = useAdmin()
  const { t } = useLanguage()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!authLoading && !adminLoading) {
      if (!user) {
        router.push('/login')
      } else if (!isAdmin) {
        router.push('/dashboard')
      }
    }
  }, [user, isAdmin, authLoading, adminLoading, router])

  if (authLoading || adminLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-emerald-600 mx-auto" />
          <p className="mt-4 text-muted-foreground">{t('common.loading')}</p>
        </div>
      </div>
    )
  }

  if (!user || !isAdmin) return null

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="hidden md:flex w-64 flex-col border-r bg-muted/30">
        <div className="flex h-16 items-center gap-2 border-b px-6">
          <Shield className="h-5 w-5 text-emerald-600" />
          <span className="font-bold text-lg">{t('admin.title')}</span>
        </div>

        <nav className="flex-1 space-y-1 p-4">
          {sidebarLinks.map((link) => {
            const Icon = link.icon
            const isActive = pathname === link.href
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-emerald-100 text-emerald-900 dark:bg-emerald-900/20 dark:text-emerald-100'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                <Icon className="h-4 w-4" />
                {t(link.labelKey)}
              </Link>
            )
          })}
        </nav>

        <div className="border-t p-4">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            {t('admin.backToDashboard')}
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        <header className="sticky top-0 z-50 flex h-16 items-center justify-between border-b bg-background/95 backdrop-blur px-6">
          <div className="flex items-center gap-4">
            {/* Mobile nav */}
            <div className="md:hidden flex items-center gap-2">
              <Shield className="h-5 w-5 text-emerald-600" />
              <span className="font-bold">{t('admin.title')}</span>
            </div>
            {/* Mobile links */}
            <nav className="md:hidden flex items-center gap-2">
              {sidebarLinks.map((link) => {
                const Icon = link.icon
                const isActive = pathname === link.href
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      'rounded-md p-2 transition-colors',
                      isActive ? 'bg-emerald-100 text-emerald-900' : 'text-muted-foreground hover:bg-muted'
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </Link>
                )
              })}
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            <Link href="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
              <Vote className="h-4 w-4 text-emerald-600" />
              Hum Awaz
            </Link>
          </div>
        </header>

        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
