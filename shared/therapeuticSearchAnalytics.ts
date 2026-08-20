export const therapeuticSearchCategories = [
  "antibiotics", "analgesics", "cardiovascular", "respiratory", "gastrointestinal",
  "neurological", "endocrine", "antifungal", "antiviral", "oncology", "dermatological",
  "ophthalmological", "vitamins", "other",
] as const;

export type TherapeuticSearchCategory = (typeof therapeuticSearchCategories)[number];
export const therapeuticSearchContexts = ["catalog", "offer", "request"] as const;
export type TherapeuticSearchContext = (typeof therapeuticSearchContexts)[number];

export function isTrackedTherapeuticSearchCategory(value: string): value is TherapeuticSearchCategory {
  return (therapeuticSearchCategories as readonly string[]).includes(value);
}
