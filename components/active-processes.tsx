"use client"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { ChevronRight, Users, Calendar } from "lucide-react"
import Link from "next/link"

// Mock data for active processes
const activeProcesses = [
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
  },
]

export function ActiveProcesses() {
  return (
    <div className="grid gap-6 mt-8 md:grid-cols-2 lg:grid-cols-3">
      {activeProcesses.map((process) => (
        <Card key={process.id} className="flex flex-col">
          <CardHeader>
            <div className="flex justify-between items-start">
              <Badge
                variant={
                  process.phase === "Discussion" ? "outline" : process.phase === "Voting" ? "default" : "secondary"
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
  )
}
