import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";

export default function RequestsPage() {
  const { language, t } = useLanguage();
  const entity = trpc.entity.getByUserId.useQuery();
  const requests = trpc.requests.list.useQuery({ status: "open", limit: 50 });
  const utils = trpc.useUtils();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDrugId, setSelectedDrugId] = useState<string>("");
  const [isFreeText, setIsFreeText] = useState(false);
  const [freeTextName, setFreeTextName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("boxes");
  const [urgency, setUrgency] = useState<string>("medium");
  const [createOpen, setCreateOpen] = useState(false);

  const createRequest = trpc.requests.create.useMutation({
    onSuccess: () => {
      toast.success(t("Request created successfully"));
      setCreateOpen(false);
      utils.requests.list.invalidate();
      setSelectedDrugId("");
      setFreeTextName("");
      setQuantity("");
    },
    onError: (err) => toast.error(err.message || t("Unable to create request")),
  });

  const closeRequest = trpc.requests.close.useMutation({
    onSuccess: () => {
      toast.success(t("Request closed"));
      utils.requests.list.invalidate();
    },
  });

  const handleSubmit = () => {
    if (!entity.data) return;
    const drugId = isFreeText ? undefined : (selectedDrugId ? parseInt(selectedDrugId) : undefined);
    createRequest.mutate({
      entityId: entity.data.id,
      drugId,
      isFreeText,
      freeTextName: isFreeText ? freeTextName : undefined,
      quantity: parseInt(quantity) || 1,
      unit,
      urgency: urgency as any,
    });
  };

  const drugSearchResults = trpc.drugs.search.useQuery(
    { query: searchQuery },
    { enabled: !isFreeText && searchQuery.length >= 1 }
  );

  const urgencyColors: Record<string, string> = {
    low: "secondary",
    medium: "default",
    high: "destructive",
    critical: "destructive",
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("Requests")}</h1>
          <p className="text-muted-foreground">{t("Demand requests in the marketplace")}</p>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="me-2 h-4 w-4" /> {t("New Request")}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{t("Create New Request")}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex gap-4">
                <Button
                  variant={isFreeText ? "outline" : "default"}
                  size="sm"
                  onClick={() => setIsFreeText(false)}
                >
                  {t("Official Catalog")}
                </Button>
                <Button
                  variant={isFreeText ? "default" : "outline"}
                  size="sm"
                  onClick={() => setIsFreeText(true)}
                >
                  {t("Free Text")}
                </Button>
              </div>

              {!isFreeText ? (
                <div className="space-y-2">
                  <Label>{t("Select Drug")}</Label>
                  <Input
                    placeholder={t("Search drugs...")}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  {drugSearchResults.data && drugSearchResults.data.length > 0 && (
                    <div className="max-h-32 overflow-y-auto rounded border border-border p-2 space-y-1">
                      {drugSearchResults.data.map((drug) => (
                        <button
                          key={drug.id}
                          className={`w-full text-start rounded px-2 py-1.5 text-sm hover:bg-accent ${
                            selectedDrugId === String(drug.id) ? "bg-accent" : ""
                          }`}
                          onClick={() => {
                            setSelectedDrugId(String(drug.id));
                            setSearchQuery("");
                          }}
                        >
                          {drug.brandName} ({drug.genericName}) - {drug.strength}
                        </button>
                      ))}
                    </div>
                  )}
                  {selectedDrugId && (
                    <p className="text-xs text-muted-foreground">
                      {t("Selected drug")}: <span className="ltr-value">#{selectedDrugId}</span>
                    </p>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  <Label>{t("Drug Name")}</Label>
                  <Input
                    placeholder={t("Enter drug name (will not be added to official catalog")}
                    value={freeTextName}
                    onChange={(e) => setFreeTextName(e.target.value)}
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t("Quantity")}</Label>
                  <Input
                    type="number"
                    placeholder={t("Quantity")}
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t("Unit")}</Label>
                  <Select value={unit} onValueChange={setUnit}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="boxes">{t("Boxes")}</SelectItem>
                      <SelectItem value="strips">{t("Strips")}</SelectItem>
                      <SelectItem value="vials">{t("Vials")}</SelectItem>
                      <SelectItem value="bottles">{t("Bottles")}</SelectItem>
                      <SelectItem value="ampoules">{t("Ampoules")}</SelectItem>
                      <SelectItem value="packs">{t("Packs")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>{t("Urgency")}</Label>
                <Select value={urgency} onValueChange={setUrgency}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">{t("Low")}</SelectItem>
                    <SelectItem value="medium">{t("Medium")}</SelectItem>
                    <SelectItem value="high">{t("High")}</SelectItem>
                    <SelectItem value="critical">{t("Critical")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                className="w-full"
                onClick={handleSubmit}
                disabled={!entity.data || (isFreeText ? !freeTextName : !selectedDrugId) || !quantity}
              >
                {t("Create Request")}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("Open Requests")}</CardTitle>
        </CardHeader>
        <CardContent>
          {requests.isLoading ? (
            <p className="text-muted-foreground">{t("Loading...")}</p>
          ) : !requests.data?.length ? (
            <p className="text-muted-foreground">{t("No open requests found")}</p>
          ) : (
            <div className="space-y-3">
              {requests.data.map((req) => (
                <div key={req.id} className="flex items-center justify-between rounded-lg border border-border/50 p-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">
                        {req.isFreeText ? req.freeTextName : `Drug #${req.drugId}`}
                      </p>
                      {req.isFreeText && (
                        <Badge variant="outline" className="text-xs">{t("Unlisted")}</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      <span className="ltr-value">{req.quantity}</span> {t(req.unit, req.unit)} · {t(req.urgency, req.urgency)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {t("Expires")}: <span className="ltr-value">{new Date(req.expiresAt).toLocaleDateString(language === "ar" ? "ar-YE" : "en-US")}</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={urgencyColors[req.urgency] as any || "default"}>
                      {t(req.urgency, req.urgency)}
                    </Badge>
                    {req.status === "open" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => closeRequest.mutate({ id: req.id })}
                      >
                        {t("Close")}
                      </Button>
                    )}
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
