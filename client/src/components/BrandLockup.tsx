import { useLanguage } from "@/contexts/LanguageContext";

const brandMarkUrl = "/manus-storage/pharmayemen-security-intelligence-mark_ae420d8f.png";

type BrandLockupProps = {
  compact?: boolean;
  className?: string;
};

export function BrandLockup({ compact = false, className = "" }: BrandLockupProps) {
  const { language } = useLanguage();
  const subtitle = language === "ar" ? "منصة الدواء اليمني" : "Yemen Pharma Intelligence";

  return (
    <div className={`brand-lockup ${compact ? "brand-lockup--compact" : ""} ${className}`.trim()}>
      <span className="brand-mark" aria-hidden="true">
        <img src={brandMarkUrl} alt="" />
      </span>
      <span className="brand-lockup__copy">
        <span className="brand-wordmark">Pharma<span>Yemen</span></span>
        {!compact && <span className="brand-subtitle">{subtitle}</span>}
      </span>
    </div>
  );
}
