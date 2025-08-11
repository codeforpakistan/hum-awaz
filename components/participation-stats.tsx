"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts"
import { supabase } from "@/lib/supabase"

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"]

interface Stats {
  totalUsers: number
  totalProcesses: number
  totalProposals: number
  totalVotes: number
  activeProcesses: number
  participationByCategory: { name: string; value: number }[]
}

export function ParticipationStats() {
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalProcesses: 0,
    totalProposals: 0,
    totalVotes: 0,
    activeProcesses: 0,
    participationByCategory: []
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      // Fetch total users
      const { count: userCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })

      // Fetch total processes
      const { count: processCount } = await supabase
        .from('processes')
        .select('*', { count: 'exact', head: true })

      // Fetch active processes
      const { count: activeCount } = await supabase
        .from('processes')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active')

      // Fetch total proposals
      const { count: proposalCount } = await supabase
        .from('proposals')
        .select('*', { count: 'exact', head: true })

      // Fetch total votes
      const { count: voteCount } = await supabase
        .from('votes')
        .select('*', { count: 'exact', head: true })

      // Fetch processes by category for participation breakdown
      const { data: processesData } = await supabase
        .from('processes')
        .select('category, participation_count')
        .in('status', ['active', 'closed', 'completed'])

      // Calculate participation by category
      const categoryMap = new Map<string, number>()
      processesData?.forEach(process => {
        const current = categoryMap.get(process.category) || 0
        categoryMap.set(process.category, current + (process.participation_count || 0))
      })

      const participationByCategory = Array.from(categoryMap.entries())
        .map(([name, value]) => ({
          name: name.charAt(0).toUpperCase() + name.slice(1),
          value
        }))
        .sort((a, b) => b.value - a.value)

      setStats({
        totalUsers: userCount || 0,
        totalProcesses: processCount || 0,
        totalProposals: proposalCount || 0,
        totalVotes: voteCount || 0,
        activeProcesses: activeCount || 0,
        participationByCategory
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="mt-8 text-center">
        <p className="text-muted-foreground">Loading statistics...</p>
      </div>
    )
  }

  return (
    <div className="mt-8">
      {/* Key Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Registered Citizens</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">Active participants</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Democratic Processes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProcesses}</div>
            <p className="text-xs text-muted-foreground mt-1">{stats.activeProcesses} active now</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Citizen Proposals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProposals.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">Ideas submitted</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Votes Cast</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalVotes.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">Democratic participation</p>
          </CardContent>
        </Card>
      </div>

      {/* Category Breakdown */}
      <Tabs defaultValue="category" className="w-full">
        <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
          <TabsTrigger value="category">By Category</TabsTrigger>
          <TabsTrigger value="engagement">Engagement Rate</TabsTrigger>
        </TabsList>
        <TabsContent value="category">
          <Card>
            <CardHeader>
              <CardTitle>Participation by Policy Area</CardTitle>
              <CardDescription>Number of citizens engaging with different policy categories</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              {stats.participationByCategory.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.participationByCategory}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#10b981" name="Participants" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  No participation data available yet
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="engagement">
          <Card>
            <CardHeader>
              <CardTitle>Platform Engagement</CardTitle>
              <CardDescription>How citizens are engaging with democratic processes</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: "Voted on Proposals", value: stats.totalVotes },
                      { name: "Submitted Proposals", value: stats.totalProposals },
                      { name: "Registered Only", value: Math.max(0, stats.totalUsers - (stats.totalVotes / 3)) }
                    ].filter(item => item.value > 0)}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {[0, 1, 2].map((index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
