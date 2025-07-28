import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { UserPlus, MessageSquare, Vote, FileText, BarChart3 } from "lucide-react"

export function HowToParticipate() {
  const steps = [
    {
      icon: <UserPlus className="h-10 w-10 text-emerald-600" />,
      title: "Create an Account",
      description:
        "Register with your email or phone number. Verify your identity to participate in official processes.",
    },
    {
      icon: <MessageSquare className="h-10 w-10 text-emerald-600" />,
      title: "Join Discussions",
      description:
        "Participate in deliberations on various topics. Share your perspective and engage with others' ideas.",
    },
    {
      icon: <FileText className="h-10 w-10 text-emerald-600" />,
      title: "Submit Proposals",
      description: "Have an idea to improve your community? Create a proposal and gather support from fellow citizens.",
    },
    {
      icon: <Vote className="h-10 w-10 text-emerald-600" />,
      title: "Vote on Initiatives",
      description: "Cast your vote on proposals and help determine which initiatives should move forward.",
    },
    {
      icon: <BarChart3 className="h-10 w-10 text-emerald-600" />,
      title: "Track Progress",
      description: "Follow the implementation of approved proposals and see the real impact of your participation.",
    },
  ]

  return (
    <div className="grid gap-6 mt-8 md:grid-cols-2 lg:grid-cols-3">
      {steps.map((step, index) => (
        <Card key={index} className="flex flex-col">
          <CardHeader className="flex flex-row items-center gap-4">
            <div className="rounded-full p-2 bg-emerald-100 dark:bg-emerald-900/20">{step.icon}</div>
            <div>
              <CardTitle>Step {index + 1}</CardTitle>
              <CardDescription>{step.title}</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <p>{step.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
