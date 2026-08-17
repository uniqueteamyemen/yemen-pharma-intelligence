import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { startLogin } from "@/const";
import {
  Activity,
  ArrowRight,
  Bell,
  Building2,
  CheckCircle2,
  FileSearch,
  Handshake,
  Hospital,
  MapPin,
  Pill,
  Search,
  ShieldCheck,
  Stethoscope,
  Store,
  TrendingUp,
} from "lucide-react";
import { Link } from "wouter";
import { BrandLockup } from "@/components/BrandLockup";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useLanguage } from "@/contexts/LanguageContext";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { AlertCircle } from "lucide-react";
import { useState } from "react";

type FeaturePoint = {
  icon: typeof Pill;
  title: string;
  detail: string;
};

export default function Home() {
  const { isAuthenticated, loading } = useAuth();
  const { language, t } = useLanguage();
  const isAr = language === "ar";
  const [loginError, setLoginError] = useState(false);
  const beginLogin = () => {
    try {
      setLoginError(false);
      startLogin();
    } catch {
      setLoginError(true);
    }
  };

  const faqs = [
    { q: isAr ? "هل تبيع PharmaYemen الأدوية أو تستقبل مدفوعات؟" : "Does PharmaYemen sell medicines or accept payments?", a: isAr ? "لا. المنصة تعرض معلومات العرض والطلب وفرص التنسيق فقط، بينما البيع والشراء والتوريد تتم خارج المنصة وبمسؤولية الأطراف." : "No. The platform surfaces supply, demand, and coordination opportunities only. Sales, purchasing, and delivery happen outside the platform under the parties’ responsibility." },
    { q: isAr ? "هل أحتاج إلى اختيار دواء من القائمة دائماً؟" : "Must I always select a medicine from the list?", a: isAr ? "لا. الاقتراحات تساعد على التعرف على الاسم، ويمكن حفظ الاسم كنص حر إذا لم يكن أي اقتراح مناسباً." : "No. Suggestions help identify the name, and an entered name can be saved as free text when no suggestion is appropriate." },
    { q: isAr ? "هل يعني ظهور تطابق أن الدواء متوفر أو أن الصفقة تمت؟" : "Does a match mean the medicine is available or a deal is complete?", a: isAr ? "لا. التطابق يعني وجود فرصة تنسيق عند تشابه الاسم، ثم تتواصل الجهات المعنية وتتفق خارج المنصة." : "No. A match indicates a coordination opportunity when names align; the relevant entities then communicate and agree outside the platform." },
    { q: isAr ? "كيف تحمي المنصة البيانات؟" : "How does the platform protect data?", a: isAr ? "يتم الدخول عبر مزود هوية آمن، وتظهر البيانات بحسب المستخدم والجهة والصلاحيات. لا تطلب المنصة كلمة مرور داخل واجهتها." : "Access uses a secure identity provider, and data is shown according to the user, entity, and permissions. The platform does not collect passwords directly." },
  ];

  const userJourney = [
    {
      step: "01",
      icon: ShieldCheck,
      title: isAr ? "سجّل جهتك" : "Register your entity",
      desc: isAr
        ? "أضف بيانات الصيدلية أو المستشفى أو الجهة الموزعة ضمن بيئة موثقة."
        : "Add your pharmacy, hospital, or distributor information in a verified environment.",
    },
    {
      step: "02",
      icon: Search,
      title: isAr ? "أنشئ عرضاً أو طلباً" : "Create an offer or request",
      desc: isAr
        ? "ابحث بالاسم العربي أو الإنجليزي أو الاسم التجاري، ثم أضف احتياجك أو فائضك."
        : "Search in Arabic, English, or by trade name, then record your need or surplus.",
    },
    {
      step: "03",
      icon: Handshake,
      title: isAr ? "اكتشف التطابق" : "Discover a match",
      desc: isAr
        ? "يربط المحرك العروض والطلبات عند تطابق اسم الدواء، من دون أن تمنع الكمية ظهور التطابق."
        : "The engine links offers and requests when the drug name matches; quantities never block a match.",
    },
    {
      step: "04",
      icon: Bell,
      title: isAr ? "استلم إشعاراً" : "Receive an alert",
      desc: isAr
        ? "تظهر المطابقة للجهات المعنية لتنسيق الخطوات التالية خارج المنصة وبمسؤوليتها."
        : "Relevant entities see the match to coordinate next steps outside the platform and under their responsibility.",
    },
  ];

  const keyBenefits: FeaturePoint[] = [
    {
      icon: FileSearch,
      title: isAr ? "كتالوج موحد" : "Unified catalog",
      detail: isAr
        ? "742 سجلاً دوائياً في كتالوج وطني موحد، مع بحث بالاسم العلمي والتجاري والمادة الفعالة."
        : "742 medicine records in one national catalog, searchable by generic name, trade name, and active ingredient.",
    },
    {
      icon: Handshake,
      title: isAr ? "مطابقة اسمية ذكية" : "Smart name matching",
      detail: isAr
        ? "اسم الدواء هو معيار المطابقة الأول؛ وتضيف المنطقة ودرجة الاستعجال سياقاً للنتيجة."
        : "The drug name is the primary match criterion; region and urgency add useful context to the result.",
    },
  ];

  const entityCards = [
    {
      icon: Store,
      title: isAr ? "الصيدليات" : "Pharmacies",
      detail: isAr ? "إظهار الفائض أو طلب الأصناف غير المتوفرة محلياً." : "Surface surplus or request items unavailable locally.",
    },
    {
      icon: Hospital,
      title: isAr ? "المستشفيات والمراكز" : "Hospitals & centers",
      detail: isAr ? "رصد الاحتياجات العاجلة ومراقبة المخزون الاستراتيجي." : "Report urgent needs and monitor strategic inventory.",
    },
    {
      icon: Building2,
      title: isAr ? "الموزعون والمستوردون" : "Distributors & importers",
      detail: isAr ? "قراءة اتجاهات الطلب لتوجيه التوزيع بشكل أفضل." : "Read demand patterns to improve distribution decisions.",
    },
    {
      icon: Stethoscope,
      title: isAr ? "العيادات والكوادر" : "Clinics & practitioners",
      detail: isAr ? "التعرّف على توفر الأصناف والبدائل الدوائية." : "Identify availability and therapeutic alternatives.",
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground" dir={isAr ? "rtl" : "ltr"}>
      <nav className="sticky top-0 z-50 border-b border-border/50 bg-background/85 backdrop-blur-lg">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <BrandLockup compact />
            <LanguageSwitcher compact />
          </div>
          {!loading && (
            isAuthenticated ? (
              <Link href="/dashboard"><Button size="sm">{t("Dashboard")}</Button></Link>
            ) : (
              <Button onClick={beginLogin} size="sm">{t("Sign in")}</Button>
            )
          )}
        </div>
      </nav>

      <main>
        <section className="brand-network relative isolate overflow-hidden px-6 py-16 md:py-24 lg:py-28">
          <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_85%_15%,hsl(var(--primary)/0.16),transparent_28%),radial-gradient(circle_at_10%_95%,hsl(var(--primary)/0.1),transparent_35%)]" />
          <div className="absolute -end-24 top-8 -z-10 h-72 w-72 rounded-full border border-primary/10 bg-primary/5 blur-3xl" />
          <div className="container grid items-center gap-12 lg:grid-cols-[1.08fr_0.92fr]">
            <div className="max-w-3xl">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary">
                <Activity className="h-4 w-4" />
                {isAr ? "الأمن الدوائي عبر ذكاء السوق" : "Pharmaceutical security through market intelligence"}
              </div>
              <h1 className="mb-6 text-4xl font-bold leading-tight tracking-tight md:text-6xl lg:text-7xl">
                {t("Connecting Yemen's")} <span className="text-primary">{t("Pharmaceutical")}</span>
                <br />
                {t("Supply & Demand")}
              </h1>
              <p className="mb-9 max-w-2xl text-lg leading-relaxed text-muted-foreground md:text-xl">
                {isAr
                  ? "نساعد الجهات الصيدلانية والصحية على رؤية العرض والطلب، اكتشاف الشح والفائض، وإبراز البدائل والمخزون غير المرئي — من دون بيع أو شراء أو مدفوعات داخل المنصة."
                  : "We help pharmaceutical and health entities see supply and demand, identify shortages and surpluses, and surface alternatives and invisible inventory — without sales, purchases, or payments on the platform."}
              </p>
              <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
                {isAuthenticated ? (
                  <Link href="/dashboard">
                    <Button size="lg" className="h-12 px-8 text-base shadow-lg shadow-primary/20">
                      {t("Go to Dashboard")}<ArrowRight className="ms-2 h-4 w-4" />
                    </Button>
                  </Link>
                ) : (
                  <Button onClick={beginLogin} size="lg" className="h-12 px-8 text-base shadow-lg shadow-primary/20">
                    {t("Get Started")}<ArrowRight className="ms-2 h-4 w-4" />
                  </Button>
                )}
                <Link href="/about"><Button variant="outline" size="lg" className="h-12 px-8 text-base">{t("Learn More")}</Button></Link>
              </div>
              {loginError && (
                <p className="mt-4 flex items-center gap-2 text-sm text-destructive" role="alert">
                  <AlertCircle className="h-4 w-4" />
                  {isAr ? "تعذّر بدء تسجيل الدخول. حدّث الصفحة وتأكد من السماح بملفات تعريف الارتباط ثم أعد المحاولة." : "We could not start sign-in. Refresh the page, allow cookies, then try again."}
                </p>
              )}
            </div>

            <Card className="overflow-hidden border-primary/15 bg-card/85 shadow-xl shadow-primary/5 backdrop-blur-sm">
              <CardContent className="p-6 md:p-8">
                <div className="mb-6 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-primary">{isAr ? "من الرؤية إلى الأمن الدوائي" : "From visibility to pharmaceutical security"}</p>
                    <h2 className="mt-1 text-2xl font-bold">{isAr ? "معلومات سوقية قابلة للتنفيذ" : "Actionable market insight"}</h2>
                  </div>
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10"><TrendingUp className="h-6 w-6 text-primary" /></div>
                </div>
                <div className="space-y-4">
                  {[
                    isAr ? "إظهار العروض والطلبات من الجهات المعتمدة" : "Surface offers and requests from verified entities",
                    isAr ? "كشف مؤشرات الشح والفائض في السوق" : "Reveal market shortage and surplus signals",
                    isAr ? "ربط الجهات عند تطابق اسم الدواء" : "Connect entities when medicine names match",
                  ].map((point) => (
                    <div key={point} className="flex items-start gap-3 rounded-xl border border-border/60 bg-background/65 p-3.5">
                      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                      <p className="text-sm leading-relaxed text-muted-foreground">{point}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="border-y border-border/50 bg-secondary/45 py-10">
          <div className="container grid grid-cols-2 gap-8 md:grid-cols-4">
            {[
              { label: isAr ? "دواء في الكتالوج الموحد" : "Medicines in unified catalog", value: "742", icon: Pill },
              { label: t("Governorates"), value: "22", icon: MapPin },
              { label: isAr ? "مطابقة حسب اسم الدواء" : "Drug-name-based matching", value: t("Real-time"), icon: Handshake },
              { label: t("Market Signals"), value: t("Daily"), icon: TrendingUp },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <stat.icon className="mx-auto mb-2 h-6 w-6 text-primary" />
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="mt-1 text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="py-20 md:py-24">
          <div className="container grid gap-8 lg:grid-cols-2">
            <Card className="border-border/70 bg-card">
              <CardContent className="p-7 md:p-9">
                <p className="mb-3 text-sm font-semibold text-primary">{isAr ? "المشكلة" : "The challenge"}</p>
                <h2 className="mb-4 text-3xl font-bold tracking-tight">{isAr ? "المعلومات الدوائية ليست دائماً في المكان الذي يحتاجها فيه السوق." : "Pharmaceutical information is not always where the market needs it."}</h2>
                <p className="leading-relaxed text-muted-foreground">{isAr ? "قد يتوفر صنف دوائي لدى جهة بينما تبحث عنه جهة أخرى، من دون رؤية واضحة للاحتياج أو الفائض أو البدائل المتاحة." : "A medicine may be available at one entity while another is searching for it, with little visibility into need, surplus, or available alternatives."}</p>
              </CardContent>
            </Card>
            <Card className="border-primary/20 bg-primary/[0.045]">
              <CardContent className="p-7 md:p-9">
                <p className="mb-3 text-sm font-semibold text-primary">{isAr ? "استجابة المنصة" : "Platform response"}</p>
                <h2 className="mb-4 text-3xl font-bold tracking-tight">{isAr ? "نجمع إشارات السوق ونحوّلها إلى رؤية أوضح للجهات المعتمدة." : "We turn market signals into clearer visibility for verified entities."}</h2>
                <p className="leading-relaxed text-muted-foreground">{isAr ? "تسجل الجهات عروضها وطلباتها، ثم تساعد المطابقة والتنبيهات في كشف فرص التنسيق، فيما تبقى أي ترتيبات تشغيلية أو تجارية خارج المنصة." : "Entities record their offers and requests; matching and alerts reveal coordination opportunities, while any operational or commercial arrangements remain outside the platform."}</p>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="bg-secondary/35 py-20 md:py-24">
          <div className="container">
            <div className="mx-auto mb-14 max-w-2xl text-center">
              <p className="mb-3 text-sm font-semibold text-primary">{isAr ? "رحلة المستخدم" : "User journey"}</p>
              <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl">{isAr ? "كيف تعمل المنصة؟" : "How does the platform work?"}</h2>
              <p className="text-muted-foreground">{isAr ? "أربع خطوات واضحة من تسجيل الجهة إلى ظهور فرصة المطابقة وإشعار الأطراف المعنية." : "Four clear steps from registering an entity to surfacing a match and notifying relevant parties."}</p>
            </div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {userJourney.map((item) => (
                <Card key={item.step} className="relative overflow-hidden border-border/70 bg-background/80">
                  <CardContent className="p-6">
                    <span className="absolute end-4 top-3 text-5xl font-bold text-primary/[0.09]">{item.step}</span>
                    <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10"><item.icon className="h-5 w-5 text-primary" /></div>
                    <h3 className="mb-2 text-lg font-semibold">{item.title}</h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">{item.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 md:py-24">
          <div className="container">
            <div className="mx-auto mb-12 max-w-2xl text-center">
              <p className="mb-3 text-sm font-semibold text-primary">{isAr ? "مرتكزات أساسية" : "Core capabilities"}</p>
              <h2 className="text-3xl font-bold tracking-tight md:text-4xl">{isAr ? "بيانات أوضح ومطابقة أكثر فائدة" : "Clearer data and more useful matching"}</h2>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              {keyBenefits.map((benefit) => (
                <Card key={benefit.title} className="group border-border/70 transition-all hover:-translate-y-0.5 hover:border-primary/35 hover:shadow-lg hover:shadow-primary/5">
                  <CardContent className="p-7 md:p-8">
                    <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 transition-colors group-hover:bg-primary/15"><benefit.icon className="h-6 w-6 text-primary" /></div>
                    <h3 className="mb-3 text-2xl font-semibold">{benefit.title}</h3>
                    <p className="leading-relaxed text-muted-foreground">{benefit.detail}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="border-y border-border/50 bg-secondary/35 py-20 md:py-24">
          <div className="container">
            <div className="mx-auto mb-12 max-w-2xl text-center">
              <p className="mb-3 text-sm font-semibold text-primary">{isAr ? "لمن صُممت؟" : "Who is it for?"}</p>
              <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl">{isAr ? "جهات صحية وصيدلانية تتشارك رؤية السوق" : "Health and pharmaceutical entities sharing market visibility"}</h2>
              <p className="text-muted-foreground">{isAr ? "تستخدم الجهات المعتمدة المنصة بحسب دورها، مع حماية بيانات الأطراف واحترام مسؤولية كل جهة." : "Verified entities use the platform according to their role, with privacy safeguards and respect for each entity’s responsibility."}</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {entityCards.map((entity) => (
                <Card key={entity.title} className="border-border/70 bg-background/80">
                  <CardContent className="p-6">
                    <entity.icon className="mb-4 h-7 w-7 text-primary" />
                    <h3 className="mb-2 text-lg font-semibold">{entity.title}</h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">{entity.detail}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 md:py-24" aria-labelledby="faq-title">
          <div className="container grid gap-10 lg:grid-cols-[0.7fr_1.3fr]">
            <div>
              <p className="mb-3 text-sm font-semibold text-primary">{isAr ? "أسئلة شائعة" : "Frequently asked questions"}</p>
              <h2 id="faq-title" className="mb-4 text-3xl font-bold tracking-tight md:text-4xl">{isAr ? "إجابات واضحة قبل أن تبدأ" : "Clear answers before you begin"}</h2>
              <p className="leading-relaxed text-muted-foreground">{isAr ? "نوضح حدود المنصة وطريقة المطابقة والدخول الآمن حتى تبدأ الجهة من معلومات صحيحة." : "We clarify platform boundaries, matching, and secure access so each entity starts with the right information."}</p>
            </div>
            <Accordion type="single" collapsible className="rounded-2xl border border-border/70 bg-card px-6">
              {faqs.map((item, index) => (
                <AccordionItem key={item.q} value={`faq-${index}`}>
                  <AccordionTrigger className="text-start text-base">{item.q}</AccordionTrigger>
                  <AccordionContent className="leading-relaxed text-muted-foreground">{item.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        <section className="py-20">
          <div className="container">
            <div className="rounded-3xl border border-primary/15 bg-gradient-to-br from-primary/[0.09] via-card to-background p-8 text-center md:p-12">
              <p className="mb-3 text-sm font-semibold text-primary">{isAr ? "ابدأ من المعلومة الصحيحة" : "Start with the right information"}</p>
              <h2 className="mx-auto mb-4 max-w-3xl text-3xl font-bold tracking-tight md:text-4xl">{isAr ? "هل تمثل جهة صحية أو صيدلانية في اليمن؟" : "Do you represent a health or pharmaceutical entity in Yemen?"}</h2>
              <p className="mx-auto mb-7 max-w-2xl leading-relaxed text-muted-foreground">{isAr ? "تعرّف على حدود المنصة وأدوار الجهات والأسئلة الشائعة، ثم انتقل إلى لوحة التحكم لتسجيل جهتك أو استخدام خدماتك المتاحة." : "Explore the platform boundaries, entity roles, and frequently asked questions, then open the dashboard to register your entity or access available services."}</p>
              <div className="flex flex-col justify-center gap-3 sm:flex-row">
                <Link href="/about"><Button variant="outline" size="lg">{t("Learn More")}</Button></Link>
                <Link href="/dashboard"><Button size="lg">{t("Go to Dashboard")}<ArrowRight className="ms-2 h-4 w-4" /></Button></Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border/50 py-12">
        <div className="container text-center">
          <div className="mb-4 flex items-center justify-center"><BrandLockup /></div>
          <p className="text-sm text-muted-foreground">{t("Yemen Pharmaceutical Market Intelligence Platform")}</p>
          <p className="mt-2 text-xs text-muted-foreground/60">{t("Connecting supply and demand across Yemen's pharmaceutical market")}</p>
        </div>
      </footer>
    </div>
  );
}
