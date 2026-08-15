import { createContext, useContext, useEffect, useMemo, useState } from "react";

export type Language = "ar" | "en";

type LanguageContextValue = {
  language: Language;
  direction: "rtl" | "ltr";
  setLanguage: (language: Language) => void;
  toggleLanguage: () => void;
  t: (key: string, fallback?: string) => string;
};

const LANGUAGE_KEY = "pharmayemen-language";

const translations: Record<string, { ar: string; en: string }> = {
  "Sign in to continue": { ar: "سجّل الدخول للمتابعة", en: "Sign in to continue" },
  "Access to this dashboard requires authentication. Continue to launch the login flow.": { ar: "يتطلب الوصول إلى لوحة التحكم تسجيل الدخول. تابع لبدء عملية الدخول.", en: "Access to this dashboard requires authentication. Continue to launch the login flow." },
  "Sign in": { ar: "تسجيل الدخول", en: "Sign in" },
  "Sign out": { ar: "تسجيل الخروج", en: "Sign out" },
  "Toggle navigation": { ar: "تبديل القائمة الجانبية", en: "Toggle navigation" },
  Menu: { ar: "القائمة", en: "Menu" },
  Overview: { ar: "نظرة عامة", en: "Overview" },
  Offers: { ar: "العروض", en: "Offers" },
  Requests: { ar: "الطلبات", en: "Requests" },
  Drugs: { ar: "الأدوية", en: "Drugs" },
  Messages: { ar: "الرسائل", en: "Messages" },
  Matches: { ar: "المطابقات", en: "Matches" },
  Profile: { ar: "الملف الشخصي", en: "Profile" },
  Entities: { ar: "الجهات", en: "Entities" },
  Intelligence: { ar: "ذكاء السوق", en: "Intelligence" },
  Alternatives: { ar: "البدائل", en: "Alternatives" },
  Dashboard: { ar: "لوحة التحكم", en: "Dashboard" },
  "Get Started": { ar: "ابدأ الآن", en: "Get Started" },
  "Go to Dashboard": { ar: "الذهاب إلى لوحة التحكم", en: "Go to Dashboard" },
  "Learn More": { ar: "اعرف المزيد", en: "Learn More" },
  "Market Intelligence Platform": { ar: "منصة ذكاء السوق", en: "Market Intelligence Platform" },
  "Connecting Yemen's": { ar: "ربط منظومة", en: "Connecting Yemen's" },
  "Pharmaceutical": { ar: "الدواء في اليمن", en: "Pharmaceutical" },
  "Supply & Demand": { ar: "العرض والطلب", en: "Supply & Demand" },
  "The first intelligent marketplace linking pharmacies, hospitals, distributors, and clinics across Yemen. Match supply with demand, discover alternatives, and access real-time market intelligence.": { ar: "منصة استخبارات سوقية تربط الصيدليات والمستشفيات والموزعين والعيادات في اليمن، وتساعد على اكتشاف العرض والطلب والفائض والشح.", en: "The first intelligent marketplace linking pharmacies, hospitals, distributors, and clinics across Yemen. Match supply with demand, discover alternatives, and access real-time market intelligence." },
  Governorates: { ar: "محافظة", en: "Governorates" },
  "Drug Categories": { ar: "فئات دوائية", en: "Drug Categories" },
  "Active Matches": { ar: "مطابقات نشطة", en: "Active Matches" },
  "Market Signals": { ar: "إشارات السوق", en: "Market Signals" },
  "Real-time": { ar: "مباشرة", en: "Real-time" },
  Daily: { ar: "يومية", en: "Daily" },
  "Intelligent Pharmaceutical Marketplace": { ar: "منصة استخبارات سوق الدواء", en: "Intelligent Pharmaceutical Marketplace" },
  "Built specifically for Yemen's pharmaceutical ecosystem with features designed to address real supply chain challenges.": { ar: "مصممة لمنظومة الدواء في اليمن لمعالجة تحديات العرض والطلب وسلاسل الإمداد ببيانات قابلة للتنفيذ.", en: "Built specifically for Yemen's pharmaceutical ecosystem with features designed to address real supply chain challenges." },
  "Entity Verification": { ar: "توثيق الجهات", en: "Entity Verification" },
  "Official Drug Catalog": { ar: "الكتالوج الدوائي الرسمي", en: "Official Drug Catalog" },
  "Supply & Demand Matching": { ar: "مطابقة العرض والطلب", en: "Supply & Demand Matching" },
  "Secure Messaging": { ar: "مراسلة آمنة", en: "Secure Messaging" },
  "Market Intelligence": { ar: "ذكاء السوق", en: "Market Intelligence" },
  "Geographic Coverage": { ar: "التغطية الجغرافية", en: "Geographic Coverage" },
  "Smart Notifications": { ar: "إشعارات ذكية", en: "Smart Notifications" },
  "Drug Alternatives": { ar: "بدائل دوائية", en: "Drug Alternatives" },
  "Admin Dashboard": { ar: "لوحة المسؤول", en: "Admin Dashboard" },
  antibiotics: { ar: "مضادات حيوية", en: "Antibiotics" },
  analgesics: { ar: "مسكنات", en: "Analgesics" },
  cardiovascular: { ar: "أدوية القلب والأوعية", en: "Cardiovascular" },
  endocrine: { ar: "أدوية الغدد الصماء", en: "Endocrine" },
  gastrointestinal: { ar: "أدوية الجهاز الهضمي", en: "Gastrointestinal" },
  respiratory: { ar: "أدوية الجهاز التنفسي", en: "Respiratory" },
  antifungal: { ar: "مضادات فطريات", en: "Antifungal" },
  antiviral: { ar: "مضادات فيروسية", en: "Antiviral" },
  vitamins: { ar: "فيتامينات", en: "Vitamins" },
  neurological: { ar: "أدوية عصبية", en: "Neurological" },
  oncology: { ar: "أدوية الأورام", en: "Oncology" },
  dermatological: { ar: "أدوية جلدية", en: "Dermatological" },
  ophthalmological: { ar: "أدوية العيون", en: "Ophthalmological" },
  other: { ar: "أخرى", en: "Other" },
  "Antibiotics": { ar: "مضادات حيوية", en: "Antibiotics" },
  "Analgesics": { ar: "مسكنات", en: "Analgesics" },
  "Cardiovascular": { ar: "أدوية القلب والأوعية", en: "Cardiovascular" },
  "Endocrine": { ar: "أدوية الغدد الصماء", en: "Endocrine" },
  "Gastrointestinal": { ar: "أدوية الجهاز الهضمي", en: "Gastrointestinal" },
  "Respiratory": { ar: "أدوية الجهاز التنفسي", en: "Respiratory" },
  "Antifungal": { ar: "مضادات فطريات", en: "Antifungal" },
  "Antiviral": { ar: "مضادات فيروسية", en: "Antiviral" },
  "Vitamins": { ar: "فيتامينات", en: "Vitamins" },
  "Neurological": { ar: "أدوية عصبية", en: "Neurological" },
  "Oncology": { ar: "أدوية الأورام", en: "Oncology" },
  "Ophthalmological": { ar: "أدوية العيون", en: "Ophthalmological" },
  "Yemen Pharmaceutical Market Intelligence Platform": { ar: "منصة استخبارات سوق الدواء في اليمن", en: "Yemen Pharmaceutical Market Intelligence Platform" },
  "Connecting supply and demand across Yemen's pharmaceutical market": { ar: "ربط العرض والطلب في سوق الدواء اليمني", en: "Connecting supply and demand across Yemen's pharmaceutical market" },
  "How It Works": { ar: "كيف تعمل المنصة", en: "How It Works" },
  "Three simple steps to connect supply with demand": { ar: "ثلاث خطوات بسيطة لربط العرض بالطلب", en: "Three simple steps to connect supply with demand" },
  "Register & Verify": { ar: "سجّل ووثّق الجهة", en: "Register & Verify" },
  "Publish & Match": { ar: "انشر وطابق", en: "Publish & Match" },
  "Connect & Trade": { ar: "تواصل خارج المنصة", en: "Connect & Trade" },
  "National Essential Medicines Catalog": { ar: "الكتالوج الوطني للأدوية الأساسية", en: "National Essential Medicines Catalog" },
  "Unified records from Yemen’s 2019 and 2022 National Essential Medicines Lists": { ar: "سجلات موحّدة من قائمتي اليمن الوطنيتين للأدوية الأساسية لعامي 2019 و2022", en: "Unified records from Yemen’s 2019 and 2022 National Essential Medicines Lists" },
  Loading: { ar: "جارٍ التحميل", en: "Loading" },
  "Loading...": { ar: "جارٍ التحميل...", en: "Loading..." },
  Cancel: { ar: "إلغاء", en: "Cancel" },
  Save: { ar: "حفظ", en: "Save" },
  Submit: { ar: "إرسال", en: "Submit" },
  Close: { ar: "إغلاق", en: "Close" },
  Search: { ar: "بحث", en: "Search" },
  "All Categories": { ar: "كل الفئات", en: "All Categories" },
  "No entity registered. Please register first.": { ar: "لا توجد جهة مسجلة. يرجى تسجيل جهة أولاً.", en: "No entity registered. Please register first." },
  "No notifications yet": { ar: "لا توجد إشعارات بعد", en: "No notifications yet" },
  "No messages yet. Start the conversation.": { ar: "لا توجد رسائل بعد. ابدأ المحادثة.", en: "No messages yet. Start the conversation." },
  "No conversations yet": { ar: "لا توجد محادثات بعد", en: "No conversations yet" },
  "No offers yet": { ar: "لا توجد عروض بعد", en: "No offers yet" },
  "No requests yet": { ar: "لا توجد طلبات بعد", en: "No requests yet" },
  "No active offers found": { ar: "لم يتم العثور على عروض نشطة", en: "No active offers found" },
  "No open requests found": { ar: "لم يتم العثور على طلبات مفتوحة", en: "No open requests found" },
  "Your activity alerts and updates": { ar: "تنبيهات نشاطك وتحديثاته", en: "Your activity alerts and updates" },
  "Register Your Entity": { ar: "سجّل جهتك", en: "Register Your Entity" },
  "Register your pharmacy, hospital, distributor, or clinic": { ar: "سجّل صيدليتك أو مستشفاك أو موزعك أو عيادتك", en: "Register your pharmacy, hospital, distributor, or clinic" },
  "Entity Registration": { ar: "تسجيل جهة", en: "Entity Registration" },
  "Entity Verified": { ar: "تم توثيق الجهة", en: "Entity Verified" },
  "Pending Verification": { ar: "بانتظار التوثيق", en: "Pending Verification" },
  "Your registration is being reviewed by an administrator.": { ar: "تتم مراجعة تسجيلك من قبل المسؤول.", en: "Your registration is being reviewed by an administrator." },
  "Create New Offer": { ar: "إنشاء عرض جديد", en: "Create New Offer" },
  "Create New Request": { ar: "إنشاء طلب جديد", en: "Create New Request" },
  "Demand requests in the marketplace": { ar: "طلبات الطلب في السوق", en: "Demand requests in the marketplace" },
  "Supply offerings in the marketplace": { ar: "عروض التوريد في السوق", en: "Supply offerings in the marketplace" },
  Quantity: { ar: "الكمية", en: "Quantity" },
  Unit: { ar: "الوحدة", en: "Unit" },
  Urgency: { ar: "درجة الاستعجال", en: "Urgency" },
  Low: { ar: "منخفض", en: "Low" },
  Medium: { ar: "متوسط", en: "Medium" },
  High: { ar: "مرتفع", en: "High" },
  Critical: { ar: "حرج", en: "Critical" },
  "Select Drug": { ar: "اختر الدواء", en: "Select Drug" },
  "Search drugs...": { ar: "ابحث عن دواء...", en: "Search drugs..." },
  "Drug Name": { ar: "اسم الدواء", en: "Drug Name" },
  "Name": { ar: "الاسم", en: "Name" },
  "Type": { ar: "النوع", en: "Type" },
  "Pharmacy": { ar: "صيدلية", en: "Pharmacy" },
  "Hospital": { ar: "مستشفى", en: "Hospital" },
  "Distributor": { ar: "موزع", en: "Distributor" },
  "Clinic": { ar: "عيادة", en: "Clinic" },
  "Region": { ar: "الإقليم", en: "Region" },
  "Governorate": { ar: "المحافظة", en: "Governorate" },
  "City": { ar: "المدينة", en: "City" },
  "Address": { ar: "العنوان", en: "Address" },
  "Contact Person": { ar: "جهة الاتصال", en: "Contact Person" },
  Phone: { ar: "الهاتف", en: "Phone" },
  "License Number": { ar: "رقم الترخيص", en: "License Number" },
  "Welcome back": { ar: "أهلاً بك", en: "Welcome back" },
  "Active Offers": { ar: "العروض النشطة", en: "Active Offers" },
  "Open Requests": { ar: "الطلبات المفتوحة", en: "Open Requests" },
};

const reverseTranslations = Object.fromEntries(
  Object.entries(translations).map(([key, values]) => [values.ar, key]),
);

function readInitialLanguage(): Language {
  if (typeof window === "undefined") return "ar";
  return window.localStorage.getItem(LANGUAGE_KEY) === "en" ? "en" : "ar";
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>(readInitialLanguage);
  const direction = language === "ar" ? "rtl" : "ltr";

  const setLanguage = (next: Language) => {
    setLanguageState(next);
    window.localStorage.setItem(LANGUAGE_KEY, next);
  };

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = direction;
    document.body.dataset.language = language;
  }, [direction, language]);

  const value = useMemo<LanguageContextValue>(() => ({
    language,
    direction,
    setLanguage,
    toggleLanguage: () => setLanguage(language === "ar" ? "en" : "ar"),
    t: (key, fallback) => translations[key]?.[language] ?? fallback ?? key,
  }), [direction, language]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used inside LanguageProvider");
  return context;
}

export function translateKnownText(value: string, language: Language): string {
  const normalized = value.replace(/\s+/g, " ").trim();
  if (language === "en") return reverseTranslations[normalized] ?? value;
  return translations[normalized]?.ar ?? value;
}
