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

export default function OffersPage() {
  const { language, t } = useLanguage();
  const entity = trpc.entity.getByUserId.useQuery();
  const offers = trpc.offers.list.useQuery({ status: "active", limit: 50 });
  const drugs = trpc.drugs.search.useQuery({ query: "" }, { enabled: false });
  const utils = trpc.useUtils();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDrugId, setSelectedDrugId] = useState<string>("");
  const [isFreeText, setIsFreeText] = useState(false);
  const [freeTextName, setFreeTextName] = useState("");
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
      setFreeTextName("");
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
  const canSubmit = Boolean(entity.data) && (isFreeText ? freeTextName.trim().length > 0 : Boolean(selectedDrugId)) && isValidQuantity && !createOffer.isPending;

  const handleSubmit = () => {
    if (!entity.data) return;
    if (!isValidQuantity) {
      toast.error(t("Quantity must be at least 1"));
      return;
    }
    const drugId = isFreeText ? undefined : (selectedDrugId ? parseInt(selectedDrugId, 10) : undefined);
    createOffer.mutate({
      entityId: entity.data.id,
      drugId,
      isFreeText,
      freeTextName: isFreeText ? freeTextName.trim() : undefined,
      quantity: numericQuantity,
      unit,
    });
  };

  const drugSearchResults = trpc.drugs.search.useQuery(
    { query: searchQuery },
    { enabled: !isFreeText && searchQuery.length >= 1 }
  );

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
                          {drug.brandName} ({language === "ar" && drug.genericNameAr ? drug.genericNameAr : drug.genericName}) - {drug.strength}
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
                    placeholder={t("Enter drug name (will not be added to official catalog)")}
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
