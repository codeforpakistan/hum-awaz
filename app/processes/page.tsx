'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { MainNav } from '@/components/main-nav';
import { LanguageSwitcher } from '@/components/language-switcher';
import { Footer } from '@/components/footer';
import { ShareButton } from '@/components/share-button';
import { useLanguage } from '@/components/language-provider';
import { supabase, Process } from '@/lib/supabase';
import {
  ChevronRight,
  Search,
  Filter,
  MapPin,
  Calendar,
  Users,
  Vote,
} from 'lucide-react';
import Link from 'next/link';
import { useSession, signIn, signOut } from "next-auth/react"
import { useProcesses } from '@/lib/queries';
import { useDebounce } from '@/hooks/useDebounce';

export default function ProcessesPage() {
  const { data: session, status } = useSession()
  const user = session?.user


  const { t, language } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const debouncedSearch = useDebounce(searchTerm, 500)

  const effectiveFilters = {
    search: debouncedSearch,
    category: selectedCategory,
  }

  const {data: process_data, isPending} = useProcesses(effectiveFilters)

  const getProcessTitle = (process: Process) => {
    return language === 'ur' && process.title_ur
      ? process.title_ur
      : process.title;
  };

  const getProcessDescription = (process: Process) => {
    return language === 'ur' && process.description_ur
      ? process.description_ur
      : process.description;
  };

  const getStatusLabel = (status: string) => {
    return t(`status.${status}`);
  };

  const getCategoryLabel = (category: string) => {
    return t(`category.${category.toLowerCase()}`);
  };

  const calculateProgress = (process: Process) => {
    const now = new Date();
    const start = new Date(process.start_date);
    const end = new Date(process.end_date);

    if (now < start) return 0;
    if (now > end) return 100;

    const total = end.getTime() - start.getTime();
    const elapsed = now.getTime() - start.getTime();

    return Math.round((elapsed / total) * 100);
  };

  if (isPending || !process_data) {
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
    );
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
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                {t('processes.title')}
              </h1>
              <p className="text-muted-foreground">{t('processes.subtitle')}</p>
            </div>
            {user && (
              <Button asChild>
                <Link href="/processes/new">{t('processes.newProcess')}</Link>
              </Button>
            )}
          </div>

          <div className="mt-6 flex flex-col gap-4 md:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder={t('processes.search')}
                className="w-full pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              {t('processes.filters')}
            </Button>
          </div>

          <Tabs
            defaultValue="all"
            className="mt-6"
            onValueChange={setSelectedCategory}
            value={selectedCategory}
          >
            <TabsList>
              <TabsTrigger value="all">{t('processes.all')}</TabsTrigger>
              <TabsTrigger value="education">
                {t('category.education')}
              </TabsTrigger>
              <TabsTrigger value="healthcare">
                {t('category.healthcare')}
              </TabsTrigger>
              <TabsTrigger value="infrastructure">
                {t('category.infrastructure')}
              </TabsTrigger>
              <TabsTrigger value="economy">{t('category.economy')}</TabsTrigger>
              <TabsTrigger value="environment">
                {t('category.environment')}
              </TabsTrigger>
              <TabsTrigger value="governance">
                {t('category.governance')}
              </TabsTrigger>
            </TabsList>
            <TabsContent value="all" className="mt-6">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {process_data.map((process:any) => (
                  <Card key={process.id} className="flex flex-col">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={
                              process.status === 'active'
                                ? 'default'
                                : process.status === 'closed'
                                ? 'secondary'
                                : 'outline'
                            }
                          >
                            {getStatusLabel(process.status)}
                          </Badge>
                          <Badge variant="outline">
                            {getCategoryLabel(process.category)}
                          </Badge>
                        </div>
                        <ShareButton
                          url={`${
                            typeof window !== 'undefined'
                              ? window.location.origin
                              : ''
                          }/processes/${process.id}`}
                          title={`Join the discussion on: ${getProcessTitle(
                            process
                          )} - Hum Awaaz`}
                          description={`Participate in Pakistan's democratic process. Share your voice on ${getProcessTitle(
                            process
                          )}. Vote, discuss, and help shape our nation's future.`}
                          variant="minimal"
                        />
                      </div>
                      <CardTitle className="mt-2">
                        {getProcessTitle(process)}
                      </CardTitle>
                      <CardDescription>
                        {getProcessDescription(process)}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                        <MapPin className="h-4 w-4" />
                        <span>
                          {process.organization || 'Government Initiative'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {t('processes.ends')}:{' '}
                          {new Date(process.end_date).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                        <Users className="h-4 w-4" />
                        <span>
                          {process.participation_count || 0}{' '}
                          {t('processes.participants')}
                        </span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>{t('processes.progress')}</span>
                          <span>{calculateProgress(process)}%</span>
                        </div>
                        <Progress
                          value={calculateProgress(process)}
                          className="h-2"
                        />
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button asChild className="w-full">
                        <Link href={`/processes/${process.id}`}>
                          {t('processes.participate')}
                          <ChevronRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
                {process_data.length === 0 && (
                  <div className="col-span-full text-center py-12">
                    <p className="text-muted-foreground">No processes found</p>
                  </div>
                )}
              </div>
            </TabsContent>
            {[
              'education',
              'healthcare',
              'infrastructure',
              'economy',
              'environment',
              'governance',
            ].map((category) => (
              <TabsContent key={category} value={category} className="mt-6">
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {process_data.map((process:any) => (
                    <Card key={process.id} className="flex flex-col">
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-2">
                             {process.id}
                            <Badge
                              variant={
                                process.status === 'active'
                                  ? 'default'
                                  : process.status === 'closed'
                                  ? 'secondary'
                                  : 'outline'
                              }
                            >
                              {getStatusLabel(process.status)}
                            </Badge>
                            <Badge variant="outline">
                              {getCategoryLabel(process.category)}
                            </Badge>
                          </div>
                          <ShareButton
                            url={`${
                              typeof window !== 'undefined'
                                ? window.location.origin
                                : ''
                            }/processes/${process.id}`}
                            title={`Join the discussion on: ${getProcessTitle(
                              process
                            )} - Hum Awaaz`}
                            description={`Participate in Pakistan's democratic process. Share your voice on ${getProcessTitle(
                              process
                            )}. Vote, discuss, and help shape our nation's future.`}
                            variant="minimal"
                          />
                        </div>
                        <CardTitle className="mt-2">
                          {getProcessTitle(process)}
                        </CardTitle>
                        <CardDescription>
                          {getProcessDescription(process)}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="flex-grow">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                          <MapPin className="h-4 w-4" />
                          <span>
                            {process.organization || 'Government Initiative'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                          <Calendar className="h-4 w-4" />
                          <span>
                            {t('processes.ends')}:{' '}
                            {new Date(process.end_date).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                          <Users className="h-4 w-4" />
                          <span>
                            {process.participation_count || 0}{' '}
                            {t('processes.participants')}
                          </span>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>{t('processes.progress')}</span>
                            <span>{calculateProgress(process)}%</span>
                          </div>
                          <Progress
                            value={calculateProgress(process)}
                            className="h-2"
                          />
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Button asChild className="w-full">
                          <Link href={`/processes/${process.id}`}>
                            {t('processes.participate')}
                            <ChevronRight className="ml-2 h-4 w-4" />
                          </Link>
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                  {process_data.length === 0 && (
                    <div className="col-span-full text-center py-12">
                      <p className="text-muted-foreground">
                        No processes found in this category
                      </p>
                    </div>
                  )}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
}
