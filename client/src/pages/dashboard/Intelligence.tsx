import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export default function IntelligencePage() {
  const { language, t } = useLanguage();
  const signals = trpc.intelligence.signals.useQuery();

  const severityColors: Record<string, string> = {
    low: "secondary",
    medium: "default",
    high: "destructive",
    critical: "destructive",
  };

  const typeLabels: Record<string, string> = {
    shortage: t("Shortage"),
    surplus: t("Surplus"),
    invisible_inventory: t("Hidden Inventory"),
    price_anomaly: t("Price Anomaly"),
    trend_shift: t("Trend Shift"),
  };

  const statusLabels: Record<string, string> = {
    new: t("New"),
    acknowledged: t("Acknowledged"),
    dismissed: t("Dismissed"),
    resolved: t("Resolved"),
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t("Market Intelligence")}</h1>
        <p className="text-muted-foreground">{t("Market signals and analysis")}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("Market Signals") } (<span className="ltr-value">{signals.data?.length ?? 0}</span>)</CardTitle>
        </CardHeader>
        <CardContent>
          {signals.isLoading ? (
            <p className="text-muted-foreground">{t("Loading...")}</p>
          ) : !signals.data?.length ? (
            <div className="text-center py-8">
              <TrendingUp className="mx-auto mb-3 h-10 w-10 text-muted-foreground/40" />
              <p className="text-muted-foreground">{t("No market signals yet")}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {signals.data.map((signal) => (
                <div key={signal.id} className="flex items-center justify-between rounded-lg border border-border/50 p-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{typeLabels[signal.signalType] || signal.signalType}</p>
                      <Badge variant={severityColors[signal.severity] as any || "default"}>
                        {t(signal.severity, signal.severity)}
                      </Badge>
                      <Badge variant="outline">
                        {statusLabels[signal.status] || signal.status}
                      </Badge>
                    </div>
                    {signal.drugId && (
                      <p className="text-sm text-muted-foreground mt-1">Drug #{signal.drugId}</p>
                    )}
                    {signal.confidence !== null && signal.confidence !== undefined && (
                      <p className="text-xs text-muted-foreground">
                        {t("Confidence")}: <span className="ltr-value">{signal.confidence}%</span>
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">
                      <span className="ltr-value">{new Date(signal.createdAt).toLocaleDateString(language === "ar" ? "ar-YE" : "en-US")}</span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
