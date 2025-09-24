'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { MainNav } from '@/components/main-nav';
import { LanguageSwitcher } from '@/components/language-switcher';
import { Footer } from '@/components/footer';
import { ShareButton } from '@/components/share-button';
import { useSession, signIn, signOut } from "next-auth/react"
import { useLanguage } from '@/components/language-provider';
import { supabase, Process, Proposal, Vote, Discussion } from '@/lib/supabase';
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
  Plus,
} from 'lucide-react';

import Link from 'next/link';
import { useProcessSingle, useProposals } from '@/lib/queries';
import { NewProposalForm } from '../components/new-proposal-form';
import { useCastVote } from '@/lib/mutations';
import { DiscussionForm } from '../components/discussion-form';
import { CommentForm } from '../components/comment-form';

export default function ProcessDetailPage() {
  const params = useParams()
  const process_id = Number(params.id)
    const { data: session, status } = useSession()
    const user = session?.user
  const { t, language } = useLanguage();

  const {data: process_data, isPending: isPendingProcess} = useProcessSingle(process_id)
  const useCastVoteMutation = useCastVote();

  const getTitle = (item: { title: string; title_ur?: string }) => {
    return language === 'ur' && item.title_ur ? item.title_ur : item.title;
  };

  const getDescription = (item: {
    description: string;
    description_ur?: string;
  }) => {
    return language === 'ur' && item.description_ur
      ? item.description_ur
      : item.description;
  };

  const getContent = (item: { content: string; content_ur?: string }) => {
    return language === 'ur' && item.content_ur
      ? item.content_ur
      : item.content;
  };

  if (isPendingProcess) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-4 text-lg">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  if (!process_data) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-lg">Process not found</p>
          <Button asChild className="mt-4">
            <Link href="/processes">Back to Processes</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center space-x-2">
              <VoteIcon className="h-6 w-6 text-emerald-600" />
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
                  <Badge
                    variant={
                      process_data.status === 'active' ? 'default' : 'outline'
                    }
                  >
                    {t(`status.${process_data.status}`)}
                  </Badge>
                  <Badge variant="outline">
                    {t(`category.${process_data.category.toLowerCase()}`)}
                  </Badge>
                </div>
                <div className="flex items-start justify-between">
                  <h1 className="text-3xl font-bold">{getTitle(process_data)}</h1>
                  <ShareButton
                    url={`${
                      typeof window !== 'undefined'
                        ? window.location.origin
                        : ''
                    }/process_dataes/${process_data.id}`}
                    title={`Join the discussion on: ${getTitle(
                      process_data
                    )} - Hum Awaaz`}
                    description={`Participate in Pakistan's democratic process_data. Share your voice on ${getTitle(
                      process_data
                    )}. Vote, discuss, and help shape our nation's future.`}
                    variant="default"
                  />
                </div>
                <p className="text-lg text-muted-foreground max-w-3xl">
                  {getDescription(process_data)}
                </p>

                <div className="flex items-center gap-6 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span>
                      {process_data.organization || 'Government Initiative'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>
                      Ends: {new Date(process_data.end_date).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span>{process_data.participation_count || 0} participants</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Tabs defaultValue="proposals" className="space-y-6">
            <TabsList>
              <TabsTrigger
                value="proposals"
                className="flex items-center gap-2"
              >
                <FileText className="h-4 w-4" />
                Proposals ({process_data.proposals.length})
              </TabsTrigger>
              <TabsTrigger
                value="discussions"
                className="flex items-center gap-2"
              >
                <MessageSquare className="h-4 w-4" />
                Discussions ({process_data.discussions.length})
              </TabsTrigger>
              <TabsTrigger value="submit" className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Submit Proposal
              </TabsTrigger>
            </TabsList>

            <TabsContent value="proposals" className="space-y-6">
              {process_data.proposals.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      No proposals submitted yet
                    </p>
                  </CardContent>
                </Card>
              ) : (
                process_data.proposals.map((proposal:any) => (
                  <Card key={proposal.id}>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        {getTitle(proposal)}
                        <div className="flex items-center gap-2">
                          {user && (
                            <>
                              <Button
                                variant={
                                  proposal.votes[0]?.vote_type ===
                                  'support'
                                    ? 'default'
                                    : 'outline'
                                }
                                size="sm"
                                onClick={() =>
                                  useCastVoteMutation.mutate({proposalId: proposal.id, voteType: 'support'})
                                }
                                disabled={useCastVoteMutation.isPending}
                                className="flex items-center gap-1"
                              >
                                <ThumbsUp className="h-4 w-4" />
                                {proposal.voteCounts?.support || 0}
                              </Button>
                              <Button
                                variant={
                                  proposal.votes[0]?.vote_type ===
                                  'oppose'
                                    ? 'default'
                                    : 'outline'
                                }
                                size="sm"
                                onClick={() =>
                                  useCastVoteMutation.mutate({proposalId: proposal.id, voteType: 'oppose'})
                                }
                                disabled={useCastVoteMutation.isPending}
                                className="flex items-center gap-1"
                              >
                                <ThumbsDown className="h-4 w-4" />
                                {proposal.voteCounts?.oppose || 0}
                              </Button>
                              <Button
                                variant={
                                  proposal.votes[0]?.vote_type ===
                                  'neutral'
                                    ? 'default'
                                    : 'outline'
                                }
                                size="sm"
                                onClick={() =>
                                  useCastVoteMutation.mutate({proposalId: proposal.id, voteType: 'neutral'})
                                }
                                disabled={useCastVoteMutation.isPending}
                                className="flex items-center gap-1"
                              >
                                <MinusCircle className="h-4 w-4" />
                                {proposal.voteCounts?.neutral || 0}
                              </Button>
                            </>
                          )}
                        </div>
                      </CardTitle>
                      <CardDescription>
                        Submitted on{' '}
                        {new Date(proposal.created_at).toLocaleDateString()}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="mb-4">{getDescription(proposal)}</p>

                      <div className="space-y-4">
                        <h4 className="font-semibold flex items-center gap-2">
                          <MessageSquare className="h-4 w-4" />
                          Discussions (
                          {proposal.discussions.length})
                        </h4>

                        {proposal.discussions.map(
                          (discussion: any) => (
                            <div
                              key={discussion.id}
                              className="border-l-2 border-gray-200 pl-4 py-2"
                            >
                              <p className="text-sm">
                                {getContent(discussion)}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                By User •{' '}
                                {new Date(
                                  discussion.created_at
                                ).toLocaleDateString()}
                              </p>
                            </div>
                          )
                        )}

                        {user && (
                          <div className="">
                            {/* <Textarea
                              placeholder="Add a comment..."
                              value={newProposalComment.content}
                              onChange={(e) =>
                                setNewProposalComment({
                                  ...newProposalComment,
                                  content: e.target.value,
                                })
                              }
                              className="flex-1"
                              rows={2}
                            />
                            <Button
                              onClick={() =>
                                handleSubmitProposalComment(proposal.id)
                              }
                              disabled={
                                submittingComment === proposal.id ||
                                !newProposalComment.content.trim()
                              }
                              size="sm"
                            >
                              {submittingComment === proposal.id
                                ? 'Posting...'
                                : 'Post'}
                            </Button> */}
                            <CommentForm proposal_id={proposal.id} />
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
                      Share your ideas and suggestions for this democratic
                      process
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <NewProposalForm process_id={process_id} />
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
                    {process_data.discussions
                      .filter((d:any) => !d.proposal_id)
                      .map((discussion:any) => (
                        <div
                          key={discussion.id}
                          className="border-l-2 border-gray-200 pl-4 py-2"
                        >
                          <p>{getContent(discussion)}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            By User •{' '}
                            {new Date(
                              discussion.created_at
                            ).toLocaleDateString()}
                          </p>
                        </div>
                      ))}

                    {process_data.discussions.filter((d:any) => !d.proposal_id).length === 0 && (
                      <p className="text-muted-foreground text-center py-8">
                        No discussions yet. Be the first to share your thoughts!
                      </p>
                    )}

                    {user && (
                      <div className="space-y-2 mt-6">
                        <DiscussionForm process_id={process_id} />
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
  );
}

