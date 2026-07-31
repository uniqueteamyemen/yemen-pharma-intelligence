import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X } from "lucide-react";
import { toast } from "sonner";

export default function EntitiesPage() {
  const queue = trpc.entity.verificationQueue.useQuery();
  const utils = trpc.useUtils();

  const verify = trpc.entity.verify.useMutation({
    onSuccess: () => {
      toast.success("Entity verified");
      utils.entity.verificationQueue.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const suspend = trpc.entity.verify.useMutation({
    onSuccess: () => {
      toast.success("Entity suspended");
      utils.entity.verificationQueue.invalidate();
    },
  });

  const typeLabels: Record<string, string> = {
    pharmacy: "Pharmacy",
    hospital: "Hospital",
    distributor: "Distributor",
    clinic: "Clinic",
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Entity Verification</h1>
        <p className="text-muted-foreground">Review and approve entity registrations</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pending Verification ({queue.data?.length ?? 0})</CardTitle>
        </CardHeader>
        <CardContent>
          {queue.isLoading ? (
            <p className="text-muted-foreground">Loading...</p>
          ) : !queue.data?.length ? (
            <p className="text-muted-foreground">No pending entities</p>
          ) : (
            <div className="space-y-3">
              {queue.data.map((entity) => (
                <div key={entity.id} className="flex items-center justify-between rounded-lg border border-border/50 p-4">
                  <div>
                    <p className="font-medium">{entity.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {typeLabels[entity.type]} · {entity.phone || "No phone"} · {entity.address || "No address"}
                    </p>
                    {entity.licenseNumber && (
                      <p className="text-xs text-muted-foreground">
                        License: {entity.licenseNumber}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => verify.mutate({ id: entity.id, status: "verified" })}
                    >
                      <Check className="mr-1 h-4 w-4" /> Approve
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => suspend.mutate({ id: entity.id, status: "suspended" })}
                    >
                      <X className="mr-1 h-4 w-4" /> Suspend
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
