import { ArrowRight, ShieldCheck } from "lucide-react";
import { startLogin } from "@/const";
import { useLanguage } from "@/contexts/LanguageContext";
import { BrandLockup } from "./BrandLockup";
import { CompactBrandIcon } from "./CompactBrandIcon";
import { Button } from "./ui/button";

export function AuthAccessPanel() {
  const { language } = useLanguage();
  const isAr = language === "ar";

  const copy = isAr
    ? {
        eyebrow: "وصول آمن للجهات المعتمدة",
        title: "تابع إلى منظومة الدواء اليمني",
        body: "سجّل الدخول بحسابك الآمن. بعد الدخول يمكنك تسجيل جهتك ومتابعة العروض والطلبات والمطابقات وفق صلاحياتها.",
        action: "المتابعة إلى تسجيل الدخول",
        note: "لا نطلب كلمة مرور داخل المنصة ولا نعالج أي مدفوعات.",
      }
    : {
        eyebrow: "Secure access for verified entities",
        title: "Continue to Yemen's pharmaceutical network",
        body: "Sign in with your secure account. After access, register your entity and work with offers, requests, and matches according to its permissions.",
        action: "Continue to sign in",
        note: "The platform never collects passwords directly or processes payments.",
      };

  return (
    <main className="auth-access-page" dir={isAr ? "rtl" : "ltr"}>
      <section className="auth-access-card" aria-labelledby="auth-access-title">
        <div className="auth-access-card__intro">
          <BrandLockup className="auth-access-card__brand" />
          <div className="auth-access-card__signal">
            <CompactBrandIcon size="lg" />
            <span>{copy.eyebrow}</span>
          </div>
          <h1 id="auth-access-title">{copy.title}</h1>
          <p>{copy.body}</p>
        </div>
        <div className="auth-access-card__action">
          <div className="auth-access-card__assurance">
            <ShieldCheck aria-hidden="true" />
            <span>{copy.note}</span>
          </div>
          <Button onClick={() => startLogin()} size="lg" className="auth-access-card__button">
            {copy.action}
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>
      </section>
    </main>
  );
}
