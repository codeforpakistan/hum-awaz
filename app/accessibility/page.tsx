'use client'

import { MainNav } from '@/components/main-nav'
import { LanguageSwitcher } from '@/components/language-switcher'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/lib/auth-context'
import { useLanguage } from '@/components/language-provider'
import { Vote, Eye, Ear, Hand, Brain, Smartphone, Monitor } from 'lucide-react'
import Link from 'next/link'

export default function AccessibilityPage() {
  const { user } = useAuth()
  const { language } = useLanguage()

  const isUrdu = language === 'ur'

  const features = [
    {
      icon: <Eye className="h-8 w-8 text-emerald-600" />,
      title: isUrdu ? 'بصری رسائی' : 'Visual Accessibility',
      description: isUrdu 
        ? 'اعلیٰ کنٹراسٹ، بڑے فونٹ، اور اسکرین ریڈر کی مدد'
        : 'High contrast, large fonts, and screen reader support',
      items: isUrdu ? [
        'اسکرین ریڈر کی مطابقت',
        'کی بورڈ نیویگیشن',
        'اعلیٰ کنٹراسٹ موڈ',
        'ٹیکسٹ سائز کنٹرول'
      ] : [
        'Screen reader compatibility',
        'Keyboard navigation',
        'High contrast mode',
        'Text size controls'
      ]
    },
    {
      icon: <Ear className="h-8 w-8 text-emerald-600" />,
      title: isUrdu ? 'سمعی رسائی' : 'Auditory Accessibility',
      description: isUrdu 
        ? 'بصری متبادل اور آواز کی سہولات'
        : 'Visual alternatives and audio features',
      items: isUrdu ? [
        'ویڈیو میں سب ٹائٹل',
        'آواز کے لیے بصری اشارے',
        'آواز کنٹرول',
        'خاموش موڈ'
      ] : [
        'Video subtitles',
        'Visual cues for audio',
        'Volume controls',
        'Silent mode options'
      ]
    },
    {
      icon: <Hand className="h-8 w-8 text-emerald-600" />,
      title: isUrdu ? 'موٹر رسائی' : 'Motor Accessibility',
      description: isUrdu 
        ? 'آسان کنٹرول اور متبادل انپٹ طریقے'
        : 'Easy controls and alternative input methods',
      items: isUrdu ? [
        'بڑے کلک ایریا',
        'ٹچ اور ماؤس سپورٹ',
        'وقت کی توسیع',
        'آسان نیویگیشن'
      ] : [
        'Large click areas',
        'Touch and mouse support',
        'Extended timeouts',
        'Easy navigation'
      ]
    },
    {
      icon: <Brain className="h-8 w-8 text-emerald-600" />,
      title: isUrdu ? 'شناختی رسائی' : 'Cognitive Accessibility',
      description: isUrdu 
        ? 'سادہ زبان اور واضح ہدایات'
        : 'Simple language and clear instructions',
      items: isUrdu ? [
        'سادہ اردو/انگریزی',
        'واضح ہدایات',
        'مرحلہ وار گائیڈ',
        'مدد کے سیکشن'
      ] : [
        'Plain language',
        'Clear instructions',
        'Step-by-step guides',
        'Help sections'
      ]
    }
  ]

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
            <div className="flex justify-center items-center gap-2">
              <Eye className="h-12 w-12 text-emerald-600" />
              <Hand className="h-12 w-12 text-emerald-600" />
            </div>
            <h1 className="text-3xl font-bold">
              {isUrdu ? 'رسائی پذیری' : 'Accessibility'}
            </h1>
            <p className="text-muted-foreground max-w-3xl mx-auto">
              {isUrdu 
                ? 'ہم آواز ہر پاکستانی شہری کے لیے قابل رسائی ہے۔ ہم یقینی بناتے ہیں کہ مختلف قسم کی ضروریات والے افراد آسانی سے اس پلیٹ فارم کا استعمال کر سکیں'
                : 'hum awaz is accessible to every Pakistani citizen. We ensure that people with different needs can easily use this platform'
              }
            </p>
          </div>

          {/* Accessibility Features */}
          <div className="grid gap-6 md:grid-cols-2">
            {features.map((feature, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    {feature.icon}
                    <div>
                      <CardTitle>{feature.title}</CardTitle>
                      <CardDescription>{feature.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {feature.items.map((item, itemIndex) => (
                      <li key={itemIndex} className="flex items-center gap-2 text-sm">
                        <div className="h-1.5 w-1.5 bg-emerald-600 rounded-full"></div>
                        {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Device Support */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Monitor className="h-6 w-6 text-emerald-600" />
                {isUrdu ? 'آلات کی مدد' : 'Device Support'}
              </CardTitle>
              <CardDescription>
                {isUrdu 
                  ? 'مختلف آلات پر بہترین تجربہ'
                  : 'Optimal experience across different devices'
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="flex items-center gap-3">
                  <Monitor className="h-8 w-8 text-emerald-600" />
                  <div>
                    <p className="font-medium">
                      {isUrdu ? 'ڈیسک ٹاپ' : 'Desktop'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {isUrdu ? 'تمام براؤزر' : 'All browsers'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Smartphone className="h-8 w-8 text-emerald-600" />
                  <div>
                    <p className="font-medium">
                      {isUrdu ? 'موبائل' : 'Mobile'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {isUrdu ? 'ریسپانسو ڈیزائن' : 'Responsive design'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 bg-emerald-100 rounded flex items-center justify-center">
                    <span className="text-emerald-600 font-bold text-sm">A</span>
                  </div>
                  <div>
                    <p className="font-medium">
                      {isUrdu ? 'اسسٹو ٹیک' : 'Assistive Tech'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {isUrdu ? 'تمام معاون آلات' : 'All assistive devices'}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Language Support */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>
                  {isUrdu ? 'زبان کی سہولات' : 'Language Features'}
                </CardTitle>
                <CardDescription>
                  {isUrdu 
                    ? 'مقامی زبان میں مکمل رسائی'
                    : 'Full access in local languages'
                  }
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 bg-emerald-600 rounded-full"></div>
                  <span className="text-sm">
                    {isUrdu ? 'اردو اور انگریزی میں مکمل انٹرفیس' : 'Complete interface in Urdu and English'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 bg-emerald-600 rounded-full"></div>
                  <span className="text-sm">
                    {isUrdu ? 'RTL (دائیں سے بائیں) تعاون' : 'RTL (Right-to-Left) support'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 bg-emerald-600 rounded-full"></div>
                  <span className="text-sm">
                    {isUrdu ? 'آسان زبان تبدیل کرنا' : 'Easy language switching'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 bg-emerald-600 rounded-full"></div>
                  <span className="text-sm">
                    {isUrdu ? 'مقامی فونٹ تعاون' : 'Local font support'}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>
                  {isUrdu ? 'مدد اور تعاون' : 'Help and Support'}
                </CardTitle>
                <CardDescription>
                  {isUrdu 
                    ? 'رسائی کے مسائل کے لیے مدد'
                    : 'Assistance for accessibility issues'
                  }
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="font-medium text-sm">
                    {isUrdu ? 'آن لائن مدد' : 'Online Help'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {isUrdu 
                      ? 'ہماری ویب سائٹ پر تفصیلی گائیڈ اور ٹیوٹوریل'
                      : 'Detailed guides and tutorials on our website'
                    }
                  </p>
                </div>
                <div>
                  <p className="font-medium text-sm">
                    {isUrdu ? 'فون سپورٹ' : 'Phone Support'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {isUrdu 
                      ? 'رسائی کے مسائل کے لیے خاص ہیلپ لائن'
                      : 'Dedicated helpline for accessibility issues'
                    }
                  </p>
                </div>
                <Button asChild size="sm">
                  <Link href="/contact">
                    {isUrdu ? 'مدد حاصل کریں' : 'Get Help'}
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Standards Compliance */}
          <Card>
            <CardHeader>
              <CardTitle>
                {isUrdu ? 'معیار کی تعمیل' : 'Standards Compliance'}
              </CardTitle>
              <CardDescription>
                {isUrdu 
                  ? 'ہم بین الاقوامی رسائی کے معیارات کا احترام کرتے ہیں'
                  : 'We follow international accessibility standards'
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="text-center p-4 border rounded-lg">
                  <p className="font-bold text-lg text-emerald-600">WCAG 2.1</p>
                  <p className="text-sm text-muted-foreground">
                    {isUrdu ? 'AA سطح' : 'AA Level'}
                  </p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <p className="font-bold text-lg text-emerald-600">Section 508</p>
                  <p className="text-sm text-muted-foreground">
                    {isUrdu ? 'امریکی معیار' : 'US Standard'}
                  </p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <p className="font-bold text-lg text-emerald-600">EN 301 549</p>
                  <p className="text-sm text-muted-foreground">
                    {isUrdu ? 'یورپی معیار' : 'European Standard'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Feedback */}
          <Card>
            <CardHeader>
              <CardTitle>
                {isUrdu ? 'آپ کی رائے' : 'Your Feedback'}
              </CardTitle>
              <CardDescription>
                {isUrdu 
                  ? 'رسائی میں بہتری کے لیے آپ کی رائے اہم ہے'
                  : 'Your feedback is important for accessibility improvements'
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild>
                  <Link href="/contact">
                    {isUrdu ? 'رائے دیں' : 'Give Feedback'}
                  </Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="mailto:accessibility@codeforpakistan.org">
                    {isUrdu ? 'رسائی ٹیم سے رابطہ' : 'Contact Accessibility Team'}
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  )
}