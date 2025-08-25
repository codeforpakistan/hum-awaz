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
    "nav.budgets": "Budgets",
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
    "home.hero.subtitle": "hum awaz empowers citizens to participate in democratic processes, deliberate on public issues, and contribute to collective decision-making.",
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
    "howTo.subtitle": "Getting started with hum awaz is easy",
    
    // Participatory Budgeting
    "participatoryBudgets": "Participatory Budgets",
    "participatoryBudgetsDescription": "Vote on how your government allocates public funds across different categories and priorities",
    "createBudget": "Create Budget",
    "createNewBudget": "Create New Budget",
    "createBudgetDescription": "Set up a new participatory budget for citizen input on fund allocation",
    "backToBudgets": "Back to Budgets",
    "budgetList": "Budget List",
    "noBudgets": "No Budgets Yet",
    "noBudgetsDescription": "Start by creating the first participatory budget for citizen engagement",
    "createFirstBudget": "Create First Budget",
    "totalBudgets": "Total Budgets",
    "activeBudgets": "Active Budgets", 
    "totalValue": "Total Value",
    "thisYear": "This Year",
    "complete": "complete",
    "viewDetails": "View Details",
    "basicInformation": "Basic Information",
    "linkedProcess": "Linked Process",
    "optional": "optional",
    "selectProcess": "Select Process",
    "title": "Title",
    "description": "Description",
    "totalAmount": "Total Amount",
    "currency": "Currency", 
    "fiscalYear": "Fiscal Year",
    "startDate": "Start Date",
    "endDate": "End Date",
    "budgetCategories": "Budget Categories",
    "addCategory": "Add Category",
    "noCategoriesYet": "No categories added yet",
    "addFirstCategory": "Add First Category",
    "category": "Category",
    "name": "Name",
    "icon": "Icon",
    "color": "Color",
    "suggestedAmount": "Suggested Amount",
    "maxAmount": "Maximum Amount",
    "creating": "Creating...",
    "titleRequired": "Title is required",
    "descriptionRequired": "Description is required",
    "totalAmountRequired": "Total amount must be greater than 0",
    "datesRequired": "Start and end dates are required",
    "endDateAfterStart": "End date must be after start date",
    "categoriesRequired": "At least one category is required",
    "categoryNameRequired": "Category name is required",
    "categorySuggestedAmountRequired": "Category suggested amount is required",
    "totalSuggestedExceedsBudget": "Total suggested amounts exceed the budget",
    "errorCreatingBudget": "Error creating budget. Please try again.",
    "voting": "Voting",
    "approved": "Approved",
    "budgetNotFound": "Budget Not Found",
    "updateVote": "Update Vote",
    "voteOnBudget": "Vote on Budget",
    "allocateBudget": "Allocate Budget",
    "allocateBudgetDescription": "Distribute the total budget across categories based on your priorities",
    "remaining": "Remaining",
    "budgetExceeded": "Budget exceeded! Please reduce allocations.",
    "suggested": "Suggested",
    "yourAllocation": "Your Allocation",
    "useSuggested": "Use Suggested",
    "averageAllocation": "Average Allocation",
    "totalVotes": "Total Votes",
    "yourVote": "Your Vote",
    "notVoted": "Not Voted",
    "useSuggestedAmounts": "Use Suggested Amounts",
    "saving": "Saving...",
    "submitVote": "Submit Vote",
    "budgetStats": "Budget Statistics",
    "totalParticipants": "Total Participants",
    "categories": "Categories",
    "timeRemaining": "Time Remaining",
    "yourParticipation": "Your Participation",
    "votingStatus": "Voting Status",
    "voted": "Voted",
    "totalAllocated": "Total Allocated",
    "lastUpdated": "Last Updated",
    "never": "Never",
    "voteSubmittedSuccessfully": "Vote submitted successfully!",
    "errorSavingVote": "Error saving vote. Please try again.",
    "ends": "Ends",
    
    // Enhanced Process Types (Decidim & Polis inspired)
    "processType.consultation": "Government Consultation",
    "processType.initiative": "Citizen Initiative",
    "processType.assembly": "Deliberative Assembly",
    "processType.poll": "Opinion Poll",
    "processType.petition": "Petition",
    "processType.budget": "Participatory Budget",
    "processType.debate": "Public Debate",
    
    "processScope.federal": "Federal",
    "processScope.provincial": "Provincial",
    "processScope.city": "City",
    "processScope.district": "District",
    "processScope.community": "Community",
    
    "participationMethod.open": "Open to All",
    "participationMethod.invited": "By Invitation",
    "participationMethod.random_selection": "Random Selection",
    "participationMethod.application": "By Application",
    
    "visibility.public": "Public",
    "visibility.restricted": "Restricted",
    "visibility.private": "Private",
    
    "signatureThreshold": "Signature Threshold",
    "currentSignatures": "Current Signatures",
    "signProcess": "Sign Process",
    "removeSignature": "Remove Signature",
    "signatureProgress": "Signature Progress",
    "signatureDeadline": "Signature Deadline",
    "governmentResponse": "Government Response",
    "responseRequired": "Response Required",
    "responseDeadline": "Response Deadline",
    "awaitingResponse": "Awaiting Government Response",
    "thresholdMet": "Threshold Met!",
    "signatureComment": "Comment (Optional)",
    "verificationRequired": "Verification Required",
    
    "meetingType.in_person": "In Person",
    "meetingType.online": "Online",
    "meetingType.hybrid": "Hybrid",
    
    "meetingStatus.upcoming": "Upcoming",
    "meetingStatus.ongoing": "Ongoing",
    "meetingStatus.completed": "Completed",
    "meetingStatus.cancelled": "Cancelled",
    
    "registerForMeeting": "Register for Meeting",
    "meetingRegistration": "Meeting Registration",
    "maxAttendees": "Maximum Attendees",
    "registrationDeadline": "Registration Deadline",
    "onlineMeetingUrl": "Online Meeting URL",
    "agenda": "Agenda",
    "minutes": "Minutes",
    
    "userRole.citizen": "Citizen",
    "userRole.government_admin": "Government Admin",
    "userRole.moderator": "Moderator",
    "userRole.facilitator": "Facilitator",
    "userRole.observer": "Observer",
    
    "followProcess": "Follow Process",
    "unfollowProcess": "Unfollow Process",
    "followers": "Followers",
    "notificationPreferences": "Notification Preferences",
    "emailNotifications": "Email Notifications",
    "pushNotifications": "Push Notifications",
  },
  ur: {
    // Navigation
    "nav.home": "ہوم",
    "nav.processes": "عمل",
    "nav.proposals": "تجاویز",
    "nav.budgets": "بجٹ",
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
    
    // Participatory Budgeting
    "participatoryBudgets": "شراکتی بجٹ",
    "participatoryBudgetsDescription": "مختلف کیٹگریز اور ترجیحات میں حکومت کے پبلک فنڈز کی تقسیم پر ووٹ دیں",
    "createBudget": "بجٹ بنائیں",
    "createNewBudget": "نیا بجٹ بنائیں", 
    "createBudgetDescription": "فنڈز کی تقسیم پر شہریوں کی رائے کے لیے نیا شراکتی بجٹ سیٹ اپ کریں",
    "backToBudgets": "بجٹس پر واپس",
    "budgetList": "بجٹ فہرست",
    "noBudgets": "ابھی کوئی بجٹ نہیں",
    "noBudgetsDescription": "شہری شمولیت کے لیے پہلا شراکتی بجٹ بنا کر شروع کریں",
    "createFirstBudget": "پہلا بجٹ بنائیں",
    "totalBudgets": "کل بجٹس",
    "activeBudgets": "فعال بجٹس",
    "totalValue": "کل قیمت",
    "thisYear": "اس سال",
    "complete": "مکمل",
    "viewDetails": "تفصیلات دیکھیں",
    "basicInformation": "بنیادی معلومات",
    "linkedProcess": "منسلک عمل",
    "optional": "اختیاری",
    "selectProcess": "عمل منتخب کریں",
    "title": "عنوان",
    "description": "تفصیل",
    "totalAmount": "کل رقم",
    "currency": "کرنسی",
    "fiscalYear": "مالی سال",
    "startDate": "شروع کی تاریخ",
    "endDate": "ختم کی تاریخ",
    "budgetCategories": "بجٹ کیٹگریز",
    "addCategory": "کیٹگری شامل کریں",
    "noCategoriesYet": "ابھی کوئی کیٹگری شامل نہیں",
    "addFirstCategory": "پہلی کیٹگری شامل کریں",
    "category": "کیٹگری",
    "name": "نام",
    "icon": "آئیکن",
    "color": "رنگ",
    "suggestedAmount": "تجویز کردہ رقم",
    "maxAmount": "زیادہ سے زیادہ رقم",
    "creating": "بنایا جا رہا ہے...",
    "titleRequired": "عنوان ضروری ہے",
    "descriptionRequired": "تفصیل ضروری ہے",
    "totalAmountRequired": "کل رقم صفر سے زیادہ ہونی چاہیے",
    "datesRequired": "شروع اور ختم کی تاریخیں ضروری ہیں",
    "endDateAfterStart": "ختم کی تاریخ شروع کی تاریخ کے بعد ہونی چاہیے",
    "categoriesRequired": "کم از کم ایک کیٹگری ضروری ہے",
    "categoryNameRequired": "کیٹگری کا نام ضروری ہے",
    "categorySuggestedAmountRequired": "کیٹگری کی تجویز کردہ رقم ضروری ہے",
    "totalSuggestedExceedsBudget": "کل تجویز کردہ رقم بجٹ سے زیادہ ہے",
    "errorCreatingBudget": "بجٹ بناتے وقت خرابی۔ دوبارہ کوشش کریں۔",
    "voting": "ووٹنگ",
    "approved": "منظور شدہ",
    "budgetNotFound": "بجٹ نہیں ملا",
    "updateVote": "ووٹ اپ ڈیٹ کریں",
    "voteOnBudget": "بجٹ پر ووٹ دیں",
    "allocateBudget": "بجٹ تقسیم کریں",
    "allocateBudgetDescription": "اپنی ترجیحات کی بنیاد پر کل بجٹ کو کیٹگریز میں تقسیم کریں",
    "remaining": "باقی",
    "budgetExceeded": "بجٹ ختم! براہ کرم تقسیم کم کریں۔",
    "suggested": "تجویز کردہ",
    "yourAllocation": "آپ کی تقسیم",
    "useSuggested": "تجویز کردہ استعمال کریں",
    "averageAllocation": "اوسط تقسیم",
    "totalVotes": "کل ووٹس",
    "yourVote": "آپ کا ووٹ",
    "notVoted": "ووٹ نہیں دیا",
    "useSuggestedAmounts": "تجویز کردہ رقم استعمال کریں",
    "saving": "محفوظ کر رہے ہیں...",
    "submitVote": "ووٹ جمع کریں",
    "budgetStats": "بجٹ کے اعداد و شمار",
    "totalParticipants": "کل شرکا",
    "categories": "کیٹگریز",
    "timeRemaining": "باقی وقت",
    "yourParticipation": "آپ کی شرکت",
    "votingStatus": "ووٹنگ کی صورتحال",
    "voted": "ووٹ دیا",
    "totalAllocated": "کل تقسیم شدہ",
    "lastUpdated": "آخری اپ ڈیٹ",
    "never": "کبھی نہیں",
    "voteSubmittedSuccessfully": "ووٹ کامیابی سے جمع ہوا!",
    "errorSavingVote": "ووٹ محفوظ کرتے وقت خرابی۔ دوبارہ کوشش کریں۔",
    "ends": "ختم",
    
    // Enhanced Process Types (Decidim & Polis inspired)
    "processType.consultation": "حکومتی مشاورت",
    "processType.initiative": "شہری اقدام",
    "processType.assembly": "بحث و مذاکرہ کی اسمبلی",
    "processType.poll": "رائے شماری",
    "processType.petition": "درخواست",
    "processType.budget": "شراکتی بجٹ",
    "processType.debate": "عوامی بحث",
    
    "processScope.federal": "وفاقی",
    "processScope.provincial": "صوبائی",
    "processScope.city": "شہری",
    "processScope.district": "ضلعی",
    "processScope.community": "کمیونٹی",
    
    "participationMethod.open": "سب کے لیے کھلا",
    "participationMethod.invited": "دعوت پر",
    "participationMethod.random_selection": "بے ترتیب انتخاب",
    "participationMethod.application": "درخواست کے ذریعے",
    
    "visibility.public": "عوامی",
    "visibility.restricted": "محدود",
    "visibility.private": "نجی",
    
    "signatureThreshold": "دستخط کی حد",
    "currentSignatures": "موجودہ دستخط",
    "signProcess": "عمل پر دستخط",
    "removeSignature": "دستخط ہٹائیں",
    "signatureProgress": "دستخط کی پیش قدمی",
    "signatureDeadline": "دستخط کی آخری تاریخ",
    "governmentResponse": "حکومتی جواب",
    "responseRequired": "جواب درکار",
    "responseDeadline": "جواب کی آخری تاریخ",
    "awaitingResponse": "حکومتی جواب کا انتظار",
    "thresholdMet": "حد پوری ہوگئی!",
    "signatureComment": "تبصرہ (اختیاری)",
    "verificationRequired": "تصدیق درکار",
    
    "meetingType.in_person": "ذاتی طور پر",
    "meetingType.online": "آن لائن",
    "meetingType.hybrid": "ملا جلا",
    
    "meetingStatus.upcoming": "آنے والا",
    "meetingStatus.ongoing": "جاری",
    "meetingStatus.completed": "مکمل",
    "meetingStatus.cancelled": "منسوخ",
    
    "registerForMeeting": "میٹنگ کے لیے رجسٹر",
    "meetingRegistration": "میٹنگ رجسٹریشن",
    "maxAttendees": "زیادہ سے زیادہ شرکاء",
    "registrationDeadline": "رجسٹریشن کی آخری تاریخ",
    "onlineMeetingUrl": "آن لائن میٹنگ URL",
    "agenda": "ایجنڈا",
    "minutes": "کارروائی",
    
    "userRole.citizen": "شہری",
    "userRole.government_admin": "حکومتی ایڈمن",
    "userRole.moderator": "ناظم",
    "userRole.facilitator": "سہولت کار",
    "userRole.observer": "مبصر",
    
    "followProcess": "عمل کو فالو کریں",
    "unfollowProcess": "عمل کو ان فالو کریں",
    "followers": "فالوورز",
    "notificationPreferences": "اطلاع کی ترجیحات",
    "emailNotifications": "ای میل اطلاعات",
    "pushNotifications": "پش اطلاعات",
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
