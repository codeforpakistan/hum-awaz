'use client'

import { useEffect, useState } from 'react'
import { redirect } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { MainNav } from '@/components/main-nav'
import { LanguageSwitcher } from '@/components/language-switcher'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { supabase, Profile } from '@/lib/supabase'
import { Vote, User, Save, Shield, AlertCircle } from 'lucide-react'
import Link from 'next/link'

export default function ProfilePage() {
  const { user, loading: authLoading, signOut } = useAuth()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [formData, setFormData] = useState({
    username: '',
    full_name: '',
    bio: '',
    location: '',
    preferred_language: 'en' as 'en' | 'ur'
  })
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [passwordError, setPasswordError] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState('')
  const [changingPassword, setChangingPassword] = useState(false)

  useEffect(() => {
    if (!authLoading && !user) {
      redirect('/login')
    }
    if (user) {
      fetchProfile()
    }
  }, [user, authLoading])

  const fetchProfile = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (data) {
        setProfile(data)
        setFormData({
          username: data.username || '',
          full_name: data.full_name || '',
          bio: data.bio || '',
          location: data.location || '',
          preferred_language: data.preferred_language || 'en'
        })
      } else if (error && error.code === 'PGRST116') {
        // Profile doesn't exist, create one
        const { data: newProfile } = await supabase
          .from('profiles')
          .insert([{
            id: user.id,
            full_name: user.user_metadata?.full_name || '',
            preferred_language: 'en'
          }])
          .select()
          .single()

        if (newProfile) {
          setProfile(newProfile)
          setFormData({
            username: newProfile.username || '',
            full_name: newProfile.full_name || '',
            bio: newProfile.bio || '',
            location: newProfile.location || '',
            preferred_language: newProfile.preferred_language || 'en'
          })
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setSaving(true)
    setMessage('')

    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          username: formData.username || null,
          full_name: formData.full_name || null,
          bio: formData.bio || null,
          location: formData.location || null,
          preferred_language: formData.preferred_language
        })

      if (error) {
        setMessage('Failed to update profile')
      } else {
        setMessage('Profile updated successfully!')
        await fetchProfile()
      }
    } catch (error) {
      setMessage('An unexpected error occurred')
    } finally {
      setSaving(false)
    }
  }

  const handleSignOut = async () => {
    await signOut()
    redirect('/')
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    
    setPasswordError('')
    setPasswordSuccess('')

    // Validate passwords
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('New passwords do not match')
      return
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters long')
      return
    }

    setChangingPassword(true)

    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword
      })

      if (error) {
        setPasswordError(error.message)
      } else {
        setPasswordSuccess('Password updated successfully!')
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        })
      }
    } catch (error) {
      setPasswordError('An unexpected error occurred')
    } finally {
      setChangingPassword(false)
    }
  }

  if (authLoading || loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>
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

      <main className="flex-1 container py-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <User className="h-8 w-8" />
              My Profile
            </h1>
            <p className="text-muted-foreground mt-2">
              Manage your account settings and preferences
            </p>
          </div>

          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="profile" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Profile
              </TabsTrigger>
              <TabsTrigger value="security" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Security
              </TabsTrigger>
              {/* <TabsTrigger value="notifications" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Notifications
              </TabsTrigger> */}
            </TabsList>

            <TabsContent value="profile" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Account Information</CardTitle>
                  <CardDescription>
                    Update your personal information and preferences
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {message && (
                      <Alert variant={message.includes('successfully') ? 'default' : 'destructive'}>
                        <AlertDescription>{message}</AlertDescription>
                      </Alert>
                    )}

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="full_name">Full Name</Label>
                        <Input
                          id="full_name"
                          value={formData.full_name}
                          onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                          placeholder="Enter your full name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="username">Username</Label>
                        <Input
                          id="username"
                          value={formData.username}
                          onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                          placeholder="Choose a username"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        value={user?.email || ''}
                        disabled
                        className="bg-muted"
                      />
                      <p className="text-xs text-muted-foreground">
                        Email cannot be changed from this page
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bio">Bio</Label>
                      <Textarea
                        id="bio"
                        value={formData.bio}
                        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                        placeholder="Tell us about yourself..."
                        rows={3}
                      />
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="location">Location</Label>
                        <Input
                          id="location"
                          value={formData.location}
                          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                          placeholder="City, Province"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="language">Preferred Language</Label>
                        <Select 
                          value={formData.preferred_language} 
                          onValueChange={(value: 'en' | 'ur') => setFormData({ ...formData, preferred_language: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="en">English</SelectItem>
                            <SelectItem value="ur">اردو (Urdu)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="flex gap-4 pt-4">
                      <Button type="submit" disabled={saving} className="flex items-center gap-2">
                        <Save className="h-4 w-4" />
                        {saving ? 'Saving...' : 'Save Changes'}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Account Status</CardTitle>
                  <CardDescription>
                    Your account verification and participation status
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between py-2">
                      <span>Account Status</span>
                      <span className="text-sm text-emerald-600 font-medium">Active</span>
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <span>Verification Status</span>
                      <span className={`text-sm font-medium ${profile?.is_verified ? 'text-emerald-600' : 'text-yellow-600'}`}>
                        {profile?.is_verified ? 'Verified' : 'Pending'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <span>Member Since</span>
                      <span className="text-sm text-muted-foreground">
                        {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'N/A'}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="security" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Change Password</CardTitle>
                  <CardDescription>
                    Update your password to keep your account secure
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handlePasswordChange} className="space-y-4">
                    {passwordError && (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{passwordError}</AlertDescription>
                      </Alert>
                    )}
                    {passwordSuccess && (
                      <Alert>
                        <AlertDescription>{passwordSuccess}</AlertDescription>
                      </Alert>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="newPassword">New Password</Label>
                      <Input
                        id="newPassword"
                        type="password"
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                        placeholder="Enter new password"
                        required
                      />
                      <p className="text-xs text-muted-foreground">
                        Must be at least 6 characters long
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm New Password</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                        placeholder="Confirm new password"
                        required
                      />
                    </div>

                    <Button type="submit" disabled={changingPassword}>
                      {changingPassword ? 'Changing Password...' : 'Change Password'}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Session Management</CardTitle>
                  <CardDescription>
                    Manage your active sessions and sign out from all devices
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Current Session</p>
                      <p className="text-sm text-muted-foreground">
                        Signed in on {new Date().toLocaleDateString()}
                      </p>
                    </div>
                    <Badge variant="secondary">Active</Badge>
                  </div>
                  <div className="pt-4 space-y-2">
                    <Button variant="outline" onClick={handleSignOut} className="w-full">
                      Sign Out
                    </Button>
                    <p className="text-xs text-muted-foreground text-center">
                      This will sign you out from the current device only
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notifications" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Email Notifications</CardTitle>
                  <CardDescription>
                    Choose what updates you want to receive via email
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Process Updates</p>
                        <p className="text-sm text-muted-foreground">
                          Get notified when processes you're participating in have updates
                        </p>
                      </div>
                      <div className="text-sm text-muted-foreground">Coming Soon</div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Proposal Responses</p>
                        <p className="text-sm text-muted-foreground">
                          Receive notifications when your proposals get votes or comments
                        </p>
                      </div>
                      <div className="text-sm text-muted-foreground">Coming Soon</div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Weekly Digest</p>
                        <p className="text-sm text-muted-foreground">
                          Summary of democratic activities in your areas of interest
                        </p>
                      </div>
                      <div className="text-sm text-muted-foreground">Coming Soon</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  )
}