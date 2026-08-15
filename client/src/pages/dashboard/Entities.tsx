import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";

export default function EntitiesPage() {
  const { t } = useLanguage();
  const queue = trpc.entity.verificationQueue.useQuery();
  const utils = trpc.useUtils();

  const verify = trpc.entity.verify.useMutation({
    onSuccess: () => {
      toast.success(t("Entity verified"));
      utils.entity.verificationQueue.invalidate();
    },
    onError: (err) => toast.error(err.message || t("Unable to update entity")),
  });

  const suspend = trpc.entity.verify.useMutation({
    onSuccess: () => {
      toast.success(t("Entity suspended"));
      utils.entity.verificationQueue.invalidate();
    },
  });

  const typeLabels: Record<string, string> = {
    pharmacy: t("Pharmacy"),
    hospital: t("Hospital"),
    distributor: t("Distributor"),
    clinic: t("Clinic"),
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t("Entity Verification")}</h1>
        <p className="text-muted-foreground">{t("Review and approve entity registrations")}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("Pending Verification")} (<span className="ltr-value">{queue.data?.length ?? 0}</span>)</CardTitle>
        </CardHeader>
        <CardContent>
          {queue.isLoading ? (
            <p className="text-muted-foreground">{t("Loading...")}</p>
          ) : !queue.data?.length ? (
            <p className="text-muted-foreground">{t("No pending entities")}</p>
          ) : (
            <div className="space-y-3">
              {queue.data.map((entity) => (
                <div key={entity.id} className="flex items-center justify-between rounded-lg border border-border/50 p-4">
                  <div>
                    <p className="font-medium">{entity.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {typeLabels[entity.type]} · <span className="ltr-value">{entity.phone || t("No phone")}</span> · {entity.address || t("No address")}
                    </p>
                    {entity.licenseNumber && (
                      <p className="text-xs text-muted-foreground">
                        {t("License")}: <span className="ltr-value">{entity.licenseNumber}</span>
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => verify.mutate({ id: entity.id, status: "verified" })}
                    >
                      <Check className="me-1 h-4 w-4" /> {t("Approve")}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => suspend.mutate({ id: entity.id, status: "suspended" })}
                    >
                      <X className="me-1 h-4 w-4" /> {t("Suspend")}
                    </Button>
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
