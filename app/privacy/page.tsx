'use client'

import { MainNav } from '@/components/main-nav'
import { LanguageSwitcher } from '@/components/language-switcher'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/auth-context'
import { useLanguage } from '@/components/language-provider'
import { Vote, Shield } from 'lucide-react'
import Link from 'next/link'

export default function PrivacyPage() {
  const { user } = useAuth()
  const { language } = useLanguage()

  const isUrdu = language === 'ur'

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

      <main className="flex-1 container py-8 max-w-4xl">
        <div className="space-y-8">
          <div className="text-center space-y-4">
            <Shield className="h-12 w-12 text-emerald-600 mx-auto" />
            <h1 className="text-3xl font-bold">
              {isUrdu ? 'رازداری کی پالیسی' : 'Privacy Policy'}
            </h1>
            <p className="text-muted-foreground">
              {isUrdu 
                ? 'آپ کی معلومات کی حفاظت کا طریقہ کار'
                : 'How we protect and handle your information'
              }
            </p>
            <p className="text-sm text-muted-foreground">
              {isUrdu 
                ? 'آخری بار اپڈیٹ: دسمبر 2024'
                : 'Last updated: December 2024'
              }
            </p>
          </div>

          <div className="prose prose-gray max-w-none">
            {isUrdu ? (
              // Urdu content
              <>
                <h2>1. معلومات کا جمع کرنا</h2>
                <p>
                  ہم آواز پلیٹ فارم پر آپ سے مختلف قسم کی معلومات حاصل کرتے ہیں:
                </p>
                <ul>
                  <li><strong>اکاؤنٹ کی معلومات:</strong> نام، ای میل ایڈریس، فون نمبر</li>
                  <li><strong>شناختی معلومات:</strong> عمر، شہر، قومیت (شناخت کی تصدیق کے لیے)</li>
                  <li><strong>شرکت کی ڈیٹا:</strong> آپ کے ووٹ، تجاویز، اور تبصرے</li>
                  <li><strong>تکنیکی ڈیٹا:</strong> IP پتہ، براؤزر کی تفصیلات، استعمال کا طریقہ</li>
                </ul>

                <h2>2. معلومات کا استعمال</h2>
                <p>ہم آپ کی معلومات استعمال کرتے ہیں:</p>
                <ul>
                  <li>پلیٹ فارم کی خدمات فراہم کرنے کے لیے</li>
                  <li>آپ کی شناخت کی تصدیق کے لیے</li>
                  <li>جمہوری عمل میں آپ کی شرکت کو سہل بنانے کے لیے</li>
                  <li>پلیٹ فارم کو بہتر بنانے کے لیے</li>
                  <li>قانونی ضروریات پورا کرنے کے لیے</li>
                </ul>

                <h2>3. معلومات کا اشتراک</h2>
                <p>ہم آپ کی ذاتی معلومات تیسری پارٹی کے ساتھ شیئر نہیں کرتے، سوائے:</p>
                <ul>
                  <li>آپ کی رضامندی کے ساتھ</li>
                  <li>قانونی ضرورت کی صورت میں</li>
                  <li>سیکیورٹی کے لیے ضروری ہو</li>
                  <li>سروس فراہم کنندگان کے ساتھ (صرف ضروری حد تک)</li>
                </ul>

                <h2>4. پبلک انفارمیشن</h2>
                <p>مندرجہ ذیل معلومات عوامی طور پر دکھائی جا سکتی ہیں:</p>
                <ul>
                  <li>آپ کا نام (صرف پہلا نام اور آخری نام کا پہلا حرف)</li>
                  <li>آپ کے عوامی تبصرے اور تجاویز</li>
                  <li>آپ کے ووٹ کی تعداد (نام کے ساتھ نہیں)</li>
                  <li>شرکت کی سطح (تفصیلی ڈیٹا کے بغیر)</li>
                </ul>

                <h2>5. ڈیٹا کی حفاظت</h2>
                <p>
                  ہم آپ کی معلومات کی حفاظت کے لیے جدید تکنیکی اقدامات استعمال کرتے ہیں:
                </p>
                <ul>
                  <li>SSL انکرپشن</li>
                  <li>محفوظ ڈیٹابیس</li>
                  <li>دو مرحلہ تصدیق</li>
                  <li>باقاعدگی سے سیکیورٹی آڈٹ</li>
                </ul>

                <h2>6. کوکیز اور ٹریکنگ</h2>
                <p>
                  ہم کوکیز استعمال کرتے ہیں تاکہ آپ کا تجربہ بہتر ہو سکے۔ آپ اپنے براؤزر میں کوکیز بند کر سکتے ہیں، 
                  لیکن اس سے پلیٹ فارم کا استعمال متاثر ہو سکتا ہے۔
                </p>

                <h2>7. آپ کے حقوق</h2>
                <p>آپ کے پاس یہ حقوق محفوظ ہیں:</p>
                <ul>
                  <li>اپنی معلومات کا جائزہ لینا</li>
                  <li>غلط معلومات کو درست کرنا</li>
                  <li>اپنا ڈیٹا ڈاؤن لوڈ کرنا</li>
                  <li>اپنا اکاؤنٹ ختم کرنا</li>
                  <li>مارکیٹنگ ای میل سے انکار کرنا</li>
                </ul>

                <h2>8. بچوں کی رازداری</h2>
                <p>
                  یہ پلیٹ فارم 18 سال سے کم عمر کے بچوں کے لیے نہیں ہے۔ ہم جان بوجھ کر 18 سال سے کم عمر کے افراد سے معلومات حاصل نہیں کرتے۔
                </p>

                <h2>9. بین الاقوامی ڈیٹا ٹرانسفر</h2>
                <p>
                  آپ کی معلومات پاکستان میں محفوظ کی جاتی ہیں۔ اگر ضروری ہو تو ہم بین الاقوامی سطح پر ڈیٹا منتقل کر سکتے ہیں، 
                  لیکن مناسب حفاظتی اقدامات کے ساتھ۔
                </p>

                <h2>10. پالیسی میں تبدیلیاں</h2>
                <p>
                  ہم اس پالیسی میں تبدیلیاں کر سکتے ہیں۔ اہم تبدیلیوں کی صورت میں ہم آپ کو ای میل کے ذریعے مطلع کریں گے۔
                </p>

                <h2>11. رابطہ</h2>
                <p>
                  رازداری سے متعلق سوالات کے لیے ہم سے 
                  <Link href="/contact" className="text-emerald-600 hover:underline"> رابطہ کریں</Link>۔
                </p>
              </>
            ) : (
              // English content
              <>
                <h2>1. Information We Collect</h2>
                <p>
                  On the Hum Awaaz platform, we collect various types of information:
                </p>
                <ul>
                  <li><strong>Account Information:</strong> Name, email address, phone number</li>
                  <li><strong>Identity Information:</strong> Age, city, nationality (for identity verification)</li>
                  <li><strong>Participation Data:</strong> Your votes, proposals, and comments</li>
                  <li><strong>Technical Data:</strong> IP address, browser details, usage patterns</li>
                </ul>

                <h2>2. How We Use Your Information</h2>
                <p>We use your information to:</p>
                <ul>
                  <li>Provide platform services</li>
                  <li>Verify your identity</li>
                  <li>Facilitate your participation in democratic processes</li>
                  <li>Improve the platform</li>
                  <li>Meet legal requirements</li>
                </ul>

                <h2>3. Information Sharing</h2>
                <p>We do not share your personal information with third parties, except:</p>
                <ul>
                  <li>With your consent</li>
                  <li>When legally required</li>
                  <li>For security purposes</li>
                  <li>With service providers (limited scope only)</li>
                </ul>

                <h2>4. Public Information</h2>
                <p>The following information may be publicly visible:</p>
                <ul>
                  <li>Your name (first name and last initial only)</li>
                  <li>Your public comments and proposals</li>
                  <li>Your vote counts (not linked to your identity)</li>
                  <li>Participation levels (without detailed data)</li>
                </ul>

                <h2>5. Data Security</h2>
                <p>
                  We use modern technical measures to protect your information:
                </p>
                <ul>
                  <li>SSL encryption</li>
                  <li>Secure databases</li>
                  <li>Two-factor authentication</li>
                  <li>Regular security audits</li>
                </ul>

                <h2>6. Cookies and Tracking</h2>
                <p>
                  We use cookies to improve your experience. You can disable cookies in your browser, 
                  but this may affect platform functionality.
                </p>

                <h2>7. Your Rights</h2>
                <p>You have the right to:</p>
                <ul>
                  <li>Access your information</li>
                  <li>Correct inaccurate information</li>
                  <li>Download your data</li>
                  <li>Delete your account</li>
                  <li>Opt out of marketing emails</li>
                </ul>

                <h2>8. Children's Privacy</h2>
                <p>
                  This platform is not for individuals under 18. We do not knowingly collect information from minors under 18.
                </p>

                <h2>9. International Data Transfer</h2>
                <p>
                  Your information is stored in Pakistan. If necessary, we may transfer data internationally 
                  with appropriate safeguards.
                </p>

                <h2>10. Policy Changes</h2>
                <p>
                  We may update this policy. We will notify you of significant changes via email.
                </p>

                <h2>11. Contact</h2>
                <p>
                  For privacy-related questions, please 
                  <Link href="/contact" className="text-emerald-600 hover:underline">contact us</Link>.
                </p>
              </>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}