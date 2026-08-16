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
import { rankMedicinesBySearch } from "@shared/medicineSearch";

export default function DrugsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState<string>("all");
  const { language, t } = useLanguage();

  const allDrugs = trpc.drugs.all.useQuery();

  const searchableDrugs = searchQuery.trim()
    ? rankMedicinesBySearch(allDrugs.data || [], searchQuery)
    : [];
  const filteredDrugs = searchableDrugs.filter((drug) => category === "all" || drug.category === category);
  const hasSearch = searchQuery.trim().length > 0;

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
            placeholder={language === "ar" ? "ابحث بالاسم العلمي أو التجاري أو بالتركيز…" : "Search by scientific name, trade name, or strength…"}
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

      {hasSearch && !allDrugs.isLoading && (
        <p className="text-sm text-muted-foreground" aria-live="polite">
          {filteredDrugs.length > 1
            ? (language === "ar" ? "هذه خيارات متقاربة من الكتالوج؛ اختر الشكل والتركيز المناسبين." : "These are close catalog options; choose the appropriate formulation and strength.")
            : filteredDrugs.length === 0
              ? (language === "ar" ? "لم يُعثر على اسم قريب في البيانات الحالية." : "No close name was found in the current data.")
              : (language === "ar" ? "تم العثور على خيار قريب من الاسم المدخل." : "A close catalog option was found.")}
        </p>
      )}

      <Card>
        <CardHeader>
          <CardTitle>
            {hasSearch
              ? `${filteredDrugs.length} ${t("Medicines")}`
              : (language === "ar" ? "ابحث عن اسم الدواء" : "Search for a medicine name")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {allDrugs.isLoading ? (
            <p className="text-muted-foreground">{t("Loading...")}</p>
          ) : !hasSearch ? (
            <p className="text-sm text-muted-foreground">
              {language === "ar"
                ? "تُستخدم القائمة الدوائية داخلياً للتعرّف. اكتب اسماً علمياً أو تجارياً أو تركيزاً لرؤية الاقتراحات المناسبة فقط."
                : "The medicine list is used internally for recognition. Enter a scientific name, trade name, or strength to see only relevant suggestions."}
            </p>
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
                      {drug.manufacturer && (
                        <p className="text-xs font-medium text-primary mt-0.5">{drug.manufacturer}</p>
                      )}
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
