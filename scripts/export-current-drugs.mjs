import fs from "node:fs/promises";
import path from "node:path";
import mysql from "mysql2/promise";

const outputDir = "/home/ubuntu/exports";
const snapshotDate = new Date().toISOString().slice(0, 10);
const allOutput = path.join(outputDir, `yemen_drugs_current_${snapshotDate}.csv`);
const manufacturerOutput = path.join(outputDir, `yemen_drugs_with_manufacturer_${snapshotDate}.csv`);

const columns = [
  "drug_id",
  "brand_name",
  "brand_name_ar",
  "generic_name",
  "generic_name_ar",
  "manufacturer_name",
  "dosage_form",
  "strength",
  "category",
  "catalog_key",
  "neml_category",
  "source_years",
  "is_official",
  "is_active",
  "local_or_imported_status",
  "classification_note",
];

function csvCell(value) {
  const normalized = value === null || value === undefined ? "" : String(value);
  return `"${normalized.replaceAll('"', '""')}"`;
}

function serialize(rows) {
  return [
    columns.map(csvCell).join(","),
    ...rows.map((row) => columns.map((column) => csvCell(row[column])).join(",")),
  ].join("\n") + "\n";
}

const connection = await mysql.createConnection(process.env.DATABASE_URL);

try {
  const [rows] = await connection.execute(`
    SELECT
      id AS drug_id,
      brandName AS brand_name,
      brandNameAr AS brand_name_ar,
      genericName AS generic_name,
      genericNameAr AS generic_name_ar,
      manufacturer AS manufacturer_name,
      dosageForm AS dosage_form,
      strength,
      category,
      catalogKey AS catalog_key,
      nemlCategory AS neml_category,
      sourceYears AS source_years,
      isOfficial AS is_official,
      isActive AS is_active,
      'Not recorded in drugs' AS local_or_imported_status,
      'The drugs table has manufacturer only; it has no importer, manufacturer country, or local/imported field.' AS classification_note
    FROM drugs
    WHERE isDeleted = 0
    ORDER BY brandName, dosageForm, strength, id
  `);

  const withManufacturer = rows.filter((row) => row.manufacturer_name && String(row.manufacturer_name).trim());
  await fs.mkdir(outputDir, { recursive: true });
  await fs.writeFile(allOutput, serialize(rows), "utf8");
  await fs.writeFile(manufacturerOutput, serialize(withManufacturer), "utf8");

  console.log(JSON.stringify({
    allOutput,
    manufacturerOutput,
    totalRows: rows.length,
    manufacturerRows: withManufacturer.length,
  }));
} finally {
  await connection.end();
}
