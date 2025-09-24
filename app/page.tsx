'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { LanguageSwitcher } from '@/components/language-switcher';
import { MainNav } from '@/components/main-nav';
import { ActiveProcesses } from '@/components/active-processes';
import { ParticipationStats } from '@/components/participation-stats';
import { HowToParticipate } from '@/components/how-to-participate';
import { Footer } from '@/components/footer';
import { ShareButton } from '@/components/share-button';
import { ChevronRight, Users, BarChart3, Vote } from 'lucide-react';
import Link from 'next/link';
import { useLanguage } from '@/components/language-provider';
import { useSession, signOut } from 'next-auth/react'

export default function Home() {
  const { t } = useLanguage();
  const { data: session, status } = useSession()
  const user = session?.user
  const handleLogout = () => signOut()

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container px-4 md:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2 md:gap-6">
              <Link href="/" className="flex items-center space-x-1 md:space-x-2">
                <Vote className="h-5 w-5 md:h-6 md:w-6 text-emerald-600" />
                <span className="font-bold text-lg md:text-xl">Hum Awaz</span>
            </Link>
            <MainNav />
          </div>
            <div className="flex items-center gap-2 md:gap-4">
            <LanguageSwitcher />
            {user ? (
                <Button asChild variant="outline" size="sm" className="hidden md:inline-flex">
                <Link href="/dashboard">Dashboard</Link>
              </Button>
            ) : (
                <div className="hidden md:flex gap-2">
                <Button asChild variant="outline" size="sm">
                  <Link href="/login">{t('common.login')}</Link>
                </Button>
                <Button asChild size="sm">
                  <Link href="/register">{t('common.register')}</Link>
                </Button>
                </div>
            )}
            </div>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <section className="w-full py-8 sm:py-12 md:py-24 lg:py-32 bg-emerald-50">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
              <div className="space-y-4 order-2 lg:order-1">
                <h1 className="text-2xl font-bold tracking-tighter sm:text-3xl md:text-4xl lg:text-5xl">
                  {t('home.hero.title')}
                </h1>
                <p className="text-base sm:text-lg text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  {t('home.hero.subtitle')}
                </p>
                <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                  <Button asChild size="default" className="w-full sm:w-auto">
                    <Link href="/processes">
                      {t('home.hero.explore')}
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="default" className="w-full sm:w-auto">
                    <Link href="/about">{t('home.hero.learnMore')}</Link>
                  </Button>
                  <ShareButton
                    url={
                      typeof window !== 'undefined'
                        ? window.location.origin
                        : ''
                    }
                    title="Hum Awaaz - Digital Democracy Platform"
                    description="Join Pakistan's digital democracy platform for civic participation and democratic processes"
                    variant="outline"
                    size="default"
                    className="w-full sm:w-auto"
                  />
                </div>
              </div>
              <div className="flex justify-center order-1 lg:order-2">
                <img
                  src="/pakistani-democratic-discussion.png"
                  alt="Pakistani citizens participating in democratic discussion"
                  className="rounded-lg object-cover aspect-video overflow-hidden w-full max-w-[500px] lg:max-w-[600px]"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="w-full py-8 sm:py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-2xl font-bold tracking-tighter sm:text-3xl md:text-4xl lg:text-5xl">
                  Active Consultations
                </h2>
                <p className="max-w-[900px] text-base sm:text-lg text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed px-4">
                  Join ongoing discussions and proposals that shape
                  Pakistan&apos;s future
                </p>
              </div>
            </div>
            <ActiveProcesses />
          </div>
        </section>

        <section className="w-full py-8 sm:py-12 md:py-24 lg:py-32 bg-gray-50">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 lg:gap-12">
              <Card>
                <CardHeader>
                  <Users className="h-8 w-8 text-emerald-600 mb-2" />
                  <CardTitle>{t('features.inclusive.title')}</CardTitle>
                  <CardDescription>
                    {t('features.inclusive.description')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p>
                    With support for multiple languages including Urdu and
                    English, and accessibility features for users with different
                    needs.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <BarChart3 className="h-8 w-8 text-emerald-600 mb-2" />
                  <CardTitle>{t('features.transparent.title')}</CardTitle>
                  <CardDescription>
                    {t('features.transparent.description')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p>
                    Track the progress of initiatives, see who supports them,
                    and monitor how they transform from ideas to action with
                    complete transparency.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <Vote className="h-8 w-8 text-emerald-600 mb-2" />
                  <CardTitle>{t('features.secure.title')}</CardTitle>
                  <CardDescription>
                    {t('features.secure.description')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p>
                    Our secure voting system ensures that your opinion counts
                    while protecting your privacy and the integrity of the
                    democratic process.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section className="w-full py-8 sm:py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-2xl font-bold tracking-tighter sm:text-3xl md:text-4xl lg:text-5xl">
                  Participation Statistics
                </h2>
                <p className="max-w-[900px] text-base sm:text-lg text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed px-4">
                  See how Pakistanis are engaging with democratic processes
                </p>
              </div>
            </div>
            <ParticipationStats />
          </div>
        </section>

        <section className="w-full py-8 sm:py-12 md:py-24 lg:py-32 bg-emerald-50">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-2xl font-bold tracking-tighter sm:text-3xl md:text-4xl lg:text-5xl">
                  {t('howTo.title')}
                </h2>
                <p className="max-w-[900px] text-base sm:text-lg text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed px-4">
                  {t('howTo.subtitle')}
                </p>
              </div>
            </div>
            <HowToParticipate />
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
