"use client"

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { ChevronRight, Users, Calendar } from "lucide-react"
import Link from "next/link"
import { supabase, Process } from '@/lib/supabase'
import { useLanguage } from './language-provider'
import { useProcesses } from '@/lib/queries';

export function ActiveProcesses() {
  const [processes, setProcesses] = useState<Process[]>([])
  const [loading, setLoading] = useState(true)
  const { t, language } = useLanguage()

  const {data: process_data, isPending} = useProcesses()

  // useEffect(() => {
  //   fetchActiveProcesses()
  // }, [])

  // const fetchActiveProcesses = async () => {
  //   try {
  //     const { data, error } = await supabase
  //       .from('processes')
  //       .select('*')
  //       .eq('status', 'active')
  //       .order('created_at', { ascending: false })
  //       .limit(3)

  //     if (error) {
  //       console.error('Error fetching processes:', error)
  //     } else {
  //       setProcesses(data || [])
  //     }
  //   } catch (error) {
  //     console.error('Error:', error)
  //   } finally {
  //     setLoading(false)
  //   }
  // }

  const getProcessTitle = (process: Process) => {
    return language === 'ur' && process.title_ur ? process.title_ur : process.title
  }

  const getProcessDescription = (process: Process) => {
    return language === 'ur' && process.description_ur ? process.description_ur : process.description
  }

  const getStatusLabel = (status: string) => {
    return t(`status.${status}`)
  }

  const getCategoryLabel = (category: string) => {
    return t(`category.${category.toLowerCase()}`)
  }

  if (isPending) {
    return (
      <div className="grid gap-6 mt-8 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="flex flex-col animate-pulse">
            <CardHeader>
              <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                <div className="h-2 bg-gray-200 rounded w-full mt-4"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid gap-6 mt-8 md:grid-cols-2 lg:grid-cols-3">
      {process_data.map((process:any) => (
        <Card key={process.id} className="flex flex-col">
          <CardHeader>
            <div className="flex justify-between items-start">
              <Badge
                variant={
                  process.status === "active" ? "default" : process.status === "closed" ? "secondary" : "outline"
                }
              >
                {getStatusLabel(process.status)}
              </Badge>
              <Badge variant="outline">{getCategoryLabel(process.category)}</Badge>
            </div>
            <CardTitle className="mt-2">{getProcessTitle(process)}</CardTitle>
            <CardDescription>{getProcessDescription(process)}</CardDescription>
          </CardHeader>
          <CardContent className="flex-grow">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <Calendar className="h-4 w-4" />
              <span>{t('processes.ends')}: {new Date(process.end_date).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
              <Users className="h-4 w-4" />
              <span>{process.participation_count || 0} {t('processes.participants')}</span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{t('processes.progress')}</span>
                <span>0%</span>
              </div>
              <Progress value={0} className="h-2" />
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
          <p className="text-muted-foreground">No active processes at the moment</p>
        </div>
      )}
    </div>
  )
}
