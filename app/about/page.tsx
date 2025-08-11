'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MainNav } from "@/components/main-nav"
import { LanguageSwitcher } from "@/components/language-switcher"
import { Footer } from "@/components/footer"
import { useAuth } from '@/lib/auth-context'
import { useLanguage } from '@/components/language-provider'
import { Vote, Users, Globe, Shield, Zap, Heart, Github, Mail, Twitter } from "lucide-react"
import Link from "next/link"

export default function AboutPage() {
  const { user } = useAuth()
  const { t } = useLanguage()

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
        {/* Hero Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-emerald-50 dark:bg-emerald-950/20">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
              <div className="space-y-4">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  About Hum Awaaz
                </h1>
                <p className="max-w-[600px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                  Hum Awaaz (Our Voice) is Pakistan's digital democracy platform, empowering citizens to participate 
                  in democratic processes, deliberate on public issues, and contribute to collective decision-making.
                </p>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button asChild size="lg">
                    <Link href="/processes">Start Participating</Link>
                  </Button>
                  <Button asChild variant="outline" size="lg">
                    <Link href="/register">Join the Movement</Link>
                  </Button>
                </div>
              </div>
              <div className="flex justify-center">
                <img
                  src="/pakistani-democratic-discussion.png"
                  alt="Pakistani citizens participating in democratic discussion"
                  className="rounded-lg object-cover aspect-video overflow-hidden"
                  width={600}
                  height={400}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Mission Section */}
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Our Mission</h2>
                <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                  To strengthen Pakistan's democracy by providing citizens with accessible, transparent, 
                  and secure digital tools for civic participation.
                </p>
              </div>
            </div>
            
            <div className="grid gap-6 lg:grid-cols-3 lg:gap-12 mt-12">
              <Card>
                <CardHeader>
                  <Users className="h-8 w-8 text-emerald-600 mb-2" />
                  <CardTitle>Inclusive Democracy</CardTitle>
                  <CardDescription>
                    Every Pakistani citizen deserves a voice in shaping their country's future
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p>
                    We believe in breaking down barriers to participation, ensuring that democracy 
                    works for everyone regardless of their background, location, or technical expertise.
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <Globe className="h-8 w-8 text-emerald-600 mb-2" />
                  <CardTitle>Cultural Diversity</CardTitle>
                  <CardDescription>
                    Celebrating Pakistan's rich linguistic and cultural heritage
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p>
                    With support for Urdu and English, and plans to include more local languages, 
                    we ensure that language is never a barrier to democratic participation.
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <Shield className="h-8 w-8 text-emerald-600 mb-2" />
                  <CardTitle>Trust & Security</CardTitle>
                  <CardDescription>
                    Building trust through transparency and robust security measures
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p>
                    Our platform prioritizes the security and privacy of all participants while 
                    maintaining complete transparency in democratic processes.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-50 dark:bg-gray-900/50">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">How It Works</h2>
                <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                  Simple steps to make your voice heard in Pakistan's democracy
                </p>
              </div>
            </div>
            
            <div className="grid gap-6 lg:grid-cols-4 lg:gap-8 mt-12">
              <div className="flex flex-col items-center text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/20 flex items-center justify-center">
                  <span className="text-xl font-bold text-emerald-600">1</span>
                </div>
                <h3 className="text-lg font-semibold">Register</h3>
                <p className="text-sm text-muted-foreground">
                  Create your account and join the democratic community
                </p>
              </div>
              
              <div className="flex flex-col items-center text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/20 flex items-center justify-center">
                  <span className="text-xl font-bold text-emerald-600">2</span>
                </div>
                <h3 className="text-lg font-semibold">Explore</h3>
                <p className="text-sm text-muted-foreground">
                  Browse active processes and proposals in your area of interest
                </p>
              </div>
              
              <div className="flex flex-col items-center text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/20 flex items-center justify-center">
                  <span className="text-xl font-bold text-emerald-600">3</span>
                </div>
                <h3 className="text-lg font-semibold">Participate</h3>
                <p className="text-sm text-muted-foreground">
                  Submit proposals, vote, and engage in meaningful discussions
                </p>
              </div>
              
              <div className="flex flex-col items-center text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/20 flex items-center justify-center">
                  <span className="text-xl font-bold text-emerald-600">4</span>
                </div>
                <h3 className="text-lg font-semibold">Impact</h3>
                <p className="text-sm text-muted-foreground">
                  See your contributions shape policies and decisions
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Platform Features</h2>
                <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                  Powerful tools designed for effective democratic participation
                </p>
              </div>
            </div>
            
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 mt-12">
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <Zap className="h-6 w-6 text-emerald-600 mt-1" />
                  <div>
                    <h3 className="text-lg font-semibold">Real-time Participation</h3>
                    <p className="text-muted-foreground">
                      Engage with live democratic processes and see results in real-time
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <Vote className="h-6 w-6 text-emerald-600 mt-1" />
                  <div>
                    <h3 className="text-lg font-semibold">Secure Voting</h3>
                    <p className="text-muted-foreground">
                      Cast your vote with confidence using our secure voting system
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <Users className="h-6 w-6 text-emerald-600 mt-1" />
                  <div>
                    <h3 className="text-lg font-semibold">Community Discussions</h3>
                    <p className="text-muted-foreground">
                      Engage in meaningful debates and discussions with fellow citizens
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <Shield className="h-6 w-6 text-emerald-600 mt-1" />
                  <div>
                    <h3 className="text-lg font-semibold">Privacy Protection</h3>
                    <p className="text-muted-foreground">
                      Your personal information and voting choices are protected
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <Globe className="h-6 w-6 text-emerald-600 mt-1" />
                  <div>
                    <h3 className="text-lg font-semibold">Multi-language Support</h3>
                    <p className="text-muted-foreground">
                      Access the platform in Urdu, English, and more languages
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <Heart className="h-6 w-6 text-emerald-600 mt-1" />
                  <div>
                    <h3 className="text-lg font-semibold">Open Source</h3>
                    <p className="text-muted-foreground">
                      Built with transparency and community collaboration in mind
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Contact */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-emerald-50 dark:bg-emerald-950/20">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Get Involved</h2>
                <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                  Join us in building a stronger democracy for Pakistan
                </p>
              </div>
            </div>
            
            <div className="grid gap-6 lg:grid-cols-3 lg:gap-8 mt-12">
              <Card>
                <CardHeader className="text-center">
                  <Mail className="h-8 w-8 text-emerald-600 mx-auto mb-2" />
                  <CardTitle>Contact Us</CardTitle>
                  <CardDescription>Have questions or suggestions?</CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <Button asChild variant="outline">
                    <a href="mailto:support@codeforpakistan.org">Send Email</a>
                  </Button>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="text-center">
                  <Github className="h-8 w-8 text-emerald-600 mx-auto mb-2" />
                  <CardTitle>Contribute</CardTitle>
                  <CardDescription>Help us improve the platform</CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <Button asChild variant="outline">
                    <a href="https://github.com/codeforpakistan/hum-awaaz" target="_blank" rel="noopener noreferrer">
                      View on GitHub
                    </a>
                  </Button>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="text-center">
                  <Twitter className="h-8 w-8 text-emerald-600 mx-auto mb-2" />
                  <CardTitle>Follow Us</CardTitle>
                  <CardDescription>Stay updated with the latest news</CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <Button asChild variant="outline">
                    <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
                      Follow @HumAwaaz
                    </a>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
} 