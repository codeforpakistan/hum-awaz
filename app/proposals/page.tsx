'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MainNav } from "@/components/main-nav"
import { LanguageSwitcher } from "@/components/language-switcher"
import { Footer } from "@/components/footer"
import { useAuth } from '@/lib/auth-context'
import { useLanguage } from '@/components/language-provider'
import { supabase, Proposal, Process } from '@/lib/supabase'
import { Search, Filter, FileText, Vote, ThumbsUp, ThumbsDown, MinusCircle, Calendar, User } from "lucide-react"
import Link from "next/link"

interface ProposalWithProcess extends Proposal {
  process: Process
  vote_counts?: {
    support: number
    oppose: number
    abstain: number
  }
}

export default function ProposalsPage() {
  const { user } = useAuth()
  const { t, language } = useLanguage()
  const [proposals, setProposals] = useState<ProposalWithProcess[]>([])
  const [processes, setProcesses] = useState<Process[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [selectedProcess, setSelectedProcess] = useState('all')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      // Fetch proposals with their processes
      const { data: proposalsData, error: proposalsError } = await supabase
        .from('proposals')
        .select(`
          *,
          process:processes(*)
        `)
        .eq('status', 'submitted')
        .order('created_at', { ascending: false })

      if (proposalsError) {
        console.error('Error fetching proposals:', proposalsError)
      } else {
        // Fetch vote counts for each proposal
        const proposalsWithVotes = await Promise.all(
          (proposalsData || []).map(async (proposal) => {
            const { data: votes } = await supabase
              .from('votes')
              .select('vote_type')
              .eq('proposal_id', proposal.id)

            const voteCounts = {
              support: votes?.filter(v => v.vote_type === 'support').length || 0,
              oppose: votes?.filter(v => v.vote_type === 'oppose').length || 0,
              abstain: votes?.filter(v => v.vote_type === 'abstain').length || 0
            }

            return {
              ...proposal,
              vote_counts: voteCounts
            }
          })
        )

        setProposals(proposalsWithVotes)
      }

      // Fetch processes for filtering
      const { data: processesData } = await supabase
        .from('processes')
        .select('*')
        .eq('is_active', true)
        .order('title', { ascending: true })

      setProcesses(processesData || [])

    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredProposals = proposals.filter(proposal => {
    const matchesSearch = proposal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         proposal.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = selectedStatus === 'all' || proposal.status === selectedStatus
    const matchesProcess = selectedProcess === 'all' || proposal.process_id.toString() === selectedProcess
    return matchesSearch && matchesStatus && matchesProcess
  })

  const getTitle = (item: { title: string; title_ur?: string }) => {
    return language === 'ur' && item.title_ur ? item.title_ur : item.title
  }

  const getDescription = (item: { description: string; description_ur?: string }) => {
    return language === 'ur' && item.description_ur ? item.description_ur : item.description
  }

  const getPhaseLabel = (phase: string) => {
    return t(`phase.${phase}`)
  }

  const getCategoryLabel = (category: string) => {
    return t(`category.${category.toLowerCase()}`)
  }

  if (loading) {
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
              {user ? (
                <Button asChild variant="outline" size="sm">
                  <Link href="/dashboard">Dashboard</Link>
                </Button>
              ) : (
                <>
                  <Button asChild variant="outline" size="sm">
                    <Link href="/login">{t('common.login')}</Link>
                  </Button>
                  <Button asChild size="sm">
                    <Link href="/register">{t('common.register')}</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </header>
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-emerald-600 mx-auto"></div>
            <p className="mt-4 text-lg">{t('common.loading')}</p>
          </div>
        </main>
      </div>
    )
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
            {user ? (
              <Button asChild variant="outline" size="sm">
                <Link href="/dashboard">Dashboard</Link>
              </Button>
            ) : (
              <>
                <Button asChild variant="outline" size="sm">
                  <Link href="/login">{t('common.login')}</Link>
                </Button>
                <Button asChild size="sm">
                  <Link href="/register">{t('common.register')}</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1">
        <div className="container py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight">Community Proposals</h1>
            <p className="text-muted-foreground">
              Browse and engage with proposals submitted by citizens across Pakistan
            </p>
          </div>

          {/* Filters */}
          <div className="mb-6 space-y-4">
            <div className="flex flex-col gap-4 md:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  type="search" 
                  placeholder="Search proposals..." 
                  className="w-full pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={selectedProcess} onValueChange={setSelectedProcess}>
                <SelectTrigger className="w-full md:w-[200px]">
                  <SelectValue placeholder="All Processes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Processes</SelectItem>
                  {processes.map((process) => (
                    <SelectItem key={process.id} value={process.id.toString()}>
                      {getTitle(process)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-full md:w-[200px]">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="submitted">Submitted</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Proposals Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredProposals.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No proposals found matching your criteria</p>
              </div>
            ) : (
              filteredProposals.map((proposal) => (
                <Card key={proposal.id} className="flex flex-col">
                  <CardHeader>
                    <div className="flex justify-between items-start mb-2">
                      <Badge variant="outline">
                        {getPhaseLabel(proposal.process.phase)}
                      </Badge>
                      <Badge variant="secondary">
                        {getCategoryLabel(proposal.process.category)}
                      </Badge>
                    </div>
                    <CardTitle className="line-clamp-2">{getTitle(proposal)}</CardTitle>
                    <CardDescription className="line-clamp-3">
                      {getDescription(proposal)}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="flex-grow">
                    <div className="space-y-3">
                      {/* Process Information */}
                      <div className="text-sm text-muted-foreground">
                        <p className="font-medium">Process: {getTitle(proposal.process)}</p>
                        <p>Location: {proposal.process.location}</p>
                      </div>

                      {/* Vote Counts */}
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1 text-green-600">
                          <ThumbsUp className="h-4 w-4" />
                          <span>{proposal.vote_counts?.support || 0}</span>
                        </div>
                        <div className="flex items-center gap-1 text-red-600">
                          <ThumbsDown className="h-4 w-4" />
                          <span>{proposal.vote_counts?.oppose || 0}</span>
                        </div>
                        <div className="flex items-center gap-1 text-gray-600">
                          <MinusCircle className="h-4 w-4" />
                          <span>{proposal.vote_counts?.abstain || 0}</span>
                        </div>
                      </div>

                      {/* Metadata */}
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span>Submitted: {new Date(proposal.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </CardContent>

                  <div className="p-6 pt-0">
                    <Button asChild className="w-full">
                      <Link href={`/processes/${proposal.process_id}`}>
                        View in Process
                      </Link>
                    </Button>
                  </div>
                </Card>
              ))
            )}
          </div>

          {/* Stats */}
          {filteredProposals.length > 0 && (
            <div className="mt-8 text-center text-sm text-muted-foreground">
              Showing {filteredProposals.length} of {proposals.length} proposals
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
} 