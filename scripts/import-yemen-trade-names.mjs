import { createHash } from "node:crypto";
import fs from "node:fs";
import mysql from "mysql2/promise";

const FINAL_SOURCE = "/home/ubuntu/upload/pasted_file_fr8Hdv_yemen_trade_names_2018_2019_extracted_final.csv";
const MASTER_SOURCE = "/home/ubuntu/upload/pasted_file_H639xl_yemen_trade_name_master_2018_2019.csv";
const REVIEW_OUTPUT = "/home/ubuntu/exports/yemen_trade_name_import_review_2018_2019.json";
const APPLY = process.argv.includes("--apply");
const SOURCE_DOCUMENT = "Yemen Drug Products Directory (2018–2019; user-provided CSV extraction)";
const SOURCE_YEARS = "2018-2019";

const INGREDIENT_NOISE = /\b(each|tablet|tablets|tab|tabs|capsule|capsules|cap|caps|syrup|suspension|solution|injection|infusion|ampoule|ampoules|amp|amps|cream|ointment|drops?|oral|pediatric|paediatric|infant|dry|powder|for|per|contains?|containing|with|w|f\s*c|film\s*coated|chewable|soft\s*gelatin|suppository|suppositories|supp)\b/gi;
const STRENGTH_EXPRESSION = /\b\d+(?:\.\d+)?\s*(?:mg|mcg|µg|g|ml|l|iu|i\.?u\.?|units?|%)(?:\s*\/\s*\d+(?:\.\d+)?\s*(?:mg|mcg|µg|g|ml|l))?/gi;

function trimTo(value, length) {
  const cleaned = String(value ?? "").replace(/\s+/g, " ").trim();
  return cleaned ? cleaned.slice(0, length) : null;
}

function normalize(value) {
  return String(value ?? "")
    .normalize("NFKC")
    .toLocaleLowerCase("en-US")
    .replace(/[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06EDـ]/g, "")
    .replace(/[أإآٱ]/g, "ا")
    .replace(/\u0649/g, "ي")
    .replace(/amoxycillin/g, "amoxicillin")
    .replace(/paracetamol/g, "acetaminophen")
    .replace(/\/|&|\band\b/gi, " + ")
    .replace(/[^\p{L}\p{N}+]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function scientificNameFrom(activeIngredients) {
  return String(activeIngredients ?? "")
    .replace(/([A-Za-z])(\d)/g, "$1 $2")
    .replace(STRENGTH_EXPRESSION, " ")
    .replace(/\b\d+(?:\.\d+)?\b/g, " ")
    .replace(INGREDIENT_NOISE, " ")
    .replace(/[.,;:()]/g, " ")
    .replace(/[=/]/g, " + ")
    .replace(/\+\s*\+/g, "+")
    .replace(/\s*\+\s*/g, " + ")
    .replace(/\s+/g, " ")
    .replace(/^[+\s]+|[+\s]+$/g, "")
    .trim();
}

function scientificKey(value) {
  return normalize(scientificNameFrom(value)).replace(/\s*\+\s*/g, "+");
}

function ingredientSetKey(value) {
  return scientificKey(value).split("+").filter(Boolean).sort().join("+");
}

function formKey(value) {
  const form = normalize(value);
  if (/inject|amp/.test(form)) return "injection";
  if (/tablet|tab|chew/.test(form)) return "tablet";
  if (/capsule|cap/.test(form)) return "capsule";
  if (/syrup|suspension|oral liquid/.test(form)) return "oral-liquid";
  if (/drop/.test(form)) return "drops";
  if (/cream/.test(form)) return "cream";
  if (/ointment/.test(form)) return "ointment";
  if (/powder/.test(form)) return "powder";
  if (/solution/.test(form)) return "solution";
  if (/supp/.test(form)) return "suppository";
  return form || null;
}

function strengthTokens(value) {
  return [...String(value ?? "").toLowerCase().matchAll(/\d+(?:\.\d+)?\s*(?:mg|mcg|µg|g|ml|iu|i\.?u\.?|%)/g)]
    .map((match) => match[0].replace(/\s+/g, ""));
}

function strengthCompatible(sourceIngredients, catalogStrength) {
  const source = strengthTokens(sourceIngredients);
  const catalog = strengthTokens(catalogStrength);
  if (!source.length || !catalog.length) return false;
  return catalog.every((token) => source.includes(token));
}

function parseLineBasedCsv(sourcePath) {
  const lines = fs.readFileSync(sourcePath, "utf8").replace(/^\uFEFF/, "").split(/\r?\n/);
  const header = (lines.shift() ?? "").split(",");
  const column = Object.fromEntries(header.map((name, index) => [name, index]));
  return lines.flatMap((line, index) => {
    if (!line.trim()) return [];
    const fields = line.split(",");
    const get = (name) => fields[column[name]]?.trim() ?? "";
    if (!get("trade_name") || !get("generic_name_composition")) return [];
    return [{
      line: index + 2,
      sourcePage: get("source_page"),
      tradeName: get("trade_name"),
      activeIngredients: get("generic_name_composition"),
      dosageForm: get("dosage_form"),
      package: get("package"),
      manufacturer: get("manufacturer"),
      manufacturerCountry: get("country"),
    }];
  });
}

function masterKey(row) {
  return [row.tradeName, row.activeIngredients, row.dosageForm].map(normalize).join("|");
}

function hydrateWithMaster(finalRows, masterRows) {
  const masterByKey = new Map();
  for (const row of masterRows) {
    const key = masterKey(row);
    const entries = masterByKey.get(key) ?? [];
    entries.push(row);
    masterByKey.set(key, entries);
  }
  return finalRows.map((row) => {
    const referenceRows = masterByKey.get(masterKey(row)) ?? [];
    const reference = referenceRows.length === 1 ? referenceRows[0] : null;
    return {
      ...row,
      manufacturer: reference?.manufacturer || row.manufacturer,
      manufacturerCountry: reference?.manufacturerCountry || row.manufacturerCountry,
    };
  });
}

function pickCanonicalDrug(row, catalog) {
  const sourceIngredientSet = ingredientSetKey(row.activeIngredients);
  if (!sourceIngredientSet) {
    return { status: "unlinked", drugId: null, method: "no_usable_scientific_name", candidateDrugIds: [] };
  }
  let candidates = catalog.filter((drug) => drug.ingredientSetKey === sourceIngredientSet);
  if (!candidates.length) {
    return { status: "unlinked", drugId: null, method: "no_exact_ingredient_set_match", candidateDrugIds: [] };
  }

  const sourceForm = formKey(row.dosageForm);
  const formMatches = sourceForm ? candidates.filter((drug) => drug.formKey === sourceForm) : [];
  const candidatesWithKnownForm = candidates.filter((drug) => drug.formKey);
  if (sourceForm && candidatesWithKnownForm.length && !formMatches.length) {
    return { status: "unlinked", drugId: null, method: "dosage_form_mismatch", candidateDrugIds: candidates.map((drug) => drug.id) };
  }
  if (formMatches.length) candidates = formMatches;

  const strengthMatches = candidates.filter((drug) => strengthCompatible(row.activeIngredients, drug.strength));
  const candidatesWithKnownStrength = candidates.filter((drug) => strengthTokens(drug.strength).length > 0);
  if (strengthTokens(row.activeIngredients).length && candidatesWithKnownStrength.length && !strengthMatches.length) {
    return { status: "unlinked", drugId: null, method: "strength_mismatch", candidateDrugIds: candidates.map((drug) => drug.id) };
  }
  if (strengthMatches.length) candidates = strengthMatches;

  if (candidates.length === 1) {
    const usedForm = Boolean(formMatches.length);
    const usedStrength = Boolean(strengthMatches.length);
    const method = ["exact_ingredient_set", usedForm ? "form" : null, usedStrength ? "strength" : null].filter(Boolean).join("_");
    return { status: "linked", drugId: candidates[0].id, method, candidateDrugIds: [candidates[0].id] };
  }
  return { status: "ambiguous", drugId: null, method: "exact_ingredient_set_multiple_candidates", candidateDrugIds: candidates.map((drug) => drug.id) };
}

function sourceKeyFor(row) {
  const value = [SOURCE_YEARS, row.sourcePage, row.line, row.tradeName, row.activeIngredients, row.dosageForm, row.package]
    .map((entry) => String(entry ?? "").trim())
    .join("|");
  return createHash("sha256").update(value).digest("hex");
}

async function main() {
  const finalRows = parseLineBasedCsv(FINAL_SOURCE);
  const masterRows = parseLineBasedCsv(MASTER_SOURCE);
  const rows = hydrateWithMaster(finalRows, masterRows);
  console.error(`[TradeImport] Parsed ${rows.length} final-source rows for dry-run analysis.`);

  const connection = await mysql.createConnection(process.env.DATABASE_URL);
  try {
    console.error("[TradeImport] Connected to the catalog database.");
    const [catalogRows] = await connection.execute(
      "SELECT id, genericName, dosageForm, strength FROM drugs WHERE isDeleted = false AND isActive = true"
    );
    console.error(`[TradeImport] Loaded ${catalogRows.length} canonical catalog rows.`);
    const catalog = catalogRows.map((drug) => ({
      ...drug,
      scientificKey: scientificKey(drug.genericName),
      ingredientSetKey: ingredientSetKey(drug.genericName),
      formKey: formKey(drug.dosageForm),
    }));
    const preparedRows = rows.map((row) => {
      const scientificName = trimTo(scientificNameFrom(row.activeIngredients), 200) || trimTo(row.activeIngredients, 200);
      const match = pickCanonicalDrug(row, catalog);
      return {
        ...row,
        scientificName,
        sourceKey: sourceKeyFor(row),
        match,
      };
    });
    console.error(`[TradeImport] Prepared ${preparedRows.length} link decisions.`);

    const summary = {
      mode: APPLY ? "apply" : "dry-run",
      sourceDocument: SOURCE_DOCUMENT,
      sourceRows: preparedRows.length,
      catalogDrugCount: catalog.length,
      linked: preparedRows.filter((row) => row.match.status === "linked").length,
      ambiguous: preparedRows.filter((row) => row.match.status === "ambiguous").length,
      unlinked: preparedRows.filter((row) => row.match.status === "unlinked").length,
      methods: Object.fromEntries(Object.entries(Object.groupBy(preparedRows, (row) => row.match.method))
        .map(([method, matchedRows]) => [method, matchedRows.length])),
      samples: {
        linked: preparedRows.filter((row) => row.match.status === "linked").slice(0, 30),
        ambiguous: preparedRows.filter((row) => row.match.status === "ambiguous").slice(0, 30),
        unlinked: preparedRows.filter((row) => row.match.status === "unlinked").slice(0, 30),
      },
    };

    fs.mkdirSync("/home/ubuntu/exports", { recursive: true });
    fs.writeFileSync(REVIEW_OUTPUT, `${JSON.stringify(summary, null, 2)}\n`);
    console.log(JSON.stringify(summary, null, 2));
    if (!APPLY) return;

    await connection.beginTransaction();
    for (const row of preparedRows) {
      await connection.execute(
        `INSERT INTO drug_trade_names
          (drugId, tradeName, scientificName, activeIngredients, dosageForm, package, manufacturer, manufacturerCountry,
           sourceDocument, sourcePage, sourceRow, sourceYears, sourceKey, matchStatus)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
          drugId = VALUES(drugId), scientificName = VALUES(scientificName), activeIngredients = VALUES(activeIngredients),
          dosageForm = VALUES(dosageForm), package = VALUES(package), manufacturer = VALUES(manufacturer),
          manufacturerCountry = VALUES(manufacturerCountry), matchStatus = VALUES(matchStatus)`,
        [
          row.match.drugId,
          trimTo(row.tradeName, 200),
          row.scientificName,
          row.activeIngredients.trim(),
          trimTo(row.dosageForm, 100),
          trimTo(row.package, 255),
          trimTo(row.manufacturer, 200),
          trimTo(row.manufacturerCountry, 100),
          SOURCE_DOCUMENT,
          Number.parseInt(row.sourcePage, 10) || null,
          row.line,
          SOURCE_YEARS,
          row.sourceKey,
          row.match.status,
        ],
      );
    }
    await connection.commit();
    console.log(JSON.stringify({ status: "imported", rows: preparedRows.length }, null, 2));
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.destroy();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
