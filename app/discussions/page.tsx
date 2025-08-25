'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { MainNav } from "@/components/main-nav"
import { LanguageSwitcher } from "@/components/language-switcher"
import { Footer } from "@/components/footer"
import { useAuth } from '@/lib/auth-context'
import { useLanguage } from '@/components/language-provider'
import { supabase, Comment, Proposal, Process } from '@/lib/supabase'
import { Search, MessageSquare, Vote, Calendar, User, FileText } from "lucide-react"
import Link from "next/link"

interface DiscussionItem {
  proposal: Proposal & { process: Process }
  comments: Comment[]
  recent_activity: string
}

export default function DiscussionsPage() {
  const { user } = useAuth()
  const { t, language } = useLanguage()
  const [discussions, setDiscussions] = useState<DiscussionItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchDiscussions()
  }, [])

  const fetchDiscussions = async () => {
    try {
      // Fetch proposals with their processes and comments
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
        return
      }

      // Fetch comments for each proposal
      const discussionsWithComments = await Promise.all(
        (proposalsData || []).map(async (proposal) => {
          const { data: comments } = await supabase
            .from('comments')
            .select('*')
            .eq('proposal_id', proposal.id)
            .order('created_at', { ascending: false })

          // Find the most recent activity
          const recentActivity = comments && comments.length > 0 
            ? comments[0].created_at 
            : proposal.created_at

          return {
            proposal,
            comments: comments || [],
            recent_activity: recentActivity
          }
        })
      )

      // Sort by recent activity
      discussionsWithComments.sort((a, b) => 
        new Date(b.recent_activity).getTime() - new Date(a.recent_activity).getTime()
      )

      setDiscussions(discussionsWithComments)

    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredDiscussions = discussions.filter(discussion => {
    const matchesSearch = discussion.proposal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         discussion.proposal.description.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
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

  const getTimeAgo = (date: string) => {
    const now = new Date()
    const then = new Date(date)
    const diffInHours = Math.floor((now.getTime() - then.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours}h ago`
    
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) return `${diffInDays}d ago`
    
    return then.toLocaleDateString()
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
            <h1 className="text-3xl font-bold tracking-tight">Community Discussions</h1>
            <p className="text-muted-foreground">
              Join conversations and debates on proposals across Pakistan
            </p>
          </div>

          {/* Search */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                type="search" 
                placeholder="Search discussions..." 
                className="w-full pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Discussions List */}
          <div className="space-y-4">
            {filteredDiscussions.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No discussions found</p>
                </CardContent>
              </Card>
            ) : (
              filteredDiscussions.map((discussion) => (
                <Card key={discussion.proposal.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">
                            {getPhaseLabel(discussion.proposal.process.phase)}
                          </Badge>
                          <Badge variant="secondary">
                            {getCategoryLabel(discussion.proposal.process.category)}
                          </Badge>
                        </div>
                        <CardTitle className="line-clamp-2">
                          {getTitle(discussion.proposal)}
                        </CardTitle>
                        <CardDescription className="line-clamp-3">
                          {getDescription(discussion.proposal)}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="space-y-3">
                      {/* Process Information */}
                      <div className="text-sm text-muted-foreground">
                        <p className="font-medium">Process: {getTitle(discussion.proposal.process)}</p>
                        <p>Location: {discussion.proposal.process.location}</p>
                      </div>

                      {/* Discussion Stats */}
                      <div className="flex items-center gap-6 text-sm">
                        <div className="flex items-center gap-2">
                          <MessageSquare className="h-4 w-4 text-muted-foreground" />
                          <span>{discussion.comments.length} comments</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>Last activity: {getTimeAgo(discussion.recent_activity)}</span>
                        </div>
                      </div>

                      {/* Recent Comments Preview */}
                      {discussion.comments.length > 0 && (
                        <div className="border-l-2 border-gray-200 pl-4 space-y-2">
                          <p className="text-sm font-medium">Recent comment:</p>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {discussion.comments[0].content}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {getTimeAgo(discussion.comments[0].created_at)}
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>

                  <div className="px-6 pb-6">
                    <Button asChild className="w-full">
                      <Link href={`/processes/${discussion.proposal.process_id}`}>
                        Join Discussion
                      </Link>
                    </Button>
                  </div>
                </Card>
              ))
            )}
          </div>

          {/* Stats */}
          {filteredDiscussions.length > 0 && (
            <div className="mt-8 text-center text-sm text-muted-foreground">
              Showing {filteredDiscussions.length} of {discussions.length} discussions
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
} 