import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp } from "lucide-react";

export default function IntelligencePage() {
  const signals = trpc.intelligence.signals.useQuery();

  const severityColors: Record<string, string> = {
    low: "secondary",
    medium: "default",
    high: "destructive",
    critical: "destructive",
  };

  const typeLabels: Record<string, string> = {
    shortage: "Shortage",
    surplus: "Surplus",
    invisible_inventory: "Hidden Inventory",
    price_anomaly: "Price Anomaly",
    trend_shift: "Trend Shift",
  };

  const statusLabels: Record<string, string> = {
    new: "New",
    acknowledged: "Acknowledged",
    dismissed: "Dismissed",
    resolved: "Resolved",
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Market Intelligence</h1>
        <p className="text-muted-foreground">Market signals and analysis</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Market Signals ({signals.data?.length ?? 0})</CardTitle>
        </CardHeader>
        <CardContent>
          {signals.isLoading ? (
            <p className="text-muted-foreground">Loading...</p>
          ) : !signals.data?.length ? (
            <div className="text-center py-8">
              <TrendingUp className="mx-auto mb-3 h-10 w-10 text-muted-foreground/40" />
              <p className="text-muted-foreground">No market signals yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {signals.data.map((signal) => (
                <div key={signal.id} className="flex items-center justify-between rounded-lg border border-border/50 p-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{typeLabels[signal.signalType] || signal.signalType}</p>
                      <Badge variant={severityColors[signal.severity] as any || "default"}>
                        {signal.severity}
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
                        Confidence: {signal.confidence}%
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">
                      {new Date(signal.createdAt).toLocaleDateString()}
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
