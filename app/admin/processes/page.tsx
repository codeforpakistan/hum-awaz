'use client'

import { useEffect, useState, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { useLanguage } from '@/components/language-provider'
import { supabase, Process } from '@/lib/supabase'
import { toast } from 'sonner'
import { Eye, Settings, Filter, Users, Calendar } from 'lucide-react'
import Link from 'next/link'

type StatusFilter = 'all' | 'draft' | 'active' | 'closed' | 'completed'

export default function AdminProcessesPage() {
  const { t } = useLanguage()
  const [processes, setProcesses] = useState<Process[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [actionDialog, setActionDialog] = useState<{ processId: string; currentStatus: string } | null>(null)
  const [newStatus, setNewStatus] = useState('')
  const [reason, setReason] = useState('')
  const [actionLoading, setActionLoading] = useState(false)

  const fetchProcesses = useCallback(async () => {
    setLoading(true)
    try {
      let query = supabase
        .from('processes')
        .select('*')
        .order('created_at', { ascending: false })

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter)
      }

      const { data, error } = await query

      if (error) {
        console.error('Error fetching processes:', error)
        return
      }

      setProcesses(data || [])
    } catch (error) {
      console.error('Error fetching processes:', error)
    } finally {
      setLoading(false)
    }
  }, [statusFilter])

  useEffect(() => {
    fetchProcesses()
  }, [fetchProcesses])

  const handleStatusChange = async () => {
    if (!actionDialog || !newStatus) return
    setActionLoading(true)
    try {
      const { error } = await supabase.rpc('admin_change_process_status', {
        process_id: actionDialog.processId,
        new_status: newStatus,
        reason: reason || null,
      })

      if (error) {
        console.error('RPC admin_change_process_status error:', error)
        toast.error(error.message || t('common.error'))
        return
      }

      toast.success(t('admin.statusUpdated'))
      setActionDialog(null)
      setReason('')
      setNewStatus('')
      fetchProcesses()
    } catch (error) {
      console.error('Error changing status:', error)
      toast.error(t('common.error'))
    } finally {
      setActionLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      draft: 'bg-gray-100 text-gray-700 border-gray-200',
      active: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      closed: 'bg-red-100 text-red-800 border-red-200',
      completed: 'bg-blue-100 text-blue-800 border-blue-200',
    }
    return <Badge variant="outline" className={styles[status] || ''}>{t(`status.${status}`) || status}</Badge>
  }

  const getProgressPercent = (process: Process) => {
    const start = new Date(process.start_date).getTime()
    const end = new Date(process.end_date).getTime()
    const now = Date.now()
    if (now <= start) return 0
    if (now >= end) return 100
    return Math.round(((now - start) / (end - start)) * 100)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t('admin.processManagement')}</h1>
        <p className="text-muted-foreground">{t('admin.processManagementDesc')}</p>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder={t('admin.filterByStatus')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('admin.allStatuses')}</SelectItem>
            <SelectItem value="draft">{t('status.draft')}</SelectItem>
            <SelectItem value="active">{t('status.active')}</SelectItem>
            <SelectItem value="closed">{t('status.closed')}</SelectItem>
            <SelectItem value="completed">{t('status.completed')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Processes table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-muted-foreground">{t('common.loading')}</div>
          ) : processes.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">{t('admin.noProcesses')}</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="p-3 text-left text-sm font-medium">{t('admin.processTitle')}</th>
                    <th className="p-3 text-left text-sm font-medium hidden md:table-cell">{t('admin.category')}</th>
                    <th className="p-3 text-left text-sm font-medium">{t('admin.status')}</th>
                    <th className="p-3 text-left text-sm font-medium hidden md:table-cell">{t('admin.timeline')}</th>
                    <th className="p-3 text-left text-sm font-medium hidden lg:table-cell">{t('admin.participants')}</th>
                    <th className="p-3 text-left text-sm font-medium">{t('admin.actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {processes.map((process) => {
                    const progress = getProgressPercent(process)
                    return (
                      <tr key={process.id} className="border-b hover:bg-muted/30 transition-colors">
                        <td className="p-3">
                          <div>
                            <p className="text-sm font-medium">{process.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {process.scope} &middot; {process.process_type}
                            </p>
                          </div>
                        </td>
                        <td className="p-3 hidden md:table-cell">
                          <Badge variant="outline">{t(`categories.${process.category}`) || process.category}</Badge>
                        </td>
                        <td className="p-3">{getStatusBadge(process.status)}</td>
                        <td className="p-3 hidden md:table-cell">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Calendar className="h-3 w-3" />
                              {new Date(process.start_date).toLocaleDateString()} - {new Date(process.end_date).toLocaleDateString()}
                            </div>
                            <div className="w-full bg-muted rounded-full h-1.5">
                              <div
                                className="bg-emerald-500 h-1.5 rounded-full transition-all"
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="p-3 hidden lg:table-cell">
                          <div className="flex items-center gap-1 text-sm">
                            <Users className="h-3 w-3 text-muted-foreground" />
                            {process.participation_count}
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-1">
                            <Button size="sm" variant="ghost" asChild>
                              <Link href={`/processes/${process.id}`}>
                                <Eye className="h-4 w-4" />
                              </Link>
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setActionDialog({ processId: process.id, currentStatus: process.status })
                                setNewStatus(process.status)
                              }}
                            >
                              <Settings className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Status change dialog */}
      <Dialog open={!!actionDialog} onOpenChange={(open) => { if (!open) { setActionDialog(null); setReason(''); setNewStatus('') } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('admin.changeProcessStatus')}</DialogTitle>
            <DialogDescription>{t('admin.processStatusConfirm')}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <Select value={newStatus} onValueChange={setNewStatus}>
              <SelectTrigger>
                <SelectValue placeholder={t('admin.selectStatus')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">{t('status.draft')}</SelectItem>
                <SelectItem value="active">{t('status.active')}</SelectItem>
                <SelectItem value="closed">{t('status.closed')}</SelectItem>
                <SelectItem value="completed">{t('status.completed')}</SelectItem>
              </SelectContent>
            </Select>

            <Textarea
              placeholder={t('admin.reasonPlaceholder')}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => { setActionDialog(null); setReason(''); setNewStatus('') }}>
              {t('common.cancel')}
            </Button>
            <Button
              disabled={actionLoading || !newStatus || newStatus === actionDialog?.currentStatus}
              onClick={handleStatusChange}
            >
              {actionLoading ? t('common.loading') : t('admin.updateStatus')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
