'use client'

import { MainNav } from '@/components/main-nav'
import { LanguageSwitcher } from '@/components/language-switcher'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/auth-context'
import { useLanguage } from '@/components/language-provider'
import { Vote, Scale } from 'lucide-react'
import Link from 'next/link'

export default function TermsPage() {
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

      <main className="flex-1 container py-8 max-w-4xl">
        <div className="space-y-8">
          <div className="text-center space-y-4">
            <Scale className="h-12 w-12 text-emerald-600 mx-auto" />
            <h1 className="text-3xl font-bold">
              {isUrdu ? 'شرائط و ضوابط' : 'Terms of Service'}
            </h1>
            <p className="text-muted-foreground">
              {isUrdu 
                ? 'ہم آواز پلیٹ فارم استعمال کرنے کے لیے شرائط'
                : 'Terms and conditions for using the hum awaz platform'
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
                <h2>1. خدمات کی قبولیت</h2>
                <p>
                  ہم آواز ایک شہری شرکت کا پلیٹ فارم ہے جو پاکستان میں جمہوری عمل میں حصہ لینے کی سہولت فراہم کرتا ہے۔ 
                  اس پلیٹ فارم کا استعمال کرتے وقت، آپ ان شرائط و ضوابط سے اتفاق کرتے ہیں۔
                </p>

                <h2>2. اہلیت</h2>
                <p>
                  اس پلیٹ فارم کا استعمال کرنے کے لیے:
                </p>
                <ul>
                  <li>آپ کی عمر کم سے کم 18 سال ہونی چاہیے</li>
                  <li>آپ کو پاکستان کا شہری یا مقیم ہونا چاہیے</li>
                  <li>آپ کے پاس ایک درست ای میل یا فون نمبر ہونا چاہیے</li>
                </ul>

                <h2>3. استعمال کے ضوابط</h2>
                <p>آپ اس بات پر رضامند ہیں کہ:</p>
                <ul>
                  <li>تمام معلومات درست اور مکمل فراہم کریں گے</li>
                  <li>احترام اور شائستگی کے ساتھ دوسروں کے ساتھ بات چیت کریں گے</li>
                  <li>نفرت انگیز، توہین آمیز، یا غلط معلومات پوسٹ نہیں کریں گے</li>
                  <li>پلیٹ فارم کا غلط استعمال نہیں کریں گے</li>
                </ul>

                <h2>4. ڈیٹا اور رازداری</h2>
                <p>
                  آپ کی معلومات کی حفاظت ہماری اولین ترجیح ہے۔ تفصیلات کے لیے ہماری 
                  <Link href="/privacy" className="text-emerald-600 hover:underline"> رازداری کی پالیسی </Link>
                  دیکھیں۔
                </p>

                <h2>5. دانشورانہ املاک</h2>
                <p>
                  یہ پلیٹ فارم اور اس کا تمام مواد کاپی رائٹ کے تحت محفوظ ہے۔ 
                  صارفین کی جانب سے جمع کرائی گئی معلومات اور تجاویز کی ملکیت صارف کی ہے۔
                </p>

                <h2>6. ذمہ داری کی حد</h2>
                <p>
                  ہم آواز صرف ایک پلیٹ فارم فراہم کرتا ہے۔ صارفین کی آراء اور تجاویز سے ہماری مکمل رضامندی ضروری نہیں۔
                  حکومتی فیصلے اور ان کے نتائج کے لیے ہم ذمہ دار نہیں ہیں۔
                </p>

                <h2>7. خدمات میں تبدیلی</h2>
                <p>
                  ہم بغیر کسی پیشگی اطلاع کے اپنی خدمات میں تبدیلی کر سکتے ہیں۔ 
                  اہم تبدیلیوں کی صورت میں صارفین کو مطلع کرنے کی کوشش کریں گے۔
                </p>

                <h2>8. اکاؤنٹ ختم کرنا</h2>
                <p>
                  آپ کسی بھی وقت اپنا اکاؤنٹ بند کر سکتے ہیں۔ شرائط کی خلاف ورزی کی صورت میں 
                  ہم آپ کا اکاؤنٹ بند کرنے کا حق محفوظ رکھتے ہیں۔
                </p>

                <h2>9. رابطہ</h2>
                <p>
                  اگر آپ کے کوئی سوالات ہیں تو ہم سے 
                  <Link href="/contact" className="text-emerald-600 hover:underline"> رابطہ کریں</Link>۔
                </p>
              </>
            ) : (
              // English content
              <>
                <h2>1. Acceptance of Terms</h2>
                <p>
                  hum awaz is a civic participation platform that facilitates democratic participation in Pakistan. 
                  By using this platform, you agree to these terms and conditions.
                </p>

                <h2>2. Eligibility</h2>
                <p>
                  To use this platform, you must:
                </p>
                <ul>
                  <li>Be at least 18 years old</li>
                  <li>Be a Pakistani citizen or resident</li>
                  <li>Have a valid email address or phone number</li>
                </ul>

                <h2>3. User Conduct</h2>
                <p>You agree to:</p>
                <ul>
                  <li>Provide accurate and complete information</li>
                  <li>Communicate respectfully with others</li>
                  <li>Not post hateful, offensive, or misleading content</li>
                  <li>Not misuse the platform</li>
                </ul>

                <h2>4. Data and Privacy</h2>
                <p>
                  Your privacy is our priority. Please review our 
                  <Link href="/privacy" className="text-emerald-600 hover:underline">Privacy Policy</Link> 
                  for details on how we handle your information.
                </p>

                <h2>5. Intellectual Property</h2>
                <p>
                  This platform and its content are protected by copyright. 
                  User-submitted content and proposals remain the property of the user.
                </p>

                <h2>6. Limitation of Liability</h2>
                <p>
                  hum awaz provides a platform only. We do not endorse all user opinions or proposals. 
                  We are not responsible for government decisions or their outcomes.
                </p>

                <h2>7. Service Changes</h2>
                <p>
                  We may modify our services without prior notice. 
                  We will attempt to notify users of significant changes.
                </p>

                <h2>8. Account Termination</h2>
                <p>
                  You may close your account at any time. 
                  We reserve the right to terminate accounts for violations of these terms.
                </p>

                <h2>9. Contact</h2>
                <p>
                  If you have questions, please 
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