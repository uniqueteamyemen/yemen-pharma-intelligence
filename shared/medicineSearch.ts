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

function normalizedMedicineSearchFieldValues(record: Parameters<typeof medicineSearchFields>[0]): string[] {
  return [
    record.brandName,
    record.brandNameAr,
    record.genericName,
    record.genericNameAr,
    record.dosageForm,
    record.strength,
  ]
    .filter(Boolean)
    .map((value) => normalizeMedicineSearch(value));
}

/**
 * Gives prefix and exact matches priority over incidental substring matches.
 * This is particularly important for Arabic type-ahead: e.g. "أمو" should
 * surface "أموكسيسيلين" before a medicine that happens to contain the same
 * three letters in the middle of its Arabic name.
 */
export function medicineSearchRank(record: Parameters<typeof medicineSearchFields>[0], query: string): number {
  const normalizedQuery = normalizeMedicineSearch(query);
  if (!normalizedQuery) return 0;

  const fields = normalizedMedicineSearchFieldValues(record);
  if (fields.some((field) => field === normalizedQuery)) return 4;
  if (fields.some((field) => field.startsWith(normalizedQuery))) return 3;
  if (fields.some((field) => field.split(" ").some((token) => token.startsWith(normalizedQuery)))) return 2;
  if (fields.some((field) => field.includes(normalizedQuery))) return 1;
  return 0;
}

export function medicineMatchesQuery(record: Parameters<typeof medicineSearchFields>[0], query: string): boolean {
  return medicineSearchRank(record, query) > 0;
}
