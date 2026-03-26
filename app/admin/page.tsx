'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useLanguage } from '@/components/language-provider'
import { supabase } from '@/lib/supabase'
import { FileText, Settings, Users, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react'

interface DashboardStats {
  totalProcesses: number
  activeProcesses: number
  draftProcesses: number
  closedProcesses: number
  totalProposals: number
  pendingProposals: number
  approvedProposals: number
  rejectedProposals: number
  underReviewProposals: number
  totalUsers: number
  totalVotes: number
}

interface RecentProposal {
  id: string
  title: string
  status: string
  created_at: string
  process_title?: string
}

export default function AdminDashboardPage() {
  const { t } = useLanguage()
  const [stats, setStats] = useState<DashboardStats>({
    totalProcesses: 0, activeProcesses: 0, draftProcesses: 0, closedProcesses: 0,
    totalProposals: 0, pendingProposals: 0, approvedProposals: 0, rejectedProposals: 0,
    underReviewProposals: 0, totalUsers: 0, totalVotes: 0,
  })
  const [recentProposals, setRecentProposals] = useState<RecentProposal[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      // Fetch process stats
      const { data: processes } = await supabase.from('processes').select('status')
      const processStats = {
        totalProcesses: processes?.length || 0,
        activeProcesses: processes?.filter(p => p.status === 'active').length || 0,
        draftProcesses: processes?.filter(p => p.status === 'draft').length || 0,
        closedProcesses: processes?.filter(p => p.status === 'closed' || p.status === 'completed').length || 0,
      }

      // Fetch proposal stats
      const { data: proposals } = await supabase.from('proposals').select('status')
      const proposalStats = {
        totalProposals: proposals?.length || 0,
        pendingProposals: proposals?.filter(p => p.status === 'pending').length || 0,
        approvedProposals: proposals?.filter(p => p.status === 'approved').length || 0,
        rejectedProposals: proposals?.filter(p => p.status === 'rejected').length || 0,
        underReviewProposals: proposals?.filter(p => p.status === 'under_review').length || 0,
      }

      // Fetch user count
      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })

      // Fetch vote count
      const { count: totalVotes } = await supabase
        .from('votes')
        .select('*', { count: 'exact', head: true })

      setStats({
        ...processStats,
        ...proposalStats,
        totalUsers: totalUsers || 0,
        totalVotes: totalVotes || 0,
      })

      // Fetch recent proposals needing review
      const { data: recent } = await supabase
        .from('proposals')
        .select('id, title, status, created_at, process_id')
        .in('status', ['under_review', 'pending'])
        .order('created_at', { ascending: false })
        .limit(5)

      if (recent && recent.length > 0) {
        // Fetch process titles for these proposals
        const processIds = [...new Set(recent.map(p => p.process_id))]
        const { data: processData } = await supabase
          .from('processes')
          .select('id, title')
          .in('id', processIds)

        const processMap = new Map(processData?.map(p => [p.id, p.title]) || [])

        setRecentProposals(recent.map(p => ({
          id: p.id,
          title: p.title,
          status: p.status,
          created_at: p.created_at,
          process_title: processMap.get(p.process_id),
        })))
      }
    } catch (error) {
      console.error('Error fetching admin stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2"><div className="h-4 w-24 bg-muted animate-pulse rounded" /></CardHeader>
              <CardContent><div className="h-8 w-16 bg-muted animate-pulse rounded" /></CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t('admin.dashboardTitle')}</h1>
        <p className="text-muted-foreground">{t('admin.dashboardDescription')}</p>
      </div>

      {/* Key metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('admin.pendingReview')}</CardTitle>
            <AlertCircle className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.underReviewProposals + stats.pendingProposals}</div>
            <p className="text-xs text-muted-foreground">{t('admin.proposalsAwaitingAction')}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('admin.activeProcesses')}</CardTitle>
            <Settings className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeProcesses}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalProcesses} {t('admin.total')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('admin.totalProposals')}</CardTitle>
            <FileText className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProposals}</div>
            <p className="text-xs text-muted-foreground">
              {stats.approvedProposals} {t('admin.approved')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('admin.totalUsers')}</CardTitle>
            <Users className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalVotes} {t('admin.votesCast')}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Proposal & Process breakdown */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t('admin.proposalBreakdown')}</CardTitle>
            <CardDescription>{t('admin.proposalBreakdownDesc')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-amber-500" />
                  <span className="text-sm">{t('admin.underReview')}</span>
                </div>
                <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                  {stats.underReviewProposals}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm">{t('status.pending')}</span>
                </div>
                <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                  {stats.pendingProposals}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-500" />
                  <span className="text-sm">{t('status.approved')}</span>
                </div>
                <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                  {stats.approvedProposals}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <XCircle className="h-4 w-4 text-red-500" />
                  <span className="text-sm">{t('status.rejected')}</span>
                </div>
                <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                  {stats.rejectedProposals}
                </Badge>
              </div>
            </div>
            <Button asChild className="w-full mt-4" variant="outline">
              <Link href="/admin/proposals">{t('admin.manageProposals')}</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('admin.processBreakdown')}</CardTitle>
            <CardDescription>{t('admin.processBreakdownDesc')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">{t('status.draft')}</span>
                </div>
                <Badge variant="outline">{stats.draftProcesses}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-500" />
                  <span className="text-sm">{t('status.active')}</span>
                </div>
                <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                  {stats.activeProcesses}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <XCircle className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">{t('status.closed')}/{t('status.completed')}</span>
                </div>
                <Badge variant="outline">{stats.closedProcesses}</Badge>
              </div>
            </div>
            <Button asChild className="w-full mt-4" variant="outline">
              <Link href="/admin/processes">{t('admin.manageProcesses')}</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent proposals needing review */}
      {recentProposals.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{t('admin.recentPendingProposals')}</CardTitle>
            <CardDescription>{t('admin.recentPendingDesc')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentProposals.map((proposal) => (
                <div key={proposal.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{proposal.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {proposal.process_title} &middot; {new Date(proposal.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge variant={proposal.status === 'under_review' ? 'secondary' : 'outline'}>
                    {proposal.status === 'under_review' ? t('admin.underReview') : t('status.pending')}
                  </Badge>
                </div>
              ))}
            </div>
            <Button asChild className="w-full mt-4">
              <Link href="/admin/proposals">{t('admin.reviewAll')}</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
