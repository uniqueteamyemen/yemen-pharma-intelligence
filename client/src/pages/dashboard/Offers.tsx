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
import { Textarea } from "@/components/ui/textarea";
import { Plus, Search } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import { buildMedicineEntryPayload } from "@shared/medicineEntry";

export default function OffersPage() {
  const { language, t } = useLanguage();
  const entity = trpc.entity.getByUserId.useQuery();
  const offers = trpc.offers.list.useQuery({ status: "active", limit: 50 });
  const drugs = trpc.drugs.search.useQuery({ query: "" }, { enabled: false });
  const utils = trpc.useUtils();
  const [drugInput, setDrugInput] = useState("");
  const [selectedDrugId, setSelectedDrugId] = useState<string>("");
  const [selectedDrugLabel, setSelectedDrugLabel] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("boxes");
  const [createOpen, setCreateOpen] = useState(false);

  const createOffer = trpc.offers.create.useMutation({
    onSuccess: () => {
      toast.success(t("Offer created successfully"));
      setCreateOpen(false);
      utils.offers.list.invalidate();
      // Reset form
      setSelectedDrugId("");
      setSelectedDrugLabel("");
      setDrugInput("");
      setQuantity("");
    },
    onError: (err) => toast.error(err.message || t("Unable to create offer")),
  });

  const closeOffer = trpc.offers.close.useMutation({
    onSuccess: () => {
      toast.success(t("Offer closed"));
      utils.offers.list.invalidate();
    },
  });

  const numericQuantity = Number(quantity);
  const isValidQuantity = Number.isInteger(numericQuantity) && numericQuantity >= 1;
  const canSubmit = Boolean(entity.data) && drugInput.trim().length > 0 && isValidQuantity && !createOffer.isPending;

  const handleSubmit = () => {
    if (!entity.data) return;
    if (!isValidQuantity) {
      toast.error(t("Quantity must be at least 1"));
      return;
    }
    const medicineEntry = buildMedicineEntryPayload(drugInput, selectedDrugId);
    if (!medicineEntry) return;
    createOffer.mutate({
      entityId: entity.data.id,
      ...medicineEntry,
      quantity: numericQuantity,
      unit,
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

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("Offers")}</h1>
          <p className="text-muted-foreground">{t("Supply offerings in the marketplace")}</p>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="me-2 h-4 w-4" /> {t("New Offer")}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{t("Create New Offer")}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>{language === "ar" ? "اسم الدواء" : "Medicine name"}</Label>
                <p className="text-xs text-muted-foreground">
                  {language === "ar" ? "اكتب الاسم العلمي أو التجاري، ثم اختر اقتراحاً مطابقاً إذا كان هو الدواء المقصود." : "Type a scientific or trade name, then select a suggestion only if it is the intended medicine."}
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
                {drugInput.trim().length >= 2 && !drugSearchResults.isLoading && (
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
                    min={1}
                    step={1}
                    inputMode="numeric"
                    placeholder={t("Quantity")}
                    value={quantity}
                    aria-invalid={quantity.length > 0 && !isValidQuantity}
                    onChange={(e) => setQuantity(e.target.value)}
                  />
                  {quantity.length > 0 && !isValidQuantity && (
                    <p className="text-xs text-destructive">{t("Quantity must be at least 1")}</p>
                  )}
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

              <Button
                className="w-full"
                onClick={handleSubmit}
                disabled={!canSubmit}
              >
                {t("Create Offer")}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("Active Offers")}</CardTitle>
        </CardHeader>
        <CardContent>
          {offers.isLoading ? (
            <p className="text-muted-foreground">{t("Loading...")}</p>
          ) : offers.isError ? (
            <div className="space-y-3 text-center">
              <p className="text-muted-foreground">{t("Unable to load offers. Please retry.")}</p>
              <Button variant="outline" size="sm" onClick={() => offers.refetch()}>
                {t("Retry")}
              </Button>
            </div>
          ) : !offers.data?.length ? (
            <p className="text-muted-foreground">{t("No active offers found")}</p>
          ) : (
            <div className="space-y-3">
              {offers.data.map((offer) => (
                <div key={offer.id} className="flex items-center justify-between rounded-lg border border-border/50 p-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">
                        {offer.isFreeText ? offer.freeTextName : `Drug #${offer.drugId}`}
                      </p>
                      {offer.isFreeText && (
                        <Badge variant="outline" className="text-xs">{t("Unlisted")}</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {offer.quantity} {offer.unit}
                      {offer.price && ` · ${offer.price} ${offer.currency}`}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {t("Expires")}: <span className="ltr-value">{new Date(offer.expiresAt).toLocaleDateString(language === "ar" ? "ar-YE" : "en-US")}</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={offer.status === "active" ? "default" : "secondary"}>
                      {offer.status}
                    </Badge>
                    {offer.status === "active" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => closeOffer.mutate({ id: offer.id })}
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
