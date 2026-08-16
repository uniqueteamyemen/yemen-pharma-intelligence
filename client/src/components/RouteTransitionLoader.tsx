import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";
import { CompactBrandIcon } from "./CompactBrandIcon";

export function RouteTransitionLoader() {
  const [location] = useLocation();
  const { language } = useLanguage();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
    const timer = window.setTimeout(() => setVisible(false), 260);
    return () => window.clearTimeout(timer);
  }, [location]);

  return (
    <div className={`route-transition-loader ${visible ? "route-transition-loader--visible" : ""}`} aria-hidden={!visible}>
      <div className="route-transition-loader__content" role="status" aria-live="polite">
        <CompactBrandIcon size="md" />
        <span>{language === "ar" ? "جارٍ تحضير الصفحة" : "Preparing page"}</span>
      </div>
    </div>
  );
}
