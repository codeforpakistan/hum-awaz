'use client'

import { useState } from 'react'
import { MainNav } from '@/components/main-nav'
import { LanguageSwitcher } from '@/components/language-switcher'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/lib/auth-context'
import { useLanguage } from '@/components/language-provider'
import { Vote, Mail, Phone, MapPin, MessageCircle } from 'lucide-react'
import Link from 'next/link'

export default function ContactPage() {
  const { user } = useAuth()
  const { language } = useLanguage()
  const [submitted, setSubmitted] = useState(false)

  const isUrdu = language === 'ur'

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // For demo purposes, just show success message
    setSubmitted(true)
    setTimeout(() => setSubmitted(false), 3000)
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center space-x-2">
              <Vote className="h-6 w-6 text-emerald-600" />
              <span className="font-bold text-xl">hum awaz</span>
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
                  <Link href="/login">{isUrdu ? 'لاگ ان' : 'Login'}</Link>
                </Button>
                <Button asChild size="sm">
                  <Link href="/register">{isUrdu ? 'رجسٹر' : 'Register'}</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 container py-8 max-w-6xl">
        <div className="space-y-8">
          <div className="text-center space-y-4">
            <MessageCircle className="h-12 w-12 text-emerald-600 mx-auto" />
            <h1 className="text-3xl font-bold">
              {isUrdu ? 'ہم سے رابطہ' : 'Contact Us'}
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {isUrdu 
                ? 'ہم آپ کے سوالات، تجاویز، یا تکنیکی مسائل میں آپ کی مدد کے لیے موجود ہیں۔ ہم سے رابطہ کریں'
                : 'We are here to help with your questions, suggestions, or technical issues. Get in touch with us'
              }
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            {/* Contact Form */}
            <Card>
              <CardHeader>
                <CardTitle>
                  {isUrdu ? 'پیغام بھیجیں' : 'Send Message'}
                </CardTitle>
                <CardDescription>
                  {isUrdu 
                    ? 'اپنے سوالات یا تجاویز ہمیں بھیجیں، ہم جلد جواب دیں گے'
                    : 'Send us your questions or suggestions and we will respond promptly'
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">
                      {isUrdu ? 'نام' : 'Name'}
                    </Label>
                    <Input 
                      id="name" 
                      placeholder={isUrdu ? 'آپ کا نام' : 'Your name'} 
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">
                      {isUrdu ? 'ای میل' : 'Email'}
                    </Label>
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder={isUrdu ? 'آپ کا ای میل ایڈریس' : 'Your email address'} 
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subject">
                      {isUrdu ? 'موضوع' : 'Subject'}
                    </Label>
                    <Input 
                      id="subject" 
                      placeholder={isUrdu ? 'پیغام کا موضوع' : 'Message subject'} 
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message">
                      {isUrdu ? 'پیغام' : 'Message'}
                    </Label>
                    <Textarea 
                      id="message" 
                      placeholder={isUrdu ? 'تفصیلی پیغام لکھیں...' : 'Write your detailed message...'}
                      rows={5}
                      required 
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={submitted}>
                    {submitted 
                      ? (isUrdu ? 'بھیج دیا گیا!' : 'Sent!') 
                      : (isUrdu ? 'پیغام بھیجیں' : 'Send Message')
                    }
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>
                    {isUrdu ? 'رابطے کی معلومات' : 'Contact Information'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Mail className="h-5 w-5 text-emerald-600 mt-1" />
                    <div>
                      <p className="font-medium">
                        {isUrdu ? 'ای میل' : 'Email'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        support@codeforpakistan.org
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>
                    {isUrdu ? 'اکثر پوچھے جانے والے سوالات' : 'Frequently Asked Questions'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="font-medium text-sm">
                      {isUrdu ? 'کیا میں اپنا ووٹ تبدیل کر سکتا ہوں؟' : 'Can I change my vote?'}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {isUrdu 
                        ? 'ہاں، آپ ڈیڈ لائن سے پہلے اپنا ووٹ تبدیل کر سکتے ہیں۔'
                        : 'Yes, you can change your vote before the deadline.'
                      }
                    </p>
                  </div>
                  <div>
                    <p className="font-medium text-sm">
                      {isUrdu ? 'کیا میری معلومات محفوظ ہیں؟' : 'Is my information secure?'}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {isUrdu 
                        ? 'ہاں، ہم جدید سیکیورٹی استعمال کرتے ہیں۔ '
                        : 'Yes, we use modern security measures. '
                      }
                      <Link href="/privacy" className="text-emerald-600 hover:underline">
                        {isUrdu ? 'رازداری پالیسی دیکھیں' : 'See privacy policy'}
                      </Link>
                    </p>
                  </div>
                  <div>
                    <p className="font-medium text-sm">
                      {isUrdu ? 'تکنیکی مسئلے کی صورت میں کیا کریں؟' : 'What to do for technical issues?'}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {isUrdu 
                        ? 'اوپر دیے گئے فارم سے ہم سے رابطہ کریں یا براؤزر ریفریش کریں۔'
                        : 'Contact us via the form above or try refreshing your browser.'
                      }
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>
                    {isUrdu ? 'جواب کا وقت' : 'Response Time'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {isUrdu 
                      ? 'ہم 24-48 گھنٹوں میں جواب دینے کی کوشش کرتے ہیں۔ فوری مدد کے لیے فون کریں۔'
                      : 'We aim to respond within 24-48 hours. For urgent assistance, please call us.'
                    }
                  </p>
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