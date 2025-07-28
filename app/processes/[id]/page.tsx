import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { MainNav } from "@/components/main-nav"
import { LanguageSwitcher } from "@/components/language-switcher"
import { Footer } from "@/components/footer"
import { Calendar, Users, MapPin, FileText, MessageSquare, VoteIcon, ThumbsUp, Share2 } from "lucide-react"
import Link from "next/link"

export default function ProcessDetailPage({ params }: { params: { id: string } }) {
  // Mock data for a specific process
  const process = {
    id: Number.parseInt(params.id),
    title: "National Education Curriculum Reform",
    description:
      "Participate in shaping the future of education in Pakistan by providing feedback on proposed curriculum changes.",
    category: "Education",
    phase: "Discussion",
    endDate: "2025-06-15",
    participants: 1245,
    progress: 35,
    location: "National",
    background:
      "The Ministry of Education has proposed updates to the national curriculum to better prepare students for the modern workforce and global challenges. This consultation seeks public input on the proposed changes.",
    timeline: [
      { date: "2025-04-01", event: "Process launched" },
      { date: "2025-04-01 to 2025-05-15", event: "Proposal submission phase" },
      { date: "2025-05-16 to 2025-06-15", event: "Discussion phase" },
      { date: "2025-06-16 to 2025-06-30", event: "Voting phase" },
      { date: "2025-07-15", event: "Results announcement" },
      { date: "2025-09-01", event: "Implementation begins" },
    ],
    proposals: [
      {
        id: 1,
        title: "Integrate Digital Literacy Across All Subjects",
        author: "Ministry of Education",
        votes: 342,
        comments: 56,
      },
      {
        id: 2,
        title: "Add Climate Education to Science Curriculum",
        author: "Environmental Education Coalition",
        votes: 287,
        comments: 42,
      },
      {
        id: 3,
        title: "Strengthen Critical Thinking in Humanities",
        author: "Pakistan Teachers Association",
        votes: 215,
        comments: 38,
      },
    ],
    discussions: [
      {
        id: 1,
        title: "How should we balance traditional and modern subjects?",
        participants: 87,
        comments: 124,
        lastActive: "2025-05-10",
      },
      {
        id: 2,
        title: "What skills do employers need from graduates?",
        participants: 65,
        comments: 98,
        lastActive: "2025-05-12",
      },
      {
        id: 3,
        title: "Regional language instruction in the curriculum",
        participants: 53,
        comments: 76,
        lastActive: "2025-05-14",
      },
    ],
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
          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">{process.category}</Badge>
              <Badge
                variant={
                  process.phase === "Discussion" ? "outline" : process.phase === "Voting" ? "default" : "secondary"
                }
              >
                {process.phase}
              </Badge>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">{process.title}</h1>
            <p className="text-muted-foreground max-w-3xl">{process.description}</p>
          </div>

          <div className="grid gap-6 mt-6 md:grid-cols-3">
            <div className="md:col-span-2">
              <Tabs defaultValue="about">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="about">About</TabsTrigger>
                  <TabsTrigger value="proposals">Proposals</TabsTrigger>
                  <TabsTrigger value="discussions">Discussions</TabsTrigger>
                  <TabsTrigger value="documents">Documents</TabsTrigger>
                </TabsList>
                <TabsContent value="about" className="mt-6 space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Background</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p>{process.background}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle>Timeline</CardTitle>
                      <CardDescription>Key dates for this process</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ol className="relative border-l border-muted">
                        {process.timeline.map((item, index) => (
                          <li key={index} className="mb-6 ml-6">
                            <span className="absolute flex items-center justify-center w-6 h-6 bg-emerald-100 rounded-full -left-3 ring-8 ring-background dark:bg-emerald-900/20">
                              <Calendar className="w-3 h-3 text-emerald-600" />
                            </span>
                            <h3 className="font-medium">{item.event}</h3>
                            <p className="text-sm text-muted-foreground">{item.date}</p>
                          </li>
                        ))}
                      </ol>
                    </CardContent>
                  </Card>
                </TabsContent>
                <TabsContent value="proposals" className="mt-6 space-y-6">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold">Proposals</h2>
                    <Button asChild>
                      <Link href={`/processes/${process.id}/proposals/new`}>Submit Proposal</Link>
                    </Button>
                  </div>
                  <div className="space-y-4">
                    {process.proposals.map((proposal) => (
                      <Card key={proposal.id}>
                        <CardHeader>
                          <CardTitle>{proposal.title}</CardTitle>
                          <CardDescription>Proposed by {proposal.author}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center gap-6">
                            <div className="flex items-center gap-2">
                              <ThumbsUp className="h-4 w-4 text-muted-foreground" />
                              <span>{proposal.votes} votes</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <MessageSquare className="h-4 w-4 text-muted-foreground" />
                              <span>{proposal.comments} comments</span>
                            </div>
                          </div>
                        </CardContent>
                        <div className="px-6 pb-6 flex gap-2">
                          <Button asChild variant="outline" size="sm">
                            <Link href={`/processes/${process.id}/proposals/${proposal.id}`}>View Details</Link>
                          </Button>
                          <Button size="sm" variant="ghost" className="gap-1">
                            <ThumbsUp className="h-4 w-4" />
                            Support
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
                <TabsContent value="discussions" className="mt-6 space-y-6">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold">Discussions</h2>
                    <Button asChild>
                      <Link href={`/processes/${process.id}/discussions/new`}>Start Discussion</Link>
                    </Button>
                  </div>
                  <div className="space-y-4">
                    {process.discussions.map((discussion) => (
                      <Card key={discussion.id}>
                        <CardHeader>
                          <CardTitle>{discussion.title}</CardTitle>
                          <CardDescription>
                            {discussion.participants} participants · {discussion.comments} comments · Last active:{" "}
                            {new Date(discussion.lastActive).toLocaleDateString()}
                          </CardDescription>
                        </CardHeader>
                        <div className="px-6 pb-6">
                          <Button asChild>
                            <Link href={`/processes/${process.id}/discussions/${discussion.id}`}>Join Discussion</Link>
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
                <TabsContent value="documents" className="mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Official Documents</CardTitle>
                      <CardDescription>Reference materials for this process</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <FileText className="h-5 w-5 text-muted-foreground" />
                            <div>
                              <p className="font-medium">Current Curriculum Framework</p>
                              <p className="text-sm text-muted-foreground">PDF · 2.4 MB</p>
                            </div>
                          </div>
                          <Button variant="outline" size="sm">
                            Download
                          </Button>
                        </div>
                        <div className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <FileText className="h-5 w-5 text-muted-foreground" />
                            <div>
                              <p className="font-medium">Proposed Curriculum Changes</p>
                              <p className="text-sm text-muted-foreground">PDF · 3.1 MB</p>
                            </div>
                          </div>
                          <Button variant="outline" size="sm">
                            Download
                          </Button>
                        </div>
                        <div className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <FileText className="h-5 w-5 text-muted-foreground" />
                            <div>
                              <p className="font-medium">International Best Practices</p>
                              <p className="text-sm text-muted-foreground">PDF · 1.8 MB</p>
                            </div>
                          </div>
                          <Button variant="outline" size="sm">
                            Download
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Process Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">End Date</p>
                      <p className="text-sm text-muted-foreground">{new Date(process.endDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Scope</p>
                      <p className="text-sm text-muted-foreground">{process.location}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Participants</p>
                      <p className="text-sm text-muted-foreground">{process.participants.toLocaleString()} citizens</p>
                    </div>
                  </div>
                  <Separator />
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Process Progress</span>
                      <span>{process.progress}%</span>
                    </div>
                    <Progress value={process.progress} className="h-2" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button className="w-full justify-start gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Join Discussion
                  </Button>
                  <Button className="w-full justify-start gap-2" variant="outline">
                    <FileText className="h-4 w-4" />
                    Submit Proposal
                  </Button>
                  <Button className="w-full justify-start gap-2" variant="outline">
                    <Share2 className="h-4 w-4" />
                    Share Process
                  </Button>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Organizing Body</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center dark:bg-emerald-900/20">
                      <FileText className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div>
                      <p className="font-medium">Ministry of Education</p>
                      <p className="text-sm text-muted-foreground">Government of Pakistan</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
