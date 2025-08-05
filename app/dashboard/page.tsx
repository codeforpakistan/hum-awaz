'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { MainNav } from '@/components/main-nav'
import { LanguageSwitcher } from '@/components/language-switcher'
import { Footer } from '@/components/footer'
import { useAuth } from '@/lib/auth-context'
import { useLanguage } from '@/components/language-provider'
import { supabase, Process, Proposal, Profile } from '@/lib/supabase'
import { Vote, Users, Calendar, TrendingUp, FileText, MessageSquare } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function DashboardPage() {
  const { user, loading } = useAuth()
  const { t } = useLanguage()
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [processes, setProcesses] = useState<Process[]>([])
  const [proposals, setProposals] = useState<Proposal[]>([])
  const [stats, setStats] = useState({
    totalProcesses: 0,
    activeProcesses: 0,
    totalProposals: 0,
    totalVotes: 0
  })

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  useEffect(() => {
    if (user) {
      fetchDashboardData()
    }
  }, [user])

  const fetchDashboardData = async () => {
    if (!user) return
    try {
      // Fetch profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      
      if (profileData) {
        setProfile(profileData)
      }

      // Fetch processes
      const { data: processesData } = await supabase
        .from('processes')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(5)

      if (processesData) {
        setProcesses(processesData)
      }

      // Fetch user's proposals
      const { data: proposalsData } = await supabase
        .from('proposals')
        .select('*')
        .eq('author_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(5)

      if (proposalsData) {
        setProposals(proposalsData)
      }

      // Fetch stats
      const { count: totalProcesses } = await supabase
        .from('processes')
        .select('*', { count: 'exact', head: true })

      const { count: activeProcesses } = await supabase
        .from('processes')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active')

      const { count: totalProposals } = await supabase
        .from('proposals')
        .select('*', { count: 'exact', head: true })

      const { count: totalVotes } = await supabase
        .from('votes')
        .select('*', { count: 'exact', head: true })

      setStats({
        totalProcesses: totalProcesses || 0,
        activeProcesses: activeProcesses || 0,
        totalProposals: totalProposals || 0,
        totalVotes: totalVotes || 0
      })
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-4 text-lg">{t('common.loading')}</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center space-x-2">
              <Vote className="h-6 w-6 text-emerald-600" />
              <span className="font-bold text-xl">Hum Awaaz</span>
            </Link>
            <MainNav />
          </div>
          <div className="flex items-center gap-4">
            <LanguageSwitcher />
          </div>
        </div>
      </header>

      <main className="flex-1">
        <div className="container py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">Welcome back, {profile?.full_name || user.email}</p>
          </div>

          {/* Stats */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Processes</CardTitle>
                <Vote className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalProcesses}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.activeProcesses} active
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Proposals</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalProposals}</div>
                <p className="text-xs text-muted-foreground">
                  Community proposals
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Votes</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalVotes}</div>
                <p className="text-xs text-muted-foreground">
                  Cast by citizens
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Your Proposals</CardTitle>
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{proposals.length}</div>
                <p className="text-xs text-muted-foreground">
                  Submitted by you
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Recent Processes</CardTitle>
                <CardDescription>Latest democratic processes you can participate in</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {processes.map((process) => (
                    <div key={process.id} className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {process.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {process.category} • {process.organization || 'Government'}
                        </p>
                      </div>
                      <Badge variant="outline">{process.status}</Badge>
                    </div>
                  ))}
                  {processes.length === 0 && (
                    <p className="text-sm text-muted-foreground">No recent processes</p>
                  )}
                </div>
                <Button asChild className="w-full mt-4">
                  <Link href="/processes">View All Processes</Link>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Your Proposals</CardTitle>
                <CardDescription>Proposals you've submitted</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {proposals.map((proposal) => (
                    <div key={proposal.id} className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {proposal.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(proposal.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge variant={proposal.status === 'approved' ? 'default' : proposal.status === 'pending' ? 'outline' : 'secondary'}>
                        {proposal.status}
                      </Badge>
                    </div>
                  ))}
                  {proposals.length === 0 && (
                    <p className="text-sm text-muted-foreground">No proposals yet</p>
                  )}
                </div>
                <Button asChild className="w-full mt-4">
                  <Link href="/proposals">Create New Proposal</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
} 