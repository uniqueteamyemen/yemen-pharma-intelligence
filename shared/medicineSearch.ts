const ARABIC_DIACRITICS = /[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED]/g;
const ARABIC_PRESENTATION_FORMS = /[\uFE70-\uFEFF]/g;

/**
 * Normalizes a medicine search value without changing the stored canonical identity.
 * The transformation is intentionally conservative: it removes presentation noise,
 * normalizes safe Alef variants, and preserves distinctions that could create false matches.
 */
export function normalizeMedicineSearch(value: string | null | undefined): string {
  return String(value ?? "")
    .normalize("NFKC")
    .replace(ARABIC_PRESENTATION_FORMS, "")
    .replace(ARABIC_DIACRITICS, "")
    .replace(/[ـ]/g, "")
    .replace(/[أإآٱ]/g, "ا")
    .replace(/\u0649/g, "ي")
    .toLocaleLowerCase("en-US")
    .replace(/[!"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~،؛؟]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function medicineSearchFields(record: {
  brandName?: string | null;
  brandNameAr?: string | null;
  genericName?: string | null;
  genericNameAr?: string | null;
  dosageForm?: string | null;
  strength?: string | null;
}): string {
  return [
    record.brandName,
    record.brandNameAr,
    record.genericName,
    record.genericNameAr,
    record.dosageForm,
    record.strength,
  ]
    .filter(Boolean)
    .map((value) => normalizeMedicineSearch(value))
    .join(" ");
}

export function medicineMatchesQuery(record: Parameters<typeof medicineSearchFields>[0], query: string): boolean {
  const normalizedQuery = normalizeMedicineSearch(query);
  if (!normalizedQuery) return false;
  return medicineSearchFields(record).includes(normalizedQuery);
}
