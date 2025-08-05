'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { MainNav } from '@/components/main-nav'
import { LanguageSwitcher } from '@/components/language-switcher'
import { Footer } from '@/components/footer'
import { useAuth } from '@/lib/auth-context'
import { useLanguage } from '@/components/language-provider'
import { supabase, Process, Proposal, Vote, Discussion } from '@/lib/supabase'
import { 
  Vote as VoteIcon, 
  Users, 
  Calendar, 
  MapPin, 
  ThumbsUp, 
  ThumbsDown, 
  MinusCircle,
  MessageSquare,
  FileText,
  ChevronLeft,
  Plus
} from 'lucide-react'
import Link from 'next/link'

export default function ProcessDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const { t, language } = useLanguage()
  const [process, setProcess] = useState<Process | null>(null)
  const [proposals, setProposals] = useState<Proposal[]>([])
  const [discussions, setDiscussions] = useState<Discussion[]>([])
  const [votes, setVotes] = useState<Vote[]>([])
  const [loading, setLoading] = useState(true)
  const [newProposal, setNewProposal] = useState({ title: '', title_ur: '', description: '', description_ur: '' })
  const [newDiscussion, setNewDiscussion] = useState({ content: '', content_ur: '' })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [votingLoading, setVotingLoading] = useState<string | null>(null)
  const [submittingProposal, setSubmittingProposal] = useState(false)
  const [submittingDiscussion, setSubmittingDiscussion] = useState(false)
  const [newProposalComment, setNewProposalComment] = useState({ content: '', content_ur: '' })
  const [submittingComment, setSubmittingComment] = useState<string | null>(null)

  useEffect(() => {
    if (params.id) {
      fetchProcessData()
    }
  }, [params.id])

  const fetchProcessData = async () => {
    try {
      const processId = Array.isArray(params.id) ? params.id[0] : params.id

      // Fetch process
      const { data: processData, error: processError } = await supabase
        .from('processes')
        .select('*')
        .eq('id', processId)
        .single()

      if (processError) {
        console.error('Error fetching process:', processError)
        router.push('/processes')
        return
      }

      setProcess(processData)

      // Fetch proposals
      const { data: proposalsData } = await supabase
        .from('proposals')
        .select('*')
        .eq('process_id', processId)
        .in('status', ['pending', 'approved'])
        .order('created_at', { ascending: false })

      setProposals(proposalsData || [])

      // Fetch votes
      const { data: votesData } = await supabase
        .from('votes')
        .select('*')
        .in('proposal_id', (proposalsData || []).map(p => p.id))

      setVotes(votesData || [])

      // Fetch discussions (both process and proposal discussions)
      const proposalIds = (proposalsData || []).map(p => p.id)
      const orCondition = proposalIds.length > 0 
        ? `process_id.eq.${processId},proposal_id.in.(${proposalIds.join(',')})`
        : `process_id.eq.${processId}`
        
      const { data: discussionsData, error: discussionsError } = await supabase
        .from('discussions')
        .select(`
          *,
          profiles:author_id (
            full_name,
            username
          )
        `)
        .or(orCondition)
        .eq('is_deleted', false)
        .order('created_at', { ascending: true })
      
      if (discussionsError) {
        console.error('Error fetching discussions:', discussionsError)
      }

      console.log('Fetched discussions:', discussionsData)
      setDiscussions(discussionsData || [])

      // Track participation
      if (user) {
        await supabase
          .from('participations')
          .upsert({
            user_id: user.id,
            process_id: processId,
            participation_type: 'view'
          })
      }

    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitProposal = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !process) return

    setError('')
    setSuccess('')
    setSubmittingProposal(true)

    try {
      const { error } = await supabase
        .from('proposals')
        .insert({
          process_id: process.id,
          title: newProposal.title,
          title_ur: newProposal.title_ur || null,
          description: newProposal.description,
          description_ur: newProposal.description_ur || null,
          author_id: user.id,
          status: 'pending'
        })

      if (error) {
        setError('Failed to submit proposal')
      } else {
        setSuccess('Proposal submitted successfully!')
        setNewProposal({ title: '', title_ur: '', description: '', description_ur: '' })
        await fetchProcessData()
        
        // Track participation
        await supabase
          .from('participations')
          .upsert({
            user_id: user.id,
            process_id: process.id,
            participation_type: 'proposal'
          })
      }
    } catch (error) {
      setError('An unexpected error occurred')
    } finally {
      setSubmittingProposal(false)
    }
  }

  const handleVote = async (proposalId: string, voteType: 'support' | 'oppose' | 'neutral') => {
    if (!user || !process) return

    setVotingLoading(proposalId)

    try {
      const { error } = await supabase
        .from('votes')
        .upsert({
          proposal_id: proposalId,
          user_id: user.id,
          vote_type: voteType
        })

      if (!error) {
        await fetchProcessData()
        
        // Track participation
        await supabase
          .from('participations')
          .upsert({
            user_id: user.id,
            process_id: process.id,
            participation_type: 'vote'
          })
      }
    } catch (error) {
      console.error('Error voting:', error)
    } finally {
      setVotingLoading(null)
    }
  }

  const handleSubmitDiscussion = async () => {
    if (!user || !newDiscussion.content || !process) return

    setError('')
    setSubmittingDiscussion(true)

    try {
      const { error } = await supabase
        .from('discussions')
        .insert({
          process_id: process.id,
          author_id: user.id,
          content: newDiscussion.content,
          content_ur: newDiscussion.content_ur || null
        })

      if (error) {
        console.error('Error inserting discussion:', error)
        setError('Failed to submit discussion')
      } else {
        setNewDiscussion({ content: '', content_ur: '' })
        await fetchProcessData()
        
        // Track participation
        await supabase
          .from('participations')
          .upsert({
            user_id: user.id,
            process_id: process.id,
            participation_type: 'comment'
          })
      }
    } catch (error) {
      console.error('Error submitting discussion:', error)
      setError('An unexpected error occurred')
    } finally {
      setSubmittingDiscussion(false)
    }
  }

  const handleSubmitProposalComment = async (proposalId: string) => {
    if (!user || !newProposalComment.content || !process) return

    setSubmittingComment(proposalId)

    try {
      const { error } = await supabase
        .from('discussions')
        .insert({
          proposal_id: proposalId,
          author_id: user.id,
          content: newProposalComment.content,
          content_ur: newProposalComment.content_ur || null
        })

      if (!error) {
        setNewProposalComment({ content: '', content_ur: '' })
        await fetchProcessData()
        
        // Track participation
        await supabase
          .from('participations')
          .upsert({
            user_id: user.id,
            process_id: process.id,
            participation_type: 'comment'
          })
      }
    } catch (error) {
      console.error('Error submitting comment:', error)
    } finally {
      setSubmittingComment(null)
    }
  }

  const getVoteCount = (proposalId: string, type: string) => {
    return votes.filter(v => v.proposal_id === proposalId && v.vote_type === type).length
  }

  const getUserVote = (proposalId: string) => {
    return votes.find(v => v.proposal_id === proposalId && v.user_id === user?.id)
  }

  const getProposalDiscussions = (proposalId: string) => {
    return discussions.filter(d => d.proposal_id === proposalId)
  }

  const getTitle = (item: { title: string; title_ur?: string }) => {
    return language === 'ur' && item.title_ur ? item.title_ur : item.title
  }

  const getDescription = (item: { description: string; description_ur?: string }) => {
    return language === 'ur' && item.description_ur ? item.description_ur : item.description
  }

  const getContent = (item: { content: string; content_ur?: string }) => {
    return language === 'ur' && item.content_ur ? item.content_ur : item.content
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

  if (!process) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-lg">Process not found</p>
          <Button asChild className="mt-4">
            <Link href="/processes">Back to Processes</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center space-x-2">
              <VoteIcon className="h-6 w-6 text-emerald-600" />
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
          <div className="mb-6">
            <Button asChild variant="ghost" className="mb-4">
              <Link href="/processes">
                <ChevronLeft className="mr-2 h-4 w-4" />
                Back to Processes
              </Link>
            </Button>
            
            <div className="flex items-start justify-between">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Badge variant={process.status === 'active' ? 'default' : 'outline'}>
                    {t(`status.${process.status}`)}
                  </Badge>
                  <Badge variant="outline">{t(`category.${process.category.toLowerCase()}`)}</Badge>
                </div>
                <h1 className="text-3xl font-bold">{getTitle(process)}</h1>
                <p className="text-lg text-muted-foreground max-w-3xl">
                  {getDescription(process)}
                </p>
                
                <div className="flex items-center gap-6 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span>{process.organization || 'Government Initiative'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>Ends: {new Date(process.end_date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span>{process.participation_count || 0} participants</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Tabs defaultValue="proposals" className="space-y-6">
            <TabsList>
              <TabsTrigger value="proposals" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Proposals ({proposals.length})
              </TabsTrigger>
              <TabsTrigger value="discussions" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Discussions ({discussions.length})
              </TabsTrigger>
              <TabsTrigger value="submit" className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Submit Proposal
              </TabsTrigger>
            </TabsList>

            <TabsContent value="proposals" className="space-y-6">
              {proposals.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No proposals submitted yet</p>
                  </CardContent>
                </Card>
              ) : (
                proposals.map((proposal) => (
                  <Card key={proposal.id}>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        {getTitle(proposal)}
                        <div className="flex items-center gap-2">
                          {user && (
                            <>
                              <Button
                                variant={getUserVote(proposal.id)?.vote_type === 'support' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => handleVote(proposal.id, 'support')}
                                disabled={votingLoading === proposal.id}
                                className="flex items-center gap-1"
                              >
                                <ThumbsUp className="h-4 w-4" />
                                {getVoteCount(proposal.id, 'support')}
                              </Button>
                              <Button
                                variant={getUserVote(proposal.id)?.vote_type === 'oppose' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => handleVote(proposal.id, 'oppose')}
                                disabled={votingLoading === proposal.id}
                                className="flex items-center gap-1"
                              >
                                <ThumbsDown className="h-4 w-4" />
                                {getVoteCount(proposal.id, 'oppose')}
                              </Button>
                              <Button
                                variant={getUserVote(proposal.id)?.vote_type === 'neutral' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => handleVote(proposal.id, 'neutral')}
                                disabled={votingLoading === proposal.id}
                                className="flex items-center gap-1"
                              >
                                <MinusCircle className="h-4 w-4" />
                                {getVoteCount(proposal.id, 'neutral')}
                              </Button>
                            </>
                          )}
                        </div>
                      </CardTitle>
                      <CardDescription>
                        Submitted on {new Date(proposal.created_at).toLocaleDateString()}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="mb-4">{getDescription(proposal)}</p>
                      
                      <div className="space-y-4">
                        <h4 className="font-semibold flex items-center gap-2">
                          <MessageSquare className="h-4 w-4" />
                          Discussions ({getProposalDiscussions(proposal.id).length})
                        </h4>
                        
                        {getProposalDiscussions(proposal.id).map((discussion) => (
                          <div key={discussion.id} className="border-l-2 border-gray-200 pl-4 py-2">
                            <p className="text-sm">{getContent(discussion)}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              By {(discussion as any).profiles?.full_name || 'Anonymous'} • {new Date(discussion.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        ))}
                        
                        {user && (
                          <div className="flex gap-2 mt-4">
                            <Textarea
                              placeholder="Add a comment..."
                              value={newProposalComment.content}
                              onChange={(e) => setNewProposalComment({...newProposalComment, content: e.target.value})}
                              className="flex-1"
                              rows={2}
                            />
                            <Button 
                              onClick={() => handleSubmitProposalComment(proposal.id)}
                              disabled={submittingComment === proposal.id || !newProposalComment.content.trim()}
                              size="sm"
                            >
                              {submittingComment === proposal.id ? 'Posting...' : 'Post'}
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>

            <TabsContent value="submit">
              {user ? (
                <Card>
                  <CardHeader>
                    <CardTitle>Submit New Proposal</CardTitle>
                    <CardDescription>
                      Share your ideas and suggestions for this democratic process
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmitProposal} className="space-y-4">
                      {error && (
                        <Alert variant="destructive">
                          <AlertDescription>{error}</AlertDescription>
                        </Alert>
                      )}
                      {success && (
                        <Alert>
                          <AlertDescription>{success}</AlertDescription>
                        </Alert>
                      )}
                      
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="title">Title (English)</Label>
                          <Input
                            id="title"
                            value={newProposal.title}
                            onChange={(e) => setNewProposal({...newProposal, title: e.target.value})}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="title_ur">Title (Urdu)</Label>
                          <Input
                            id="title_ur"
                            value={newProposal.title_ur}
                            onChange={(e) => setNewProposal({...newProposal, title_ur: e.target.value})}
                          />
                        </div>
                      </div>
                      
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="description">Description (English)</Label>
                          <Textarea
                            id="description"
                            value={newProposal.description}
                            onChange={(e) => setNewProposal({...newProposal, description: e.target.value})}
                            rows={4}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="description_ur">Description (Urdu)</Label>
                          <Textarea
                            id="description_ur"
                            value={newProposal.description_ur}
                            onChange={(e) => setNewProposal({...newProposal, description_ur: e.target.value})}
                            rows={4}
                          />
                        </div>
                      </div>
                      
                      <Button type="submit" className="w-full" disabled={submittingProposal}>
                        {submittingProposal ? 'Submitting...' : 'Submit Proposal'}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="text-center py-12">
                    <p className="text-muted-foreground mb-4">
                      You need to be logged in to submit proposals
                    </p>
                    <div className="space-x-2">
                      <Button asChild>
                        <Link href="/login">Login</Link>
                      </Button>
                      <Button asChild variant="outline">
                        <Link href="/register">Register</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="discussions" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Process Discussions</CardTitle>
                  <CardDescription>
                    Share your thoughts and engage with the community
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {console.log('All discussions:', discussions)}
                    {console.log('Process discussions:', discussions.filter(d => !d.proposal_id))}
                    {discussions.filter(d => !d.proposal_id).map((discussion) => (
                      <div key={discussion.id} className="border-l-2 border-gray-200 pl-4 py-2">
                        <p>{getContent(discussion)}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          By {(discussion as any).profiles?.full_name || 'Anonymous'} • {new Date(discussion.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                    
                    {discussions.filter(d => !d.proposal_id).length === 0 && (
                      <p className="text-muted-foreground text-center py-8">
                        No discussions yet. Be the first to share your thoughts!
                      </p>
                    )}
                    
                    {user && (
                      <div className="space-y-2 mt-6">
                        {error && (
                          <Alert variant="destructive">
                            <AlertDescription>{error}</AlertDescription>
                          </Alert>
                        )}
                        <Label>Add to discussion</Label>
                        <Textarea
                          placeholder="Share your thoughts..."
                          value={newDiscussion.content}
                          onChange={(e) => setNewDiscussion({...newDiscussion, content: e.target.value})}
                          rows={4}
                        />
                        <Button onClick={handleSubmitDiscussion} disabled={submittingDiscussion || !newDiscussion.content.trim()}>
                          {submittingDiscussion ? 'Posting...' : 'Post Discussion'}
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  )
}
