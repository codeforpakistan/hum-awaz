import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { UserPlus, MessageSquare, Vote, FileText, BarChart3 } from "lucide-react"
import { useLanguage } from "@/components/language-provider"

export function HowToParticipate() {
  const { language } = useLanguage()
  
  const steps = [
    {
      icon: <UserPlus className="h-10 w-10 text-emerald-600" />,
      title: language === 'ur' ? "اکاؤنٹ بنائیں" : "Create an Account",
      description: language === 'ur' 
        ? "اپنے ای میل یا فون نمبر سے رجسٹر کریں۔ سرکاری عمل میں حصہ لینے کے لیے اپنی شناخت کی تصدیق کریں۔"
        : "Register with your email or phone number. Verify your identity to participate in official processes.",
    },
    {
      icon: <MessageSquare className="h-10 w-10 text-emerald-600" />,
      title: language === 'ur' ? "بحث میں شامل ہوں" : "Join Discussions",
      description: language === 'ur'
        ? "مختلف موضوعات پر مشاورت میں حصہ لیں۔ اپنا نقطہ نظر بیان کریں اور دوسروں کے خیالات سے مستفید ہوں۔"
        : "Participate in deliberations on various topics. Share your perspective and engage with others' ideas.",
    },
    {
      icon: <FileText className="h-10 w-10 text-emerald-600" />,
      title: language === 'ur' ? "تجاویز جمع کرائیں" : "Submit Proposals",
      description: language === 'ur'
        ? "کیا آپ کے پاس اپنی کمیونٹی کو بہتر بنانے کا کوئی خیال ہے؟ تجویز بنائیں اور ساتھی شہریوں کی حمایت حاصل کریں۔"
        : "Have an idea to improve your community? Create a proposal and gather support from fellow citizens.",
    },
    {
      icon: <Vote className="h-10 w-10 text-emerald-600" />,
      title: language === 'ur' ? "اقدامات پر ووٹ دیں" : "Vote on Initiatives",
      description: language === 'ur'
        ? "تجاویز پر اپنا ووٹ ڈالیں اور یہ طے کرنے میں مدد کریں کہ کون سے اقدامات آگے بڑھنے چاہیے۔"
        : "Cast your vote on proposals and help determine which initiatives should move forward.",
    },
    {
      icon: <BarChart3 className="h-10 w-10 text-emerald-600" />,
      title: language === 'ur' ? "پیش رفت کا جائزہ لیں" : "Track Progress",
      description: language === 'ur'
        ? "منظور شدہ تجاویز کی عملدرآمد کو ٹریک کریں اور اپنی شرکت کے حقیقی اثرات دیکھیں۔"
        : "Follow the implementation of approved proposals and see the real impact of your participation.",
    },
  ]

  return (
    <div className="grid gap-6 mt-8 md:grid-cols-2 lg:grid-cols-3">
      {steps.map((step, index) => (
        <Card key={index} className="flex flex-col">
          <CardHeader className="flex flex-row items-center gap-4">
            <div className="rounded-full p-2 bg-emerald-100">{step.icon}</div>
            <div>
              <CardTitle>{language === 'ur' ? `مرحلہ ${index + 1}` : `Step ${index + 1}`}</CardTitle>
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
