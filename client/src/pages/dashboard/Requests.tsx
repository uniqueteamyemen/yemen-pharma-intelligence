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
import { Loader2, Plus } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import { buildMedicineEntryPayload } from "@shared/medicineEntry";

export default function RequestsPage() {
  const { language, t } = useLanguage();
  const entity = trpc.entity.getByUserId.useQuery();
  const requests = trpc.requests.list.useQuery({ status: "open", limit: 50 });
  const utils = trpc.useUtils();
  const [drugInput, setDrugInput] = useState("");
  const [selectedDrugId, setSelectedDrugId] = useState<string>("");
  const [selectedDrugLabel, setSelectedDrugLabel] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("boxes");
  const [urgency, setUrgency] = useState<string>("medium");
  const [createOpen, setCreateOpen] = useState(false);

  const createRequest = trpc.requests.create.useMutation({
    onSuccess: (_, variables) => {
      toast.success(variables.isFreeText
        ? (language === "ar" ? "تم حفظ اسم الدواء كنص حر لأنك لم تختر اقتراحاً من القائمة." : "The medicine name was saved as free text because no suggestion was selected.")
        : t("Request created successfully"));
      setCreateOpen(false);
      utils.requests.list.invalidate();
      setSelectedDrugId("");
      setSelectedDrugLabel("");
      setDrugInput("");
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
    const medicineEntry = buildMedicineEntryPayload(drugInput, selectedDrugId);
    if (!medicineEntry) return;
    createRequest.mutate({
      entityId: entity.data.id,
      ...medicineEntry,
      quantity: parseInt(quantity) || 1,
      unit,
      urgency: urgency as any,
    });
  };

  const recognitionQuery = drugInput;
  const drugSearchResults = trpc.drugs.search.useQuery(
    { query: recognitionQuery },
    { enabled: recognitionQuery.trim().length >= 2 }
  );
  const selectCatalogSuggestion = (drug: { id: number; brandName?: string | null; genericName?: string | null; genericNameAr?: string | null; strength?: string | null }) => {
    const name = language === "ar" && drug.genericNameAr ? drug.genericNameAr : (drug.brandName || drug.genericName || "");
    const label = [name, drug.strength].filter(Boolean).join(" · ");
    setSelectedDrugId(String(drug.id));
    setSelectedDrugLabel(label);
    setDrugInput(label);
  };

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
              <div className="space-y-2">
                <Label>{language === "ar" ? "اسم الدواء" : "Medicine name"}</Label>
                <p className="text-xs text-muted-foreground">
                  {language === "ar" ? "اكتب الاسم العلمي أو التجاري، ثم اختر اقتراحاً مطابقاً إذا كان هو الدواء المقصود." : "Type a scientific or trade name, then select a suggestion only if it is the intended medicine."}
                </p>
                <p className="text-xs text-muted-foreground">
                  {language === "ar" ? "الاقتراحات تساعد على التعرّف فقط ولا تعني أن الدواء متوفر لدى المنصة." : "Suggestions support identification only; they do not indicate platform availability."}
                </p>
                <Input
                  placeholder={language === "ar" ? "مثال: Paradol أو Paracetamol 500" : "Example: Paradol or Paracetamol 500"}
                  value={drugInput}
                  onChange={(e) => {
                    setDrugInput(e.target.value);
                    setSelectedDrugId("");
                    setSelectedDrugLabel("");
                  }}
                />
                {drugInput.trim().length >= 2 && drugSearchResults.isFetching && (
                  <div className="flex items-center gap-2 rounded border border-border bg-muted/20 p-2 text-xs text-muted-foreground" role="status">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    {language === "ar" ? "جارٍ جلب الاقتراحات…" : "Loading suggestions…"}
                  </div>
                )}
                {drugInput.trim().length >= 2 && !drugSearchResults.isFetching && (
                  <div className="rounded border border-border bg-muted/20 p-2">
                    {drugSearchResults.data && drugSearchResults.data.length > 0 ? (
                      <div className="max-h-32 space-y-1 overflow-y-auto">
                        {drugSearchResults.data.map((drug) => (
                          <button
                            key={drug.id}
                            className="w-full rounded px-2 py-1.5 text-start text-sm hover:bg-accent"
                            onClick={() => selectCatalogSuggestion(drug)}
                          >
                            {drug.brandName} ({language === "ar" && drug.genericNameAr ? drug.genericNameAr : drug.genericName}) - {drug.strength}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground">
                        {language === "ar" ? "لا توجد مطابقة قريبة؛ يمكنك إرسال الاسم كما كتبته." : "No close match was found; you may submit the name as entered."}
                      </p>
                    )}
                  </div>
                )}
                {selectedDrugId && (
                  <p className="text-xs text-muted-foreground">
                    {language === "ar" ? `تم اختيار مرجع الاسم: ${selectedDrugLabel}. هذا لا يعني توفر الدواء لدى المنصة.` : `Selected name reference: ${selectedDrugLabel}. This does not indicate platform availability.`}
                  </p>
                )}
              </div>

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
                disabled={!entity.data || !drugInput.trim() || !quantity}
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
