import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, ArrowRight, Building2, Hospital, ShieldCheck, Stethoscope, Store, Target, Eye, AlertCircle, CheckCircle2 } from "lucide-react";
import { Link } from "wouter";
import { BrandLockup } from "@/components/BrandLockup";

export default function AboutPage() {
  const { language, setLanguage, t } = useLanguage();
  const isAr = language === "ar";

  return (
    <div className="min-h-screen bg-background text-foreground" dir={isAr ? "rtl" : "ltr"}>
      {/* Top Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" aria-label={isAr ? "العودة إلى الرئيسية" : "Back to home"}>
            <BrandLockup compact />
          </Link>
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLanguage(isAr ? "en" : "ar")}
              className="text-xs font-medium"
            >
              {isAr ? "English" : "العربية"}
            </Button>
            <Link href="/">
              <Button variant="outline" size="sm" className="gap-2">
                {isAr ? <ArrowRight className="h-4 w-4" /> : <ArrowLeft className="h-4 w-4" />}
                {isAr ? "الرئيسية" : "Home"}
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12 space-y-12 max-w-5xl">
        {/* Hero Section */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
            <Target className="h-4 w-4" />
            {isAr ? "الأمن الدوائي عبر ذكاء السوق" : "Pharmaceutical Security through Market Intelligence"}
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
            {isAr ? "ما هي منصة PharmaYemen؟" : "What is Yemen Pharma Intelligence?"}
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            {isAr
              ? "منصة استخبارات سوقية متخصصة لربط منظومة الدواء في اليمن، مصممة خصيصاً لاكتشاف العرض والطلب، رصد الفائض والشح، وإبراز المخزون غير المرئي والبدائل العلاجية دون أي تدخل مالي أو تجاري."
              : "A specialized market intelligence platform connecting Yemen's pharmaceutical ecosystem, designed to discover supply and demand, detect surpluses and shortages, and surface invisible inventory and alternatives without financial or commercial intervention."}
          </p>
        </div>

        {/* What We Are NOT */}
        <Card className="border-destructive/30 bg-destructive/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              {isAr ? "ما الذي لا تفعله هذه المنصة؟ (مهم جداً)" : "What This Platform DOES NOT Do (Critical Notice)"}
            </CardTitle>
          </CardHeader>
          <CardContent className="grid sm:grid-cols-2 gap-4 text-sm">
            <div className="flex items-start gap-2">
              <span className="text-destructive font-bold text-lg">✕</span>
              <span>{isAr ? "ليست متجراً إلكترونياً أو صيدلية افتراضية." : "Not an e-commerce store or online pharmacy."}</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-destructive font-bold text-lg">✕</span>
              <span>{isAr ? "لا تبيع أو تشترك في بيع الأدوية." : "Does not sell or participate in selling medicines."}</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-destructive font-bold text-lg">✕</span>
              <span>{isAr ? "لا تستلم الأموال أو تدير المعاملات المالية." : "Does not handle money or process financial transactions."}</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-destructive font-bold text-lg">✕</span>
              <span>{isAr ? "لا تقدم استشارات طبية أو تشخيصاً للمرضى." : "Does not provide medical advice or patient diagnosis."}</span>
            </div>
          </CardContent>
        </Card>

        {/* Core Goals */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <Eye className="h-8 w-8 text-primary mb-2" />
              <CardTitle>{isAr ? "رؤية السوق" : "Market Visibility"}</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground text-sm leading-relaxed">
              {isAr
                ? "إظهار العروض والطلبات الحقيقية من الميدان لتمكين صانع القرار والمؤسسات من قراءة حركة السوق بدقة."
                : "Surface real supply and demand from the field, empowering decision-makers and institutions to accurately read market movements."}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <ShieldCheck className="h-8 w-8 text-primary mb-2" />
              <CardTitle>{isAr ? "كشف الشح والفائض" : "Shortage & Surplus"}</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground text-sm leading-relaxed">
              {isAr
                ? "التنبيه المبكر لحالات النقص الحاد في الأدوية الأساسية واكتشاف الفائض لدى الجهات الأخرى لإعادة توجيه الإمداد."
                : "Early warning for acute shortages in essential medicines and discovering surpluses at other entities to redirect supply."}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Target className="h-8 w-8 text-primary mb-2" />
              <CardTitle>{isAr ? "الربط الآمن" : "Secure Matching"}</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground text-sm leading-relaxed">
              {isAr
                ? "مطابقة اسمية ذكية بين العروض والطلبات بغض النظر عن اختلاف الكميات، وتوفير قنوات تواصل آمنة بين الجهات."
                : "Smart nominal matching between offers and requests regardless of quantity differences, providing secure communication channels."}
            </CardContent>
          </Card>
        </div>

        {/* Roles of Participating Entities */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold tracking-tight text-center">
            {isAr ? "أدوار الجهات المشاركة في المنصة" : "Roles of Participating Entities"}
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="hover:border-primary/50 transition-colors">
              <CardHeader className="space-y-1">
                <Store className="h-6 w-6 text-primary" />
                <CardTitle className="text-base">{isAr ? "الصيدليات" : "Pharmacies"}</CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground leading-relaxed">
                {isAr
                  ? "إظهار الفائض لديهم أو البحث عن أصناف غير متوفرة محلياً لتأمين احتياجات المرضى بسرعة."
                  : "Displaying inventory surplus or searching for hard-to-find items locally to secure patient needs quickly."}
              </CardContent>
            </Card>
            <Card className="hover:border-primary/50 transition-colors">
              <CardHeader className="space-y-1">
                <Hospital className="h-6 w-6 text-primary" />
                <CardTitle className="text-base">{isAr ? "المستشفيات" : "Hospitals"}</CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground leading-relaxed">
                {isAr
                  ? "مراقبة المخزون الاستراتيجي، إعلان النقص العاجل، وتنسيق التوريد الطارئ بين المرافق."
                  : "Monitoring strategic stock, declaring urgent shortages, and coordinating emergency supply between facilities."}
              </CardContent>
            </Card>
            <Card className="hover:border-primary/50 transition-colors">
              <CardHeader className="space-y-1">
                <Building2 className="h-6 w-6 text-primary" />
                <CardTitle className="text-base">{isAr ? "الموزعون والشركات" : "Distributors & Importers"}</CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground leading-relaxed">
                {isAr
                  ? "قراءة مؤشرات الطلب الفعلي في المحافظات لتوجيه شحنات الاستيراد والتوزيع بكفاءة عالية."
                  : "Reading actual demand indicators across governorates to efficiently target import and distribution shipments."}
              </CardContent>
            </Card>
            <Card className="hover:border-primary/50 transition-colors">
              <CardHeader className="space-y-1">
                <Stethoscope className="h-6 w-6 text-primary" />
                <CardTitle className="text-base">{isAr ? "العيادات والكوادر" : "Clinics & Practitioners"}</CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground leading-relaxed">
                {isAr
                  ? "التعرف على توفر الأدوية التخصصية والبدائل العلاجية المعتمدة لخدمة المرضى."
                  : "Identifying availability of specialized medications and approved therapeutic alternatives for patients."}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Strategic Approach - intentionally kept outside the core user journey */}
        <div className="space-y-6">
          <div className="text-center space-y-3">
            <h2 className="text-2xl font-bold tracking-tight">
              {isAr ? "منهجية التوسع والتواصل" : "Growth & Outreach Approach"}
            </h2>
            <p className="max-w-3xl mx-auto text-sm leading-relaxed text-muted-foreground">
              {isAr
                ? "هذه المنهجية تشرح كيف تنمو المنصة بصورة مسؤولة. وهي معلومات تعريفية للشركاء والجهات المهتمة، وليست جزءاً من خطوات استخدام المنصة اليومية."
                : "This approach explains how the platform can grow responsibly. It is informational content for partners and interested entities, not part of the day-to-day product journey."}
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            <Card className="border-border/70">
              <CardHeader className="space-y-2">
                <ShieldCheck className="h-7 w-7 text-primary" />
                <CardTitle className="text-base">{isAr ? "1. بناء شبكة موثقة" : "1. Build a verified network"}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground leading-relaxed">
                {isAr
                  ? "تبدأ المنصة بالجهات الصحية والصيدلانية المعتمدة، مع مراجعة بيانات الجهة وصلاحيات واضحة لكل دور."
                  : "The platform begins with verified health and pharmaceutical entities, with reviewed entity information and clear role permissions."}
              </CardContent>
            </Card>
            <Card className="border-border/70">
              <CardHeader className="space-y-2">
                <Target className="h-7 w-7 text-primary" />
                <CardTitle className="text-base">{isAr ? "2. رفع جودة الإشارات" : "2. Improve signal quality"}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground leading-relaxed">
                {isAr
                  ? "تتحسن فائدة مؤشرات السوق تدريجياً بزيادة العروض والطلبات الموثوقة وتحسين جودة بيانات الكتالوج والبدائل."
                  : "Market signals become more useful as verified offers and requests grow and catalog and alternative data quality improves."}
              </CardContent>
            </Card>
            <Card className="border-border/70">
              <CardHeader className="space-y-2">
                <Building2 className="h-7 w-7 text-primary" />
                <CardTitle className="text-base">{isAr ? "3. تواصل مؤسسي مسؤول" : "3. Responsible institutional outreach"}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground leading-relaxed">
                {isAr
                  ? "تشمل قنوات التواصل المنصة نفسها وإشعاراتها، والتعاون المباشر مع الجهات المعتمدة، والشراكات القائمة على الموافقة وحماية البيانات؛ من دون ادعاء قنوات أو حسابات غير رسمية."
                  : "Outreach channels include the platform and its alerts, direct collaboration with verified entities, and consent-based, privacy-respecting partnerships—without claiming unofficial channels or accounts."}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Comparison Table */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold tracking-tight text-center">
            {isAr ? "مقارنة مع المنصات الأخرى" : "Comparison with Other Platforms"}
          </h2>
          <Card>
            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full text-sm text-start border-collapse">
                <thead>
                  <tr className="border-b border-border bg-muted/50 text-muted-foreground">
                    <th className="p-4 text-start font-medium">{isAr ? "وجه المقارنة" : "Feature"}</th>
                    <th className="p-4 text-start font-medium text-primary">{isAr ? "PharmaYemen (ذكاء سوقي)" : "PharmaYemen (Intelligence)"}</th>
                    <th className="p-4 text-start font-medium text-muted-foreground">{isAr ? "الصيدلية الإلكترونية التقليدية" : "Traditional Online Pharmacy"}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  <tr>
                    <td className="p-4 font-medium">{isAr ? "طبيعة العمل" : "Nature of Operations"}</td>
                    <td className="p-4">{isAr ? "عرض وطلب سوقي وإحصاءات وشح وفائض" : "Market supply/demand, statistics & shortages"}</td>
                    <td className="p-4">{isAr ? "بيع بالتجزئة وتوصيل للمستهلك النهائي" : "Retail sales & consumer delivery"}</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-medium">{isAr ? "حركة الأموال" : "Financial Transactions"}</td>
                    <td className="p-4 text-emerald-600 font-medium">{isAr ? "لا توجد أي أموال أو بوابات دفع" : "None (No money or payment gateways)"}</td>
                    <td className="p-4">{isAr ? "دفع إلكتروني وعمليات بيع وشراء مباشرة" : "Online payments & direct sales"}</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-medium">{isAr ? "الجمهور المستهدف" : "Target Audience"}</td>
                    <td className="p-4">{isAr ? "الجهات المعتمدة (صيدليات، مستشفيات، موزعين)" : "Verified entities (pharmacies, hospitals)"}</td>
                    <td className="p-4">{isAr ? "الجمهور العام والأفراد المرضى" : "General public & individual patients"}</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-medium">{isAr ? "الهدف الأساسي" : "Primary Goal"}</td>
                    <td className="p-4">{isAr ? "شفافية السوق، اكتشاف البدائل، وسد الفجوات" : "Market transparency, alternatives & gap filling"}</td>
                    <td className="p-4">{isAr ? "تلبية وصفات الأفراد وتحقيق أرباح تجارية" : "Fulfilling prescriptions & commercial retail"}</td>
                  </tr>
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>

        {/* FAQ Section */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold tracking-tight text-center">
            {isAr ? "الأسئلة الشائعة (FAQ)" : "Frequently Asked Questions"}
          </h2>
          <div className="grid gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold">
                  {isAr ? "1. هل يمكنني شراء الأدوية أو بيعها عبر المنصة؟" : "1. Can I buy or sell medicines through the platform?"}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground leading-relaxed">
                {isAr
                  ? "لا مطلقاً. المنصة مخصصة بالكامل لذكاء السوق واكتشاف العرض والطلب والشح والفائض والبدائل، وليست متجراً إلكترونياً ولا تستلم أي أموال."
                  : "Absolutely not. The platform is strictly dedicated to market intelligence, discovering supply, demand, shortages, surpluses, and alternatives. It is not an e-commerce store and does not handle funds."}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold">
                  {isAr ? "2. كيف يتم مطابقة العروض والطلبات للأدوية؟" : "2. How are medicine offers and requests matched?"}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground leading-relaxed">
                {isAr
                  ? "تعتمد المطابقة الذكية على اسم الدواء (العلمي أو التجاري) والمنطقة، بحيث يتم ربط العرض بالطلب اسمياً بغض النظر عن تفاوت الكميات، مع إرسال إشعارات فورية للجهات المعنية."
                  : "Smart matching relies primarily on the drug name (generic or brand) and region, matching offers and requests nominally regardless of quantity differences, with instant notifications sent to relevant entities."}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold">
                  {isAr ? "3. من يمكنه التسجيل واستخدام المنصة؟" : "3. Who can register and use the platform?"}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground leading-relaxed">
                {isAr
                  ? "المنصة متاحة للجهات الصيدلانية والصحية المعتمدة في اليمن حصرياً: الصيدليات، المستشفيات والمراكز الطبية، شركات التوزيع والاستيراد، والعيادات والكوادر الطبية."
                  : "The platform is exclusively for verified pharmaceutical and health entities in Yemen: pharmacies, hospitals and medical centers, distribution and import companies, and medical clinics and practitioners."}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold">
                  {isAr ? "4. من أين تأتي بيانات كتالوج الأدوية؟" : "4. Where does the medicine catalog data come from?"}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground leading-relaxed">
                {isAr
                  ? "يعتمد الكتالوج الموحد على القوائم الوطنية الرسمية للأدوية الأساسية في اليمن (NEML 2019/2022) مع دعم إضافة الأسماء التجارية المتاحة للعامة وفق القوانين والتشريعات الناظمة."
                  : "The unified catalog is based on Yemen's official National Essential Medicines Lists (NEML 2019/2022), supporting public trade names in compliance with governing regulations."}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Footer CTA */}
        <div className="text-center bg-card border border-border rounded-2xl p-8 space-y-4">
          <h3 className="text-xl font-bold">{isAr ? "هل تمثل جهة صحية أو صيدلانية في اليمن؟" : "Represent a health or pharma entity in Yemen?"}</h3>
          <p className="text-muted-foreground max-w-xl mx-auto text-sm">
            {isAr
              ? "انضم إلى شبكة معلومات السوق الدوائي وساهم في تعزيز الأمن الدوائي وسد فجوات الإمداد."
              : "Join the pharmaceutical market intelligence network and contribute to enhancing drug security and closing supply gaps."}
          </p>
          <div className="pt-2 flex justify-center gap-4">
            <Link href="/dashboard">
              <Button size="lg" className="gap-2">
                {isAr ? "الدخول إلى لوحة التحكم" : "Open Dashboard"}
              </Button>
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card/30 mt-20 py-8 text-center text-xs text-muted-foreground">
        <p>© 2026 Yemen Pharma Intelligence (PharmaYemen). {isAr ? "جميع الحقوق محفوظة." : "All rights reserved."}</p>
      </footer>
    </div>
  );
}
