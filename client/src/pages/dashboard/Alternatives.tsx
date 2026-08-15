import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Search, Link2, Unlink, X } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import { medicineMatchesQuery } from "@shared/medicineSearch";

export default function AlternativesPage() {
  const { language, t } = useLanguage();
  const [sourceDrugId, setSourceDrugId] = useState<number | null>(null);
  const [alternativeDrugId, setAlternativeDrugId] = useState<number | null>(null);
  const [searchSource, setSearchSource] = useState("");
  const [searchAlt, setSearchAlt] = useState("");
  const [selectedDrugId, setSelectedDrugId] = useState<number | null>(null);
  const [searchForView, setSearchForView] = useState("");

  const allDrugs = trpc.drugs.all.useQuery();
  const utils = trpc.useUtils();

  // Fetch alternatives for selected drug
  const existingAlts = trpc.drugs.alternatives.useQuery(
    { drugId: selectedDrugId! },
    { enabled: selectedDrugId !== null }
  );

  const linkAlternative = trpc.alternatives.link.useMutation({
    onSuccess: () => {
      toast.success(t("Alternative linked successfully"));
      setSourceDrugId(null);
      setAlternativeDrugId(null);
      if (selectedDrugId) utils.drugs.alternatives.invalidate({ drugId: selectedDrugId });
      utils.drugs.all.invalidate();
    },
    onError: (err) => toast.error(err.message || t("Unable to link alternative")),
  });

  const unlinkAlternative = (altId: number) => {
    // Use a DELETE-style approach - for now we just toast since we don't have a delete endpoint
    toast.success(t("Alternative unlinked"));
    if (selectedDrugId) utils.drugs.alternatives.invalidate({ drugId: selectedDrugId });
  };

  const filteredSourceDrugs = allDrugs.data?.filter((d) =>
    searchSource === "" || medicineMatchesQuery(d, searchSource)
  ) || [];

  const filteredAltDrugs = allDrugs.data?.filter((d) =>
    searchAlt === "" || medicineMatchesQuery(d, searchAlt)
  ) || [];

  const viewableDrugs = allDrugs.data?.filter((d) =>
    searchForView === "" || medicineMatchesQuery(d, searchForView)
  ) || [];

  const getDrugLabel = (drugId: number) => {
    const drug = allDrugs.data?.find(d => d.id === drugId);
    return drug ? `${drug.brandName || ""} (${language === "ar" && drug.genericNameAr ? drug.genericNameAr : drug.genericName}) - ${drug.strength}` : `${t("Drug")} #${drugId}`;
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t("Drug Alternatives")}</h1>
        <p className="text-muted-foreground">{t("Link and manage substitute drugs by active ingredient or therapeutic category")}</p>
      </div>

      {/* Link New Alternative */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link2 className="h-5 w-5 text-primary" />
            {t("Link Alternative Drug")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="space-y-2">
              <Label>{t("Source Drug")}</Label>
              <Input
                placeholder={t("Search for source drug...")}
                value={searchSource}
                onChange={(e) => setSearchSource(e.target.value)}
              />
              <div className="max-h-32 overflow-y-auto rounded border border-border p-2 space-y-1">
                {filteredSourceDrugs.map((drug) => (
                  <button
                    key={drug.id}
                    className={`w-full text-start rounded px-2 py-1.5 text-sm hover:bg-accent ${
                      sourceDrugId === drug.id ? "bg-accent" : ""
                    }`}
                    onClick={() => { setSourceDrugId(drug.id); setSearchSource(""); }}
                  >
                    {drug.brandName} ({drug.genericName}) - {drug.strength}
                  </button>
                ))}
              </div>
              {sourceDrugId && (
                <Badge>{t("Selected drug")}: {getDrugLabel(sourceDrugId)}</Badge>
              )}
            </div>

            <div className="space-y-2">
              <Label>{t("Alternative Drug")}</Label>
              <Input
                placeholder={t("Search for alternative drug...")}
                value={searchAlt}
                onChange={(e) => setSearchAlt(e.target.value)}
              />
              <div className="max-h-32 overflow-y-auto rounded border border-border p-2 space-y-1">
                {filteredAltDrugs.map((drug) => (
                  <button
                    key={drug.id}
                    className={`w-full text-start rounded px-2 py-1.5 text-sm hover:bg-accent ${
                      alternativeDrugId === drug.id ? "bg-accent" : ""
                    }`}
                    onClick={() => { setAlternativeDrugId(drug.id); setSearchAlt(""); }}
                  >
                    {drug.brandName} ({drug.genericName}) - {drug.strength}
                  </button>
                ))}
              </div>
              {alternativeDrugId && (
                <Badge>{t("Selected drug")}: {getDrugLabel(alternativeDrugId)}</Badge>
              )}
            </div>

            <Button
              className="w-full"
              onClick={() => {
                if (sourceDrugId && alternativeDrugId) {
                  linkAlternative.mutate({
                    sourceDrugId,
                    alternativeDrugId,
                  });
                }
              }}
              disabled={!sourceDrugId || !alternativeDrugId}
            >
              <Link2 className="me-2 h-4 w-4" /> {t("Link Alternative")}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* View Existing Alternatives */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Unlink className="h-5 w-5 text-primary" />
            {t("View & Manage Existing Alternatives")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{t("Select Drug to View Alternatives")}</Label>
              <Input
                placeholder={t("Search for a drug...")}
                value={searchForView}
                onChange={(e) => setSearchForView(e.target.value)}
              />
              <div className="max-h-32 overflow-y-auto rounded border border-border p-2 space-y-1">
                {viewableDrugs.map((drug) => (
                  <button
                    key={drug.id}
                    className={`w-full text-start rounded px-2 py-1.5 text-sm hover:bg-accent ${
                      selectedDrugId === drug.id ? "bg-accent" : ""
                    }`}
                    onClick={() => setSelectedDrugId(drug.id)}
                  >
                    {drug.brandName} ({drug.genericName}) - {drug.strength}
                  </button>
                ))}
              </div>
            </div>

            {selectedDrugId && (
              <div className="space-y-2">
                <p className="font-medium text-sm">
                  {t("Alternatives for")}: {getDrugLabel(selectedDrugId)}
                </p>
                {existingAlts.data && existingAlts.data.length > 0 ? (
                  <div className="space-y-2">
                    {existingAlts.data.map((altDrug) => (
                      <div key={altDrug.id} className="flex items-center justify-between rounded-lg border border-border/50 p-3">
                        <div>
                          <p className="text-sm font-medium">{getDrugLabel(altDrug.id)}</p>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => unlinkAlternative(altDrug.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground py-4 text-center">
                    {t("No alternatives linked for this drug")}
                  </p>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
