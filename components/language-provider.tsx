"use client"

import type React from "react"

import { createContext, useContext, useState, useEffect } from "react"

type Language = "en" | "ur" | "pa" | "sd" | "ps" | "bal"

type LanguageContextType = {
  language: Language
  setLanguage: (language: Language) => void
  t: (key: string) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

// Simple translations for demonstration
const translations: Record<Language, Record<string, string>> = {
  en: {
    "nav.home": "Home",
    "nav.processes": "Processes",
    "nav.proposals": "Proposals",
    "nav.discussions": "Discussions",
    "nav.about": "About",
    // Add more translations as needed
  },
  ur: {
    "nav.home": "ہوم",
    "nav.processes": "عمل",
    "nav.proposals": "تجاویز",
    "nav.discussions": "بحث",
    "nav.about": "ہمارے بارے میں",
    // Add more translations as needed
  },
  pa: {
    "nav.home": "ਘਰ",
    "nav.processes": "ਪ੍ਰਕਿਰਿਆਵਾਂ",
    "nav.proposals": "ਪ੍ਰਸਤਾਵ",
    "nav.discussions": "ਚਰਚਾ",
    "nav.about": "ਬਾਰੇ",
    // Add more translations as needed
  },
  sd: {
    "nav.home": "گھر",
    "nav.processes": "عمل",
    "nav.proposals": "تجويزون",
    "nav.discussions": "بحث",
    "nav.about": "باري ۾",
    // Add more translations as needed
  },
  ps: {
    "nav.home": "کور",
    "nav.processes": "پروسې",
    "nav.proposals": "وړاندیزونه",
    "nav.discussions": "بحثونه",
    "nav.about": "په اړه",
    // Add more translations as needed
  },
  bal: {
    "nav.home": "لوگ",
    "nav.processes": "عمل",
    "nav.proposals": "تجویزان",
    "nav.discussions": "گپ",
    "nav.about": "بارے",
    // Add more translations as needed
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
      else if (browserLang === "pa") setLanguage("pa")
      else if (browserLang === "sd") setLanguage("sd")
      else if (browserLang === "ps") setLanguage("ps")
      else if (browserLang === "bal") setLanguage("bal")
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
