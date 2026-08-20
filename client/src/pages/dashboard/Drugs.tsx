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
import { therapeuticCategories, therapeuticCategoryLabel } from "@/lib/medicineCategories";
import { isTrackedTherapeuticSearchCategory } from "@shared/therapeuticSearchAnalytics";

export default function DrugsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState<string>("all");
  const { language, t } = useLanguage();

  const allDrugs = trpc.drugs.all.useQuery();
  const recordCategorySearch = trpc.intelligence.recordTherapeuticSearch.useMutation();

  const searchableDrugs = searchQuery.trim()
    ? rankMedicinesBySearch(allDrugs.data || [], searchQuery)
    : [];
  const categoryDrugs = (allDrugs.data || []).filter((drug) => category === "all" || drug.category === category);
  const filteredDrugs = searchQuery.trim() ? searchableDrugs.filter((drug) => category === "all" || drug.category === category) : categoryDrugs;
  const hasSearch = searchQuery.trim().length > 0;
  const hasFilter = category !== "all";

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
        <Select value={category} onValueChange={(value) => {
          setCategory(value);
          if (isTrackedTherapeuticSearchCategory(value)) recordCategorySearch.mutate({ category: value, context: "catalog" });
        }}>
          <SelectTrigger className="w-[200px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {therapeuticCategories.map((cat) => (
              <SelectItem key={cat.value} value={cat.value}>{therapeuticCategoryLabel(cat.value, language)}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {(hasSearch || hasFilter) && !allDrugs.isLoading && (
        <p className="text-sm text-muted-foreground" aria-live="polite">
          {filteredDrugs.length > 1
            ? (language === "ar" ? `تظهر ${filteredDrugs.length} خيارات ضمن ${therapeuticCategoryLabel(category, "ar")}. اختر الشكل والتركيز المناسبين.` : `${filteredDrugs.length} catalog options are shown within ${therapeuticCategoryLabel(category, "en")}. Choose the appropriate formulation and strength.`)
            : filteredDrugs.length === 0
              ? (language === "ar" ? "لم يُعثر على اسم قريب في البيانات الحالية." : "No close name was found in the current data.")
              : (language === "ar" ? "تم العثور على خيار قريب من الاسم المدخل." : "A close catalog option was found.")}
        </p>
      )}

      <Card>
        <CardHeader>
          <CardTitle>
            {hasSearch || hasFilter
              ? `${filteredDrugs.length} ${t("Medicines")}`
              : (language === "ar" ? "ابحث عن اسم الدواء" : "Search for a medicine name")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {allDrugs.isLoading ? (
            <p className="text-muted-foreground">{t("Loading...")}</p>
          ) : !hasSearch && !hasFilter ? (
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
                    <Badge variant="outline" className="text-xs">{therapeuticCategoryLabel(drug.category, language)}</Badge>
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
