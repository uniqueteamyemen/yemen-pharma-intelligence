import { Languages } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";

export function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const { language, setLanguage } = useLanguage();
  const nextLanguage = language === "ar" ? "en" : "ar";

  return (
    <Button
      type="button"
      variant="outline"
      size={compact ? "sm" : "default"}
      onClick={() => setLanguage(nextLanguage)}
      aria-label={language === "ar" ? "التبديل إلى الإنجليزية" : "Switch to Arabic"}
      className="gap-2"
    >
      <Languages className="h-4 w-4" />
      <span>{language === "ar" ? "English" : "العربية"}</span>
    </Button>
  );
}
