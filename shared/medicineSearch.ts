const ARABIC_DIACRITICS = /[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED]/g;
const ARABIC_PRESENTATION_FORMS = /[\uFE70-\uFEFF]/g;
const STRENGTH_TOKEN = /\b\d+(?:\.\d+)?\s*(?:mg|mcg|µg|g|ml|iu|i\.?u\.?|%|units?)?\b/gi;

type TradeNameSearchReference = {
  tradeName?: string | null;
  tradeNameAr?: string | null;
  scientificName?: string | null;
  activeIngredients?: string | null;
  manufacturer?: string | null;
};

export type MedicineSearchRecord = {
  brandName?: string | null;
  brandNameAr?: string | null;
  genericName?: string | null;
  genericNameAr?: string | null;
  manufacturer?: string | null;
  dosageForm?: string | null;
  strength?: string | null;
  tradeNames?: TradeNameSearchReference[] | null;
};

export type MedicineSearchMatch = {
  score: number;
  kind: "exact" | "prefix" | "contains" | "typo" | "none";
  strengthMatched: boolean;
};

/**
 * Normalizes user input for lookup only; stored medicine identity remains untouched.
 * It deliberately supports Arabic Alef variants and ordinary punctuation differences.
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

function compactSearchValue(value: string): string {
  return value.replace(/\s+/g, "");
}

function nameWithoutStrength(value: string): string {
  return normalizeMedicineSearch(value).replace(STRENGTH_TOKEN, " ").replace(/\s+/g, " ").trim();
}

function strengthValues(value: string | null | undefined): string[] {
  return Array.from(String(value ?? "").toLowerCase().matchAll(STRENGTH_TOKEN))
    .flatMap((match) => {
      const raw = match[0].replace(/\s+/g, "");
      const numeric = raw.match(/^\d+(?:\.\d+)?/)?.[0];
      return numeric && numeric !== raw ? [raw, numeric] : [raw];
    })
    .filter(Boolean);
}

function tradeNameSearchValues(record: MedicineSearchRecord): Array<string | null | undefined> {
  return (record.tradeNames ?? []).flatMap((reference) => [
    reference.tradeName,
    reference.tradeNameAr,
    reference.scientificName,
    reference.activeIngredients,
  ]);
}

function medicineNameValues(record: MedicineSearchRecord): string[] {
  return [
    record.brandName,
    record.brandNameAr,
    record.genericName,
    record.genericNameAr,
    ...tradeNameSearchValues(record),
  ]
    .filter((value): value is string => Boolean(value))
    .map((value) => normalizeMedicineSearch(value))
    .filter(Boolean);
}

function medicineContextValues(record: MedicineSearchRecord): string[] {
  return [record.manufacturer, record.dosageForm, record.strength]
    .filter((value): value is string => Boolean(value))
    .map((value) => normalizeMedicineSearch(value))
    .filter(Boolean);
}

function medicineStrengthValues(record: MedicineSearchRecord): string[] {
  return [
    record.strength,
    ...((record.tradeNames ?? []).flatMap((reference) => [reference.activeIngredients])),
  ].flatMap(strengthValues);
}

function levenshteinDistance(left: string, right: string): number {
  if (left === right) return 0;
  if (!left.length) return right.length;
  if (!right.length) return left.length;

  let previous = Array.from({ length: right.length + 1 }, (_, index) => index);
  for (let row = 1; row <= left.length; row += 1) {
    const current = [row];
    for (let column = 1; column <= right.length; column += 1) {
      const substitution = previous[column - 1] + (left[row - 1] === right[column - 1] ? 0 : 1);
      current[column] = Math.min(previous[column] + 1, current[column - 1] + 1, substitution);
    }
    previous = current;
  }
  return previous[right.length];
}

function typoAllowance(length: number): number {
  if (length < 4) return 0;
  if (length <= 6) return 1;
  if (length <= 11) return 2;
  return 3;
}

function fuzzyScore(queryName: string, candidateName: string): number {
  const query = compactSearchValue(queryName);
  const candidate = compactSearchValue(candidateName);
  if (query.length < 4 || candidate.length < 4) return 0;

  const candidates = [candidate, ...candidateName.split(" ").map(compactSearchValue)].filter(Boolean);
  let best = 0;
  for (const value of candidates) {
    const distance = levenshteinDistance(query, value);
    const allowance = typoAllowance(Math.max(query.length, value.length));
    if (distance > allowance) continue;
    const similarity = 1 - distance / Math.max(query.length, value.length);
    best = Math.max(best, 650 + Math.round(similarity * 120));
  }
  return best;
}

/**
 * Returns a ranked recognition decision using only names and formulations stored in the record.
 * Fuzzy recognition is deliberately conservative: short inputs must be prefix matches, while
 * typo matching begins at four characters and allows only a small edit distance.
 */
export function getMedicineSearchMatch(record: MedicineSearchRecord, query: string): MedicineSearchMatch {
  const normalizedQuery = normalizeMedicineSearch(query);
  const queryName = nameWithoutStrength(query);
  if (!normalizedQuery || !queryName) return { score: 0, kind: "none", strengthMatched: false };

  const queryStrengths = strengthValues(query);
  const recordStrengths = medicineStrengthValues(record);
  const strengthMatched = queryStrengths.length > 0 && queryStrengths.some((strength) => recordStrengths.includes(strength));

  let score = 0;
  let kind: MedicineSearchMatch["kind"] = "none";
  for (const field of medicineNameValues(record)) {
    const fieldName = nameWithoutStrength(field);
    if (!fieldName) continue;
    if (fieldName === queryName) {
      score = Math.max(score, 950);
      kind = "exact";
      continue;
    }
    if (fieldName.startsWith(queryName) || fieldName.split(" ").some((token) => token.startsWith(queryName))) {
      if (score < 920) {
        score = 920;
        kind = "prefix";
      }
      continue;
    }
    if (fieldName.includes(queryName)) {
      if (score < 840) {
        score = 840;
        kind = "contains";
      }
      continue;
    }
    const typoMatchScore = fuzzyScore(queryName, fieldName);
    if (typoMatchScore > score) {
      score = typoMatchScore;
      kind = "typo";
    }
  }

  // Context remains searchable for compatibility, but it is never used as medicine-name recognition.
  if (!score && medicineContextValues(record).some((field) => field.includes(normalizedQuery))) {
    score = 400;
    kind = "contains";
  }

  return {
    score: Math.min(1000, score + (strengthMatched ? 35 : 0)),
    kind,
    strengthMatched,
  };
}

export function medicineSearchFields(record: MedicineSearchRecord): string {
  return [...medicineNameValues(record), ...medicineContextValues(record)].join(" ");
}

export function medicineSearchRank(record: MedicineSearchRecord, query: string): number {
  return getMedicineSearchMatch(record, query).score;
}

export function medicineMatchesQuery(record: MedicineSearchRecord, query: string): boolean {
  return medicineSearchRank(record, query) > 0;
}

/** Uses the same ranking in local catalog lists and server-side lookup results. */
export function rankMedicinesBySearch<T extends MedicineSearchRecord>(records: T[], query: string): T[] {
  return records
    .map((record, index) => ({ record, index, match: getMedicineSearchMatch(record, query) }))
    .filter(({ match }) => match.score > 0)
    .sort((left, right) => right.match.score - left.match.score || left.index - right.index)
    .map(({ record }) => record);
}
