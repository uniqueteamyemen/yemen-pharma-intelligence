import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Search, Pill } from "lucide-react";

export default function DrugsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState<string>("all");

  const allDrugs = trpc.drugs.all.useQuery();

  const filteredDrugs = (allDrugs.data || []).filter((drug) => {
    const matchSearch = searchQuery === "" ||
      drug.brandName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      drug.brandNameAr?.includes(searchQuery) ||
      drug.genericName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      drug.genericNameAr?.includes(searchQuery);
    const matchCategory = category === "all" || drug.category === category;
    return matchSearch && matchCategory;
  });

  const categories = [
    { value: "all", label: "All Categories" },
    { value: "antibiotics", label: "Antibiotics" },
    { value: "analgesics", label: "Analgesics" },
    { value: "cardiovascular", label: "Cardiovascular" },
    { value: "endocrine", label: "Endocrine" },
    { value: "gastrointestinal", label: "Gastrointestinal" },
    { value: "respiratory", label: "Respiratory" },
    { value: "antifungal", label: "Antifungal" },
    { value: "antiviral", label: "Antiviral" },
    { value: "vitamins", label: "Vitamins" },
    { value: "neurological", label: "Neurological" },
    { value: "other", label: "Other" },
  ];

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">National Essential Medicines Catalog</h1>
        <p className="text-muted-foreground">Unified records from Yemen’s 2019 and 2022 National Essential Medicines Lists</p>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by brand name, generic name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
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
          <CardTitle>{filteredDrugs.length} Medicines</CardTitle>
        </CardHeader>
        <CardContent>
          {allDrugs.isLoading ? (
            <p className="text-muted-foreground">Loading...</p>
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
                        {drug.genericName}
                        {drug.brandNameAr && <span className="ml-2 text-muted-foreground font-normal">{drug.brandNameAr}</span>}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {[drug.strength, drug.dosageForm].filter(Boolean).join(" · ")}
                      </p>
                      {drug.nemlCategory && (
                        <p className="mt-1 text-xs text-muted-foreground">{drug.nemlCategory}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-wrap justify-end gap-1.5">
                    {drug.sourceYears && <Badge variant="secondary" className="text-xs">NEML {drug.sourceYears}</Badge>}
                    <Badge variant="outline" className="text-xs capitalize">{drug.category}</Badge>
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
