"use client"

import type React from "react"

import { createContext, useContext, useState, useEffect } from "react"

type Language = "en" | "ur"

type LanguageContextType = {
  language: Language
  setLanguage: (language: Language) => void
  t: (key: string) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

// Comprehensive translations for English and Urdu
const translations: Record<Language, Record<string, string>> = {
  en: {
    // Navigation
    "nav.home": "Home",
    "nav.processes": "Processes",
    "nav.proposals": "Proposals",
    "nav.discussions": "Discussions",
    "nav.about": "About",
    
    // Common
    "common.login": "Login",
    "common.register": "Register",
    "common.logout": "Logout",
    "common.submit": "Submit",
    "common.cancel": "Cancel",
    "common.save": "Save",
    "common.edit": "Edit",
    "common.delete": "Delete",
    "common.back": "Back",
    "common.next": "Next",
    "common.previous": "Previous",
    "common.loading": "Loading...",
    "common.error": "Error",
    "common.success": "Success",
    
    // Auth
    "auth.email": "Email",
    "auth.password": "Password",
    "auth.confirmPassword": "Confirm Password",
    "auth.fullName": "Full Name",
    "auth.signIn": "Sign In",
    "auth.signUp": "Sign Up",
    "auth.forgotPassword": "Forgot Password?",
    "auth.noAccount": "Don't have an account?",
    "auth.hasAccount": "Already have an account?",
    
    // Home page
    "home.hero.title": "Your Voice Matters in Pakistan's Democracy",
    "home.hero.subtitle": "Hum Awaaz empowers citizens to participate in democratic processes, deliberate on public issues, and contribute to collective decision-making.",
    "home.hero.explore": "Explore Active Processes",
    "home.hero.learnMore": "Learn More",
    
    // Processes
    "processes.title": "Participation Processes",
    "processes.subtitle": "Explore and participate in democratic processes across Pakistan",
    "processes.newProcess": "Start a New Process",
    "processes.search": "Search processes...",
    "processes.filters": "Filters",
    "processes.all": "All Processes",
    "processes.active": "Active",
    "processes.upcoming": "Upcoming",
    "processes.completed": "Completed",
    "processes.participate": "Participate",
    "processes.participants": "participants",
    "processes.progress": "Progress",
    "processes.ends": "Ends",
    
    // Process phases
    "phase.discussion": "Discussion",
    "phase.voting": "Voting",
    "phase.proposal": "Proposal",
    "phase.implementation": "Implementation",
    
    // Categories
    "category.education": "Education",
    "category.infrastructure": "Infrastructure",
    "category.healthcare": "Healthcare",
    "category.environment": "Environment",
    "category.economy": "Economy",
    "category.governance": "Governance",
    "category.other": "Other",
    "category.urbanPlanning": "Urban Planning",
    
    // Status
    "status.draft": "Draft",
    "status.active": "Active",
    "status.closed": "Closed",
    "status.completed": "Completed",
    "status.pending": "Pending",
    "status.approved": "Approved",
    "status.rejected": "Rejected",
    "status.implemented": "Implemented",
    
    // Features
    "features.inclusive.title": "Inclusive Participation",
    "features.inclusive.description": "Designed for all Pakistanis regardless of background or technical expertise",
    "features.transparent.title": "Transparent Processes",
    "features.transparent.description": "Follow proposals from submission to implementation",
    "features.secure.title": "Secure Voting",
    "features.secure.description": "Make your voice heard with confidence",
    
    // Stats
    "stats.title": "Participation Statistics",
    "stats.subtitle": "See how Pakistanis are engaging with democratic processes",
    
    // How to participate
    "howTo.title": "How to Participate",
    "howTo.subtitle": "Getting started with Hum Awaaz is easy",
  },
  ur: {
    // Navigation
    "nav.home": "ہوم",
    "nav.processes": "عمل",
    "nav.proposals": "تجاویز",
    "nav.discussions": "بحث",
    "nav.about": "ہمارے بارے میں",
    
    // Common
    "common.login": "لاگ ان",
    "common.register": "رجسٹر",
    "common.logout": "لاگ آؤٹ",
    "common.submit": "جمع کرائیں",
    "common.cancel": "منسوخ کریں",
    "common.save": "محفوظ کریں",
    "common.edit": "ترمیم",
    "common.delete": "حذف کریں",
    "common.back": "واپس",
    "common.next": "اگلا",
    "common.previous": "پچھلا",
    "common.loading": "لوڈ ہو رہا ہے...",
    "common.error": "غلطی",
    "common.success": "کامیاب",
    
    // Auth
    "auth.email": "ای میل",
    "auth.password": "پاس ورڈ",
    "auth.confirmPassword": "پاس ورڈ کی تصدیق",
    "auth.fullName": "پورا نام",
    "auth.signIn": "سائن ان",
    "auth.signUp": "سائن اپ",
    "auth.forgotPassword": "پاس ورڈ بھول گئے؟",
    "auth.noAccount": "اکاؤنٹ نہیں ہے؟",
    "auth.hasAccount": "پہلے سے اکاؤنٹ ہے؟",
    
    // Home page
    "home.hero.title": "پاکستان کی جمہوریت میں آپ کی آواز اہم ہے",
    "home.hero.subtitle": "ہم آواز شہریوں کو جمہوری عمل میں حصہ لینے، عوامی مسائل پر غور کرنے اور اجتماعی فیصلہ سازی میں حصہ لینے کی طاقت دیتا ہے۔",
    "home.hero.explore": "فعال عمل دیکھیں",
    "home.hero.learnMore": "مزید جانیں",
    
    // Processes
    "processes.title": "شرکت کے عمل",
    "processes.subtitle": "پاکستان بھر میں جمہوری عمل کو دریافت کریں اور ان میں حصہ لیں",
    "processes.newProcess": "نیا عمل شروع کریں",
    "processes.search": "عمل تلاش کریں...",
    "processes.filters": "فلٹرز",
    "processes.all": "تمام عمل",
    "processes.active": "فعال",
    "processes.upcoming": "آنے والے",
    "processes.completed": "مکمل",
    "processes.participate": "حصہ لیں",
    "processes.participants": "شرکاء",
    "processes.progress": "ترقی",
    "processes.ends": "ختم ہوتا ہے",
    
    // Process phases
    "phase.discussion": "بحث",
    "phase.voting": "ووٹنگ",
    "phase.proposal": "تجویز",
    "phase.implementation": "نفاذ",
    
    // Categories
    "category.education": "تعلیم",
    "category.infrastructure": "انفراسٹرکچر",
    "category.healthcare": "صحت کی دیکھ بھال",
    "category.environment": "ماحول",
    "category.economy": "معیشت",
    "category.governance": "حکمرانی",
    "category.other": "دیگر",
    "category.urbanPlanning": "شہری منصوبہ بندی",
    
    // Status
    "status.draft": "مسودہ",
    "status.active": "فعال",
    "status.closed": "بند",
    "status.completed": "مکمل",
    "status.pending": "زیر التواء",
    "status.approved": "منظور شدہ",
    "status.rejected": "مسترد",
    "status.implemented": "نافذ",
    
    // Features
    "features.inclusive.title": "شمولیت کی شرکت",
    "features.inclusive.description": "تمام پاکستانیوں کے لیے ڈیزائن کیا گیا ہے، پس منظر یا تکنیکی مہارت سے قطع نظر",
    "features.transparent.title": "شفاف عمل",
    "features.transparent.description": "جمع کرائی سے نفاذ تک تجاویز کی پیروی کریں",
    "features.secure.title": "محفوظ ووٹنگ",
    "features.secure.description": "اعتماد کے ساتھ اپنی آواز سنائیں",
    
    // Stats
    "stats.title": "شرکت کے اعداد و شمار",
    "stats.subtitle": "دیکھیں کہ پاکستانی جمہوری عمل میں کیسے شامل ہو رہے ہیں",
    
    // How to participate
    "howTo.title": "کیسے حصہ لیں",
    "howTo.subtitle": "ہم آواز کے ساتھ شروع کرنا آسان ہے",
  },
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>("en")

  useEffect(() => {
    // Check for saved language preference
    const savedLanguage = localStorage.getItem("language") as Language
    if (savedLanguage && Object.keys(translations).includes(savedLanguage)) {
      setLanguage(savedLanguage)
    }
    // Or detect browser language
    else {
      const browserLang = navigator.language.split("-")[0]
      if (browserLang === "ur") setLanguage("ur")
      // Default to English if no match
    }
  }, [])

  // Save language preference when it changes
  useEffect(() => {
    localStorage.setItem("language", language)
    // Update document direction for RTL languages
    document.documentElement.dir = ["ur", "sd"].includes(language) ? "rtl" : "ltr"
  }, [language])

  // Translation function
  const t = (key: string): string => {
    return translations[language][key] || translations.en[key] || key
  }

  return <LanguageContext.Provider value={{ language, setLanguage, t }}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}
