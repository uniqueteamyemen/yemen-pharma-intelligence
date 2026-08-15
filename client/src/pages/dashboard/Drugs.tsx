import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Search, Pill } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { medicineMatchesQuery } from "@shared/medicineSearch";

export default function DrugsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState<string>("all");
  const { language, t } = useLanguage();

  const allDrugs = trpc.drugs.all.useQuery();

  const filteredDrugs = (allDrugs.data || []).filter((drug) => {
    const matchSearch = searchQuery === "" || medicineMatchesQuery(drug, searchQuery);
    const matchCategory = category === "all" || drug.category === category;
    return matchSearch && matchCategory;
  });

  const categories = [
    { value: "all", label: t("All Categories") },
    { value: "antibiotics", label: t("Antibiotics") },
    { value: "analgesics", label: t("Analgesics") },
    { value: "cardiovascular", label: t("Cardiovascular") },
    { value: "endocrine", label: t("Endocrine") },
    { value: "gastrointestinal", label: t("Gastrointestinal") },
    { value: "respiratory", label: t("Respiratory") },
    { value: "antifungal", label: t("Antifungal") },
    { value: "antiviral", label: t("Antiviral") },
    { value: "vitamins", label: t("Vitamins") },
    { value: "neurological", label: t("Neurological") },
    { value: "other", label: t("Other") },
  ];

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t("National Essential Medicines Catalog")}</h1>
        <p className="text-muted-foreground">{t("Unified national essential medicines catalog for Yemen")}</p>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
            <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={language === "ar" ? "ابحث بالعربية أو الإنجليزية أو بالتركيز..." : "Search in Arabic, English, or by strength..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="ps-9"
          />
        </div>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-[200px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{filteredDrugs.length} {t("Medicines") }</CardTitle>
        </CardHeader>
        <CardContent>
          {allDrugs.isLoading ? (
            <p className="text-muted-foreground">{t("Loading...")}</p>
          ) : (
            <div className="space-y-2">
              {filteredDrugs.map((drug) => (
                <div key={drug.id} className="flex items-center justify-between rounded-lg border border-border/50 p-3 hover:bg-accent/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                      <Pill className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">
                        <span className="ltr-value">{language === "ar" && drug.genericNameAr ? drug.genericNameAr : drug.genericName}</span>
                        {language === "ar" && drug.genericNameAr && <span className="ms-2 text-muted-foreground font-normal ltr-value">{drug.genericName}</span>}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        <span className="ltr-value">{[drug.strength, drug.dosageForm].filter(Boolean).join(" · ")}</span>
                      </p>
                      {drug.nemlCategory && (
                        <p className="mt-1 text-xs text-muted-foreground">{drug.nemlCategory}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-wrap justify-end gap-1.5">
                    <Badge variant="outline" className="text-xs capitalize">{t(drug.category, drug.category)}</Badge>
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
