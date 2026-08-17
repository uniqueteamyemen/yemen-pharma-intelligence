import { AlertCircle, ArrowRight, Loader2, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { startLogin } from "@/const";
import { useLanguage } from "@/contexts/LanguageContext";
import { BrandLockup } from "./BrandLockup";
import { CompactBrandIcon } from "./CompactBrandIcon";
import { Button } from "./ui/button";

export function AuthAccessPanel() {
  const { language } = useLanguage();
  const isAr = language === "ar";
  const [loginState, setLoginState] = useState<"idle" | "redirecting" | "error">("idle");

  const copy = isAr
    ? {
        eyebrow: "وصول آمن للجهات المعتمدة",
        title: "تابع إلى منظومة الدواء اليمني",
        body: "سجّل الدخول بحسابك الآمن. بعد الدخول يمكنك تسجيل جهتك ومتابعة العروض والطلبات والمطابقات وفق صلاحياتها.",
        action: "المتابعة إلى تسجيل الدخول",
        note: "لا نطلب كلمة مرور داخل المنصة ولا نعالج أي مدفوعات.",
        loading: "جارٍ تحويلك إلى صفحة الدخول الآمن… إذا لم تفتح الصفحة خلال ثوانٍ، أعد المحاولة.",
        error: "تعذّر بدء تسجيل الدخول. حدّث الصفحة وتأكد من السماح بملفات تعريف الارتباط، ثم أعد المحاولة.",
      }
    : {
        eyebrow: "Secure access for verified entities",
        title: "Continue to Yemen's pharmaceutical network",
        body: "Sign in with your secure account. After access, register your entity and work with offers, requests, and matches according to its permissions.",
        action: "Continue to sign in",
        note: "The platform never collects passwords directly or processes payments.",
        loading: "Taking you to secure sign-in… If the page does not open shortly, please try again.",
        error: "We could not start sign-in. Refresh the page, allow cookies, then try again.",
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
          {loginState !== "idle" && <p className={loginState === "error" ? "auth-access-card__error" : "auth-access-card__status"} role={loginState === "error" ? "alert" : "status"}>{loginState === "error" ? <AlertCircle aria-hidden="true" /> : <Loader2 className="animate-spin" aria-hidden="true" />}<span>{loginState === "error" ? copy.error : copy.loading}</span></p>}
          <Button onClick={() => { try { setLoginState("redirecting"); startLogin(); } catch { setLoginState("error"); } }} size="lg" className="auth-access-card__button" disabled={loginState === "redirecting"}>
            {copy.action}
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>
      </section>
    </main>
  );
}
