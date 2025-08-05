'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { MainNav } from '@/components/main-nav'
import { LanguageSwitcher } from '@/components/language-switcher'
import { Footer } from '@/components/footer'
import { useAuth } from '@/lib/auth-context'
import { useLanguage } from '@/components/language-provider'
import { supabase } from '@/lib/supabase'
import { Vote, ChevronLeft } from 'lucide-react'
import Link from 'next/link'

export default function NewProcessPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { t } = useLanguage()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  const [formData, setFormData] = useState({
    title: '',
    title_ur: '',
    description: '',
    description_ur: '',
    category: '',
    organization: '',
    end_date: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setError('')
    setSuccess('')
    setLoading(true)

    try {
      const { data, error } = await supabase
        .from('processes')
        .insert({
          title: formData.title,
          title_ur: formData.title_ur || null,
          description: formData.description,
          description_ur: formData.description_ur || null,
          category: formData.category,
          organization: formData.organization || null,
          end_date: formData.end_date,
          status: 'active',
          created_by: user.id
        })
        .select()
        .single()

      if (error) {
        setError('Failed to create process')
        console.error('Error creating process:', error)
      } else {
        setSuccess('Process created successfully!')
        setTimeout(() => {
          router.push(`/processes/${data.id}`)
        }, 1000)
      }
    } catch (error) {
      setError('An unexpected error occurred')
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  if (!user) {
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
                <Link href="/login">{t('common.login')}</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/register">{t('common.register')}</Link>
              </Button>
            </div>
          </div>
        </header>
        <main className="flex-1 flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardContent className="text-center py-12">
              <p className="text-muted-foreground mb-4">
                You need to be logged in to create a new process
              </p>
              <div className="space-x-2">
                <Button asChild>
                  <Link href="/login">Login</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/register">Register</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

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
              <Link href="/dashboard">Dashboard</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <div className="container py-8 max-w-4xl">
          <div className="mb-6">
            <Button asChild variant="ghost" className="mb-4">
              <Link href="/processes">
                <ChevronLeft className="mr-2 h-4 w-4" />
                Back to Processes
              </Link>
            </Button>
            
            <h1 className="text-3xl font-bold">Create New Democratic Process</h1>
            <p className="text-muted-foreground">
              Start a new consultation process to gather public input on important issues
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Process Details</CardTitle>
              <CardDescription>
                Provide information about the democratic process you want to create
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                {success && (
                  <Alert>
                    <AlertDescription>{success}</AlertDescription>
                  </Alert>
                )}

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title (English) *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      placeholder="Enter process title in English"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="title_ur">Title (Urdu)</Label>
                    <Input
                      id="title_ur"
                      value={formData.title_ur}
                      onChange={(e) => handleInputChange('title_ur', e.target.value)}
                      placeholder="عنوان اردو میں درج کریں"
                      dir="rtl"
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="description">Description (English) *</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder="Describe the purpose and goals of this democratic process"
                      rows={5}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description_ur">Description (Urdu)</Label>
                    <Textarea
                      id="description_ur"
                      value={formData.description_ur}
                      onChange={(e) => handleInputChange('description_ur', e.target.value)}
                      placeholder="اس جمہوری عمل کے مقصد اور اہداف کو بیان کریں"
                      rows={5}
                      dir="rtl"
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <Select onValueChange={(value) => handleInputChange('category', value)} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="education">Education</SelectItem>
                        <SelectItem value="healthcare">Healthcare</SelectItem>
                        <SelectItem value="infrastructure">Infrastructure</SelectItem>
                        <SelectItem value="economy">Economy</SelectItem>
                        <SelectItem value="environment">Environment</SelectItem>
                        <SelectItem value="governance">Governance</SelectItem>
                        <SelectItem value="social">Social Issues</SelectItem>
                        <SelectItem value="technology">Technology</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="organization">Organization</Label>
                    <Input
                      id="organization"
                      value={formData.organization}
                      onChange={(e) => handleInputChange('organization', e.target.value)}
                      placeholder="e.g., Ministry of Education, Local Government"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="end_date">End Date *</Label>
                  <Input
                    id="end_date"
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => handleInputChange('end_date', e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                  <p className="text-sm text-muted-foreground">
                    Select when this consultation process should end
                  </p>
                </div>

                <div className="flex justify-end space-x-4">
                  <Button asChild variant="outline">
                    <Link href="/processes">Cancel</Link>
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? 'Creating...' : 'Create Process'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  )
}