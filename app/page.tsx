import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LanguageSwitcher } from "@/components/language-switcher"
import { MainNav } from "@/components/main-nav"
import { ActiveProcesses } from "@/components/active-processes"
import { ParticipationStats } from "@/components/participation-stats"
import { HowToParticipate } from "@/components/how-to-participate"
import { Footer } from "@/components/footer"
import { ChevronRight, Users, BarChart3, Vote } from "lucide-react"
import Link from "next/link"

export default function Home() {
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
            <Button asChild variant="outline" size="sm">
              <Link href="/login">Login</Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/register">Register</Link>
            </Button>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 bg-emerald-50 dark:bg-emerald-950/20">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
              <div className="space-y-4">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Your Voice Matters in Pakistan&apos;s Democracy
                </h1>
                <p className="max-w-[600px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                  Hum Awaaz empowers citizens to participate in democratic processes, deliberate on public issues, and
                  contribute to collective decision-making.
                </p>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button asChild size="lg">
                    <Link href="/processes">
                      Explore Active Processes
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="lg">
                    <Link href="/about">Learn More</Link>
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

        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Active Consultations</h2>
                <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                  Join ongoing discussions and proposals that shape Pakistan&apos;s future
                </p>
              </div>
            </div>
            <ActiveProcesses />
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-50 dark:bg-gray-900/50">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-3 lg:gap-12">
              <Card>
                <CardHeader>
                  <Users className="h-8 w-8 text-emerald-600 mb-2" />
                  <CardTitle>Inclusive Participation</CardTitle>
                  <CardDescription>
                    Designed for all Pakistanis regardless of background or technical expertise
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p>
                    With support for multiple languages including Urdu, Punjabi, Sindhi, Pashto, and Balochi, and
                    accessibility features for users with different needs.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <BarChart3 className="h-8 w-8 text-emerald-600 mb-2" />
                  <CardTitle>Transparent Processes</CardTitle>
                  <CardDescription>Follow proposals from submission to implementation</CardDescription>
                </CardHeader>
                <CardContent>
                  <p>
                    Track the progress of initiatives, see who supports them, and monitor how they transform from ideas
                    to action with complete transparency.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <Vote className="h-8 w-8 text-emerald-600 mb-2" />
                  <CardTitle>Secure Voting</CardTitle>
                  <CardDescription>Make your voice heard with confidence</CardDescription>
                </CardHeader>
                <CardContent>
                  <p>
                    Our secure voting system ensures that your opinion counts while protecting your privacy and the
                    integrity of the democratic process.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Participation Statistics
                </h2>
                <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                  See how Pakistanis are engaging with democratic processes
                </p>
              </div>
            </div>
            <ParticipationStats />
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32 bg-emerald-50 dark:bg-emerald-950/20">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">How to Participate</h2>
                <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                  Getting started with Hum Awaaz is easy
                </p>
              </div>
            </div>
            <HowToParticipate />
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
