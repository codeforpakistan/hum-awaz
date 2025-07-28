import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { MainNav } from "@/components/main-nav"
import { LanguageSwitcher } from "@/components/language-switcher"
import { Footer } from "@/components/footer"
import { ChevronRight, Search, Filter, MapPin, Calendar, Users, Vote } from "lucide-react"
import Link from "next/link"

// Mock data for processes
const processes = [
  {
    id: 1,
    title: "National Education Curriculum Reform",
    description:
      "Participate in shaping the future of education in Pakistan by providing feedback on proposed curriculum changes.",
    category: "Education",
    phase: "Discussion",
    endDate: "2025-06-15",
    participants: 1245,
    progress: 35,
    location: "National",
  },
  {
    id: 2,
    title: "Urban Transportation Improvement",
    description: "Help prioritize transportation projects in major cities to reduce congestion and improve mobility.",
    category: "Infrastructure",
    phase: "Voting",
    endDate: "2025-06-05",
    participants: 3782,
    progress: 75,
    location: "Urban Centers",
  },
  {
    id: 3,
    title: "Healthcare Access Initiative",
    description: "Provide input on proposals to expand healthcare access in rural areas across Pakistan.",
    category: "Healthcare",
    phase: "Proposal",
    endDate: "2025-06-30",
    participants: 892,
    progress: 15,
    location: "Rural Areas",
  },
  {
    id: 4,
    title: "Environmental Protection Policy",
    description: "Help develop policies to protect Pakistan's natural resources and address climate change impacts.",
    category: "Environment",
    phase: "Discussion",
    endDate: "2025-07-10",
    participants: 1567,
    progress: 40,
    location: "National",
  },
  {
    id: 5,
    title: "Digital Literacy Program",
    description: "Contribute to the development of a national digital literacy program to bridge the digital divide.",
    category: "Education",
    phase: "Implementation",
    endDate: "2025-08-20",
    participants: 2134,
    progress: 85,
    location: "National",
  },
  {
    id: 6,
    title: "Lahore Public Parks Improvement",
    description: "Help decide on improvements to public parks in Lahore to enhance community spaces.",
    category: "Urban Planning",
    phase: "Voting",
    endDate: "2025-06-12",
    participants: 945,
    progress: 65,
    location: "Lahore",
  },
]

export default function ProcessesPage() {
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
        <div className="container py-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Participation Processes</h1>
              <p className="text-muted-foreground">Explore and participate in democratic processes across Pakistan</p>
            </div>
            <Button asChild>
              <Link href="/processes/new">Start a New Process</Link>
            </Button>
          </div>

          <div className="mt-6 flex flex-col gap-4 md:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input type="search" placeholder="Search processes..." className="w-full pl-8" />
            </div>
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              Filters
            </Button>
          </div>

          <Tabs defaultValue="all" className="mt-6">
            <TabsList>
              <TabsTrigger value="all">All Processes</TabsTrigger>
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
            </TabsList>
            <TabsContent value="all" className="mt-6">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {processes.map((process) => (
                  <Card key={process.id} className="flex flex-col">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <Badge
                          variant={
                            process.phase === "Discussion"
                              ? "outline"
                              : process.phase === "Voting"
                                ? "default"
                                : process.phase === "Implementation"
                                  ? "secondary"
                                  : "outline"
                          }
                        >
                          {process.phase}
                        </Badge>
                        <Badge variant="outline">{process.category}</Badge>
                      </div>
                      <CardTitle className="mt-2">{process.title}</CardTitle>
                      <CardDescription>{process.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                        <MapPin className="h-4 w-4" />
                        <span>{process.location}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                        <Calendar className="h-4 w-4" />
                        <span>Ends: {new Date(process.endDate).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                        <Users className="h-4 w-4" />
                        <span>{process.participants.toLocaleString()} participants</span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progress</span>
                          <span>{process.progress}%</span>
                        </div>
                        <Progress value={process.progress} className="h-2" />
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button asChild className="w-full">
                        <Link href={`/processes/${process.id}`}>
                          Participate
                          <ChevronRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </TabsContent>
            <TabsContent value="active">
              <div className="text-center py-12">
                <p className="text-muted-foreground">Please use the filters to view active processes.</p>
              </div>
            </TabsContent>
            <TabsContent value="upcoming">
              <div className="text-center py-12">
                <p className="text-muted-foreground">Please use the filters to view upcoming processes.</p>
              </div>
            </TabsContent>
            <TabsContent value="completed">
              <div className="text-center py-12">
                <p className="text-muted-foreground">Please use the filters to view completed processes.</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  )
}
