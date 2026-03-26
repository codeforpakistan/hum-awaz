'use client'

import { useEffect, useState, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { useLanguage } from '@/components/language-provider'
import { supabase, Proposal } from '@/lib/supabase'
import { toast } from 'sonner'
import { CheckCircle, XCircle, Clock, Eye, Filter } from 'lucide-react'
import Link from 'next/link'

interface ProposalWithProcess extends Proposal {
  process_title?: string
  author_name?: string
}

type StatusFilter = 'all' | 'under_review' | 'pending' | 'approved' | 'rejected' | 'implemented'

export default function AdminProposalsPage() {
  const { t } = useLanguage()
  const [proposals, setProposals] = useState<ProposalWithProcess[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('under_review')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [actionDialog, setActionDialog] = useState<{ type: 'approve' | 'reject' | 'status'; proposalId?: string } | null>(null)
  const [reason, setReason] = useState('')
  const [newStatus, setNewStatus] = useState('')
  const [actionLoading, setActionLoading] = useState(false)

  const fetchProposals = useCallback(async () => {
    setLoading(true)
    try {
      let query = supabase
        .from('proposals')
        .select('*')
        .order('created_at', { ascending: false })

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter)
      }

      const { data, error } = await query

      if (error) {
        console.error('Error fetching proposals:', error)
        return
      }

      if (data && data.length > 0) {
        // Fetch process titles
        const processIds = [...new Set(data.map(p => p.process_id))]
        const { data: processData } = await supabase
          .from('processes')
          .select('id, title')
          .in('id', processIds)
        const processMap = new Map(processData?.map(p => [p.id, p.title]) || [])

        // Fetch author names
        const authorIds = [...new Set(data.map(p => p.author_id))]
        const { data: profileData } = await supabase
          .from('profiles')
          .select('id, full_name, username')
          .in('id', authorIds)
        const authorMap = new Map(profileData?.map(p => [p.id, p.full_name || p.username || 'Unknown']) || [])

        setProposals(data.map(p => ({
          ...p,
          process_title: processMap.get(p.process_id),
          author_name: authorMap.get(p.author_id),
        })))
      } else {
        setProposals([])
      }
    } catch (error) {
      console.error('Error fetching proposals:', error)
    } finally {
      setLoading(false)
    }
  }, [statusFilter])

  useEffect(() => {
    fetchProposals()
  }, [fetchProposals])

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleSelectAll = () => {
    if (selectedIds.size === proposals.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(proposals.map(p => p.id)))
    }
  }

  const handleApprove = async (ids: string[]) => {
    setActionLoading(true)
    try {
      const { data, error } = await supabase.rpc('bulk_approve_proposals', {
        proposal_ids: ids,
        admin_reason: reason || null,
      })

      if (error) {
        console.error('RPC bulk_approve_proposals error:', error)
        toast.error(error.message || t('common.error'))
        return
      }

      const failures = data?.filter((r: { success: boolean }) => !r.success) || []
      if (failures.length > 0) {
        console.error('Some proposals failed to approve:', failures)
        toast.error(`${failures.length} proposal(s) could not be approved`)
      } else {
        toast.success(t('admin.proposalsApproved'))
      }

      setSelectedIds(new Set())
      setActionDialog(null)
      setReason('')
      fetchProposals()
    } catch (error) {
      console.error('Error approving proposals:', error)
      toast.error(t('common.error'))
    } finally {
      setActionLoading(false)
    }
  }

  const handleReject = async (ids: string[]) => {
    if (!reason.trim()) {
      toast.error(t('admin.reasonRequired'))
      return
    }
    setActionLoading(true)
    try {
      const { data, error } = await supabase.rpc('bulk_reject_proposals', {
        proposal_ids: ids,
        rejection_reason: reason,
      })

      if (error) {
        console.error('RPC bulk_reject_proposals error:', error)
        toast.error(error.message || t('common.error'))
        return
      }

      const failures = data?.filter((r: { success: boolean }) => !r.success) || []
      if (failures.length > 0) {
        console.error('Some proposals failed to reject:', failures)
        toast.error(`${failures.length} proposal(s) could not be rejected`)
      } else {
        toast.success(t('admin.proposalsRejected'))
      }

      setSelectedIds(new Set())
      setActionDialog(null)
      setReason('')
      fetchProposals()
    } catch (error) {
      console.error('Error rejecting proposals:', error)
      toast.error(t('common.error'))
    } finally {
      setActionLoading(false)
    }
  }

  const handleStatusChange = async (id: string, status: string) => {
    setActionLoading(true)
    try {
      const { error } = await supabase.rpc('admin_change_proposal_status', {
        proposal_id: id,
        new_status: status,
        reason: reason || null,
      })

      if (error) {
        console.error('RPC admin_change_proposal_status error:', error)
        toast.error(error.message || t('common.error'))
        return
      }

      toast.success(t('admin.statusUpdated'))
      setActionDialog(null)
      setReason('')
      setNewStatus('')
      fetchProposals()
    } catch (error) {
      console.error('Error changing status:', error)
      toast.error(t('common.error'))
    } finally {
      setActionLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: 'default' | 'secondary' | 'outline' | 'destructive'; className: string }> = {
      under_review: { variant: 'secondary', className: 'bg-amber-100 text-amber-800 border-amber-200' },
      pending: { variant: 'outline', className: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
      approved: { variant: 'default', className: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
      rejected: { variant: 'destructive', className: 'bg-red-100 text-red-800 border-red-200' },
      implemented: { variant: 'default', className: 'bg-blue-100 text-blue-800 border-blue-200' },
    }
    const config = variants[status] || { variant: 'outline' as const, className: '' }
    return <Badge variant="outline" className={config.className}>{t(`status.${status}`) || status}</Badge>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t('admin.proposalManagement')}</h1>
          <p className="text-muted-foreground">{t('admin.proposalManagementDesc')}</p>
        </div>
      </div>

      {/* Filters and bulk actions */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v as StatusFilter); setSelectedIds(new Set()) }}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder={t('admin.filterByStatus')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('admin.allStatuses')}</SelectItem>
              <SelectItem value="under_review">{t('admin.underReview')}</SelectItem>
              <SelectItem value="pending">{t('status.pending')}</SelectItem>
              <SelectItem value="approved">{t('status.approved')}</SelectItem>
              <SelectItem value="rejected">{t('status.rejected')}</SelectItem>
              <SelectItem value="implemented">{t('admin.implemented')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {selectedIds.size > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {selectedIds.size} {t('admin.selected')}
            </span>
            <Button
              size="sm"
              variant="default"
              className="bg-emerald-600 hover:bg-emerald-700"
              onClick={() => setActionDialog({ type: 'approve' })}
            >
              <CheckCircle className="h-4 w-4 mr-1" />
              {t('admin.approveSelected')}
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => setActionDialog({ type: 'reject' })}
            >
              <XCircle className="h-4 w-4 mr-1" />
              {t('admin.rejectSelected')}
            </Button>
          </div>
        )}
      </div>

      {/* Proposals table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-muted-foreground">{t('common.loading')}</div>
          ) : proposals.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">{t('admin.noProposals')}</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="p-3 text-left w-10">
                      <Checkbox
                        checked={selectedIds.size === proposals.length && proposals.length > 0}
                        onCheckedChange={toggleSelectAll}
                      />
                    </th>
                    <th className="p-3 text-left text-sm font-medium">{t('admin.proposalTitle')}</th>
                    <th className="p-3 text-left text-sm font-medium hidden md:table-cell">{t('admin.process')}</th>
                    <th className="p-3 text-left text-sm font-medium hidden lg:table-cell">{t('admin.author')}</th>
                    <th className="p-3 text-left text-sm font-medium">{t('admin.status')}</th>
                    <th className="p-3 text-left text-sm font-medium hidden md:table-cell">{t('admin.votes')}</th>
                    <th className="p-3 text-left text-sm font-medium">{t('admin.actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {proposals.map((proposal) => (
                    <tr key={proposal.id} className="border-b hover:bg-muted/30 transition-colors">
                      <td className="p-3">
                        <Checkbox
                          checked={selectedIds.has(proposal.id)}
                          onCheckedChange={() => toggleSelect(proposal.id)}
                        />
                      </td>
                      <td className="p-3">
                        <div>
                          <p className="text-sm font-medium">{proposal.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(proposal.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </td>
                      <td className="p-3 hidden md:table-cell">
                        <span className="text-sm text-muted-foreground">{proposal.process_title || '-'}</span>
                      </td>
                      <td className="p-3 hidden lg:table-cell">
                        <span className="text-sm text-muted-foreground">{proposal.author_name || '-'}</span>
                      </td>
                      <td className="p-3">{getStatusBadge(proposal.status)}</td>
                      <td className="p-3 hidden md:table-cell">
                        <span className="text-sm">{proposal.vote_count} ({proposal.support_percentage}%)</span>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            asChild
                          >
                            <Link href={`/processes/${proposal.process_id}`}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                          {(proposal.status === 'under_review' || proposal.status === 'pending') && (
                            <>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                                onClick={() => { setSelectedIds(new Set([proposal.id])); setActionDialog({ type: 'approve' }) }}
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                onClick={() => { setSelectedIds(new Set([proposal.id])); setActionDialog({ type: 'reject' }) }}
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => { setActionDialog({ type: 'status', proposalId: proposal.id }); setNewStatus(proposal.status) }}
                          >
                            <Clock className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action dialog */}
      <Dialog open={!!actionDialog} onOpenChange={(open) => { if (!open) { setActionDialog(null); setReason(''); setNewStatus('') } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionDialog?.type === 'approve' && t('admin.approveProposals')}
              {actionDialog?.type === 'reject' && t('admin.rejectProposals')}
              {actionDialog?.type === 'status' && t('admin.changeStatus')}
            </DialogTitle>
            <DialogDescription>
              {actionDialog?.type === 'approve' && t('admin.approveConfirm')}
              {actionDialog?.type === 'reject' && t('admin.rejectConfirm')}
              {actionDialog?.type === 'status' && t('admin.statusConfirm')}
            </DialogDescription>
          </DialogHeader>

          {actionDialog?.type === 'status' && (
            <Select value={newStatus} onValueChange={setNewStatus}>
              <SelectTrigger>
                <SelectValue placeholder={t('admin.selectStatus')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="under_review">{t('admin.underReview')}</SelectItem>
                <SelectItem value="approved">{t('status.approved')}</SelectItem>
                <SelectItem value="rejected">{t('status.rejected')}</SelectItem>
                <SelectItem value="implemented">{t('admin.implemented')}</SelectItem>
              </SelectContent>
            </Select>
          )}

          <Textarea
            placeholder={actionDialog?.type === 'reject' ? t('admin.rejectReasonPlaceholder') : t('admin.reasonPlaceholder')}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
          />

          <DialogFooter>
            <Button variant="outline" onClick={() => { setActionDialog(null); setReason(''); setNewStatus('') }}>
              {t('common.cancel')}
            </Button>
            <Button
              disabled={actionLoading}
              variant={actionDialog?.type === 'reject' ? 'destructive' : 'default'}
              className={actionDialog?.type === 'approve' ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
              onClick={() => {
                if (actionDialog?.type === 'approve') {
                  handleApprove([...selectedIds])
                } else if (actionDialog?.type === 'reject') {
                  handleReject([...selectedIds])
                } else if (actionDialog?.type === 'status' && actionDialog.proposalId && newStatus) {
                  handleStatusChange(actionDialog.proposalId, newStatus)
                }
              }}
            >
              {actionLoading ? t('common.loading') : t('common.submit')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
