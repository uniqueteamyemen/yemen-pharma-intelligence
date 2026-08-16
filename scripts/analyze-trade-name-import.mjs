import fs from "node:fs";
import path from "node:path";
import mysql from "mysql2/promise";

const projectDir = "/home/ubuntu/yemen-pharma-preview";
const sourceFiles = [
  "/home/ubuntu/upload/pasted_file_H639xl_yemen_trade_name_master_2018_2019.csv",
  "/home/ubuntu/upload/pasted_file_fr8Hdv_yemen_trade_names_2018_2019_extracted_final.csv",
];
const outputPath = "/home/ubuntu/exports/yemen_trade_name_import_analysis_2018_2019.json";

function normalize(value) {
  return String(value ?? "")
    .normalize("NFKC")
    .toLocaleLowerCase("en-US")
    .replace(/[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED]/g, "")
    .replace(/[ـ]/g, "")
    .replace(/[أإآٱ]/g, "ا")
    .replace(/\u0649/g, "ي")
    .replace(/[()\[\]{}!"#$%&'*+,\-./:;<=>?@\\^_`|~،؛؟]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function parseRows(sourcePath) {
  const lines = fs.readFileSync(sourcePath, "utf8").replace(/^\uFEFF/, "").split(/\r?\n/);
  const header = lines.shift()?.split(",") ?? [];
  const tradeIndex = header.indexOf("trade_name");
  const genericIndex = header.indexOf("generic_name_composition");
  const countryIndex = header.indexOf("country");
  const manufacturerIndex = header.indexOf("manufacturer");
  const sourcePageIndex = header.indexOf("source_page");

  const rows = [];
  const malformed = [];
  for (const [lineOffset, line] of lines.entries()) {
    if (!line.trim()) continue;
    const values = line.split(",");
    const tradeName = values[tradeIndex]?.trim();
    const genericName = values[genericIndex]?.trim();
    if (!tradeName || !genericName) {
      malformed.push({ line: lineOffset + 2, reason: "missing_trade_or_generic" });
      continue;
    }
    rows.push({
      sourcePage: sourcePageIndex >= 0 ? values[sourcePageIndex]?.trim() : null,
      tradeName,
      genericName,
      manufacturer: manufacturerIndex >= 0 ? values[manufacturerIndex]?.trim() : null,
      country: countryIndex >= 0 ? values[countryIndex]?.trim() : null,
      columnCount: values.length,
    });
  }
  return { rows, malformed, header };
}

function aliasKey(row) {
  return `${normalize(row.tradeName)}|${normalize(row.genericName)}|${normalize(row.manufacturer)}`;
}

async function main() {
  const parsed = sourceFiles.map((sourcePath) => ({ sourcePath, ...parseRows(sourcePath) }));
  const preferred = parsed.find((file) => file.sourcePath.includes("extracted_final"));
  if (!preferred) throw new Error("Preferred extracted file was not found");

  const aliases = new Map();
  for (const row of preferred.rows) {
    const key = aliasKey(row);
    if (!aliases.has(key)) aliases.set(key, row);
  }

  const connection = await mysql.createConnection({
    uri: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    connectTimeout: 10_000,
  });
  const [catalogRows] = await connection.query(
    "SELECT id, genericName, genericNameAr, dosageForm, strength FROM drugs WHERE isDeleted = false AND isActive = true"
  );
  await connection.end();

  const catalogByExactGeneric = new Map();
  for (const drug of catalogRows) {
    const key = normalize(drug.genericName);
    const existing = catalogByExactGeneric.get(key) ?? [];
    existing.push(drug);
    catalogByExactGeneric.set(key, existing);
  }

  const linked = [];
  const unlinked = [];
  const ambiguous = [];
  for (const alias of aliases.values()) {
    const normalizedGeneric = normalize(alias.genericName);
    const exact = catalogByExactGeneric.get(normalizedGeneric) ?? [];
    if (exact.length === 1) {
      linked.push({ ...alias, drugId: exact[0].id, matchMethod: "exact_generic" });
      continue;
    }
    if (exact.length > 1) {
      ambiguous.push({ ...alias, candidateDrugIds: exact.map((drug) => drug.id), matchMethod: "multiple_exact_generic" });
      continue;
    }

    const partial = catalogRows.filter((drug) => {
      const catalogGeneric = normalize(drug.genericName);
      return catalogGeneric && (normalizedGeneric.includes(catalogGeneric) || catalogGeneric.includes(normalizedGeneric));
    });
    if (partial.length === 1) {
      linked.push({ ...alias, drugId: partial[0].id, matchMethod: "conservative_partial_generic" });
    } else if (partial.length > 1) {
      ambiguous.push({ ...alias, candidateDrugIds: partial.map((drug) => drug.id), matchMethod: "multiple_partial_generic" });
    } else {
      unlinked.push({ ...alias, matchMethod: "no_catalog_generic_match" });
    }
  }

  const summary = {
    generatedAt: new Date().toISOString(),
    sources: parsed.map((file) => ({
      file: path.basename(file.sourcePath),
      header: file.header,
      rawRows: file.rows.length,
      malformedRows: file.malformed.length,
      rowsWithExtraColumns: file.rows.filter((row) => row.columnCount > file.header.length).length,
    })),
    catalogDrugCount: catalogRows.length,
    preferredSourceRows: preferred.rows.length,
    uniqueTradeGenericManufacturerRows: aliases.size,
    uniqueTradeNames: new Set([...aliases.values()].map((row) => normalize(row.tradeName))).size,
    exactOrConservativeLinkedRows: linked.length,
    ambiguousRows: ambiguous.length,
    unlinkedRows: unlinked.length,
    countryCounts: [...aliases.values()].reduce((counts, row) => {
      const key = row.country || "unknown";
      counts[key] = (counts[key] ?? 0) + 1;
      return counts;
    }, {}),
    preview: {
      linked: linked.slice(0, 20),
      ambiguous: ambiguous.slice(0, 20),
      unlinked: unlinked.slice(0, 20),
    },
  };

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, `${JSON.stringify(summary, null, 2)}\n`);
  console.log(JSON.stringify(summary, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
