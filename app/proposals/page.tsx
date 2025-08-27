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
    neutral: number
  }
  user_vote?: string
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
  const [votingLoading, setVotingLoading] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState('recent')

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
.eq('status', 'approved')
        .order('created_at', { ascending: false })

      if (proposalsError) {
        console.error('Error fetching proposals:', proposalsError)
      } else {
        // Fetch vote counts and user votes for each proposal
        const proposalsWithVotes = await Promise.all(
          (proposalsData || []).map(async (proposal) => {
            const { data: votes } = await supabase
              .from('votes')
              .select('vote_type, user_id')
              .eq('proposal_id', proposal.id)

            const voteCounts = {
              support: votes?.filter(v => v.vote_type === 'support').length || 0,
              oppose: votes?.filter(v => v.vote_type === 'oppose').length || 0,
              neutral: votes?.filter(v => v.vote_type === 'neutral').length || 0
            }

            // Find current user's vote if they're logged in
            const userVote = user ? votes?.find(v => v.user_id === user.id)?.vote_type : undefined

            return {
              ...proposal,
              vote_counts: voteCounts,
              user_vote: userVote
            }
          })
        )

        setProposals(proposalsWithVotes)
      }

      // Fetch processes for filtering
      const { data: processesData } = await supabase
        .from('processes')
        .select('*')
        .eq('status', 'active')
        .order('title', { ascending: true })

      setProcesses(processesData || [])

    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredAndSortedProposals = proposals
    .filter(proposal => {
      const matchesSearch = proposal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           proposal.description.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = selectedStatus === 'all' || proposal.status === selectedStatus
      const matchesProcess = selectedProcess === 'all' || proposal.process_id.toString() === selectedProcess
      return matchesSearch && matchesStatus && matchesProcess
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'popular':
          const aTotal = (a.vote_counts?.support || 0) + (a.vote_counts?.oppose || 0) + (a.vote_counts?.neutral || 0)
          const bTotal = (b.vote_counts?.support || 0) + (b.vote_counts?.oppose || 0) + (b.vote_counts?.neutral || 0)
          return bTotal - aTotal
        case 'support':
          return (b.vote_counts?.support || 0) - (a.vote_counts?.support || 0)
        case 'recent':
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      }
    })

  const getTitle = (item: { title: string; title_ur?: string }) => {
    return language === 'ur' && item.title_ur ? item.title_ur : item.title
  }

  const getDescription = (item: { description: string; description_ur?: string }) => {
    return language === 'ur' && item.description_ur ? item.description_ur : item.description
  }

  const getCategoryLabel = (category: string) => {
    return t(`category.${category.toLowerCase()}`)
  }

  const handleVote = async (proposalId: string, voteType: 'support' | 'oppose' | 'neutral') => {
    if (!user) return

    setVotingLoading(proposalId)

    try {
      // First, check if user has already voted on this proposal
      const { data: existingVote } = await supabase
        .from('votes')
        .select('id, vote_type')
        .eq('proposal_id', proposalId)
        .eq('user_id', user.id)
        .single()

      let error = null

      if (existingVote) {
        // User has voted before, update their vote
        const { error: updateError } = await supabase
          .from('votes')
          .update({ vote_type: voteType })
          .eq('id', existingVote.id)
        
        error = updateError
      } else {
        // User hasn't voted, insert new vote
        const { error: insertError } = await supabase
          .from('votes')
          .insert({
            proposal_id: proposalId,
            user_id: user.id,
            vote_type: voteType
          })
        
        error = insertError
      }

      if (!error) {
        await fetchData() // Refresh the data to show updated vote counts
      } else {
        console.error('Error voting:', error)
        // Show user-friendly error message
        alert('Failed to record your vote. Please try again.')
      }
    } catch (error) {
      console.error('Error voting:', error)
      alert('An unexpected error occurred. Please try again.')
    } finally {
      setVotingLoading(null)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-16 items-center justify-between">
            <div className="flex items-center gap-6">
              <Link href="/" className="flex items-center space-x-2">
                <Vote className="h-6 w-6 text-emerald-600" />
                <span className="font-bold text-xl">Hum Awaz</span>
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
              <span className="font-bold text-xl">Hum Awaz</span>
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
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="implemented">Implemented</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full md:w-[200px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">Most Recent</SelectItem>
                  <SelectItem value="popular">Most Discussed</SelectItem>
                  <SelectItem value="support">Most Supported</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Proposals Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredAndSortedProposals.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No proposals found matching your criteria</p>
              </div>
            ) : (
              filteredAndSortedProposals.map((proposal) => (
                <Card key={proposal.id} className="flex flex-col">
                  <CardHeader>
                    <div className="flex justify-between items-start mb-2">
                      <Badge variant="outline">
                        {proposal.status}
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
                        <p>Organization: {proposal.process.organization || 'Government Initiative'}</p>
                      </div>

                      {/* Vote Counts & Voting */}
                      <div className="space-y-2">
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
                            <span>{proposal.vote_counts?.neutral || 0}</span>
                          </div>
                        </div>
                        
                        {user && (
                          <div className="flex gap-2">
                            <Button
                              variant={proposal.user_vote === 'support' ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => handleVote(proposal.id, 'support')}
                              disabled={votingLoading === proposal.id}
                              className={`flex items-center gap-1 ${
                                proposal.user_vote === 'support' 
                                  ? 'bg-green-600 hover:bg-green-700 text-white' 
                                  : 'text-green-600 hover:text-green-700 hover:border-green-300'
                              }`}
                            >
                              <ThumbsUp className="h-3 w-3" />
                              {proposal.user_vote === 'support' ? 'Supporting' : 'Support'}
                            </Button>
                            <Button
                              variant={proposal.user_vote === 'oppose' ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => handleVote(proposal.id, 'oppose')}
                              disabled={votingLoading === proposal.id}
                              className={`flex items-center gap-1 ${
                                proposal.user_vote === 'oppose' 
                                  ? 'bg-red-600 hover:bg-red-700 text-white' 
                                  : 'text-red-600 hover:text-red-700 hover:border-red-300'
                              }`}
                            >
                              <ThumbsDown className="h-3 w-3" />
                              {proposal.user_vote === 'oppose' ? 'Opposing' : 'Oppose'}
                            </Button>
                            <Button
                              variant={proposal.user_vote === 'neutral' ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => handleVote(proposal.id, 'neutral')}
                              disabled={votingLoading === proposal.id}
                              className={`flex items-center gap-1 ${
                                proposal.user_vote === 'neutral' 
                                  ? 'bg-gray-600 hover:bg-gray-700 text-white' 
                                  : 'text-gray-600 hover:text-gray-700 hover:border-gray-300'
                              }`}
                            >
                              <MinusCircle className="h-3 w-3" />
                              {proposal.user_vote === 'neutral' ? 'Neutral' : 'Neutral'}
                            </Button>
                          </div>
                        )}
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
          {filteredAndSortedProposals.length > 0 && (
            <div className="mt-8 text-center text-sm text-muted-foreground">
              Showing {filteredAndSortedProposals.length} of {proposals.length} proposals
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
} 