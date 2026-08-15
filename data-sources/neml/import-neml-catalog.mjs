import { readFileSync, writeFileSync } from 'node:fs';
import mysql from 'mysql2/promise';
import { cleanNemlField, isSafeNemlRecord, platformCategoryForNeml } from './catalog-normalization.mjs';
import { manualOverrides } from './manual-overrides.mjs';

const basePath = '/home/ubuntu/yemen-pharma-preview/data-sources/neml';
const sourceFile = `${basePath}/neml_unified_catalog_draft.json`;
const applyChanges = process.argv.includes('--apply');
const sourceDocumentByYear = {
  2019: 'Yemen National Essential Medicines List, 6th Edition (2019)',
  2022: 'List of Essential Medicines in Yemen, 7th Edition (2022)',
};

const raw = JSON.parse(readFileSync(sourceFile, 'utf8'));
const catalogKeyFor = (genericName, dosageForm, strength) => [genericName, dosageForm, strength]
  .map((value) => String(value ?? '').toLowerCase().replace(/\([^)]*\)/g, ' ').replace(/[^a-z0-9]+/g, ' ').trim().replace(/\s+/g, ' '))
  .join('|');
const normalizedRecords = raw.catalog
  .map((record) => {
    const override = manualOverrides[record.catalogKey] ?? {};
    const genericName = cleanNemlField(override.genericName ?? record.genericName, 200);
    const dosageForm = cleanNemlField(override.dosageForm ?? record.dosageForm, 100);
    const strength = cleanNemlField(override.strength ?? record.strength, 100);
    return {
      catalogKey: catalogKeyFor(genericName, dosageForm, strength),
      brandName: genericName,
      genericName,
      dosageForm,
      strength,
      nemlCategory: cleanNemlField(record.category, 255),
      sourceYears: record.sourceYears.sort().join(','),
      sourceRows: record.sourceRows,
    };
  })
  .filter((record) => record.catalogKey && record.brandName && record.genericName);

const excludedRecords = normalizedRecords.filter((record) => !isSafeNemlRecord(record));
const safeRecords = normalizedRecords.filter(isSafeNemlRecord);
writeFileSync(`${basePath}/neml_manual_review.json`, JSON.stringify({
  generatedAt: new Date().toISOString(),
  excludedForManualReview: excludedRecords.length,
  records: excludedRecords,
}, null, 2));

const catalogByKey = new Map();
for (const record of safeRecords) {
  const existing = catalogByKey.get(record.catalogKey);
  if (existing) {
    existing.sourceRows = [...existing.sourceRows, ...record.sourceRows];
    existing.sourceYears = [...new Set(`${existing.sourceYears},${record.sourceYears}`.split(',').filter(Boolean))]
      .sort()
      .join(',');
  } else {
    catalogByKey.set(record.catalogKey, record);
  }
}
const catalog = [...catalogByKey.values()];

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is required to import the NEML catalog.');
}

const connection = await mysql.createConnection(process.env.DATABASE_URL);
try {
  console.log(JSON.stringify({
    mode: applyChanges ? 'apply' : 'dry-run',
    records: catalog.length,
    sourceRecords: normalizedRecords.length,
    excludedForManualReview: excludedRecords.length,
    deduplicatedDuringImport: safeRecords.length - catalog.length,
    source: raw.summary.extraction,
  }, null, 2));
  if (!applyChanges) process.exit(0);

  await connection.beginTransaction();
  let imported = 0;
  let provenanceRows = 0;
  for (const record of catalog) {
    const category = platformCategoryForNeml(record.nemlCategory);
    await connection.execute(
      `INSERT INTO drugs (brandName, genericName, dosageForm, strength, category, catalogKey, nemlCategory, sourceYears, isOfficial, isActive, isDeleted)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, true, true, false)
       ON DUPLICATE KEY UPDATE
         brandName = VALUES(brandName), genericName = VALUES(genericName), dosageForm = VALUES(dosageForm),
         strength = VALUES(strength), category = VALUES(category), nemlCategory = VALUES(nemlCategory),
         sourceYears = VALUES(sourceYears), isOfficial = true, isActive = true, isDeleted = false`,
      [record.brandName, record.genericName, record.dosageForm, record.strength, category, record.catalogKey, record.nemlCategory, record.sourceYears],
    );
    const [drugRows] = await connection.execute('SELECT id FROM drugs WHERE catalogKey = ? LIMIT 1', [record.catalogKey]);
    const drugId = drugRows[0]?.id;
    if (!drugId) throw new Error(`Imported catalog record could not be retrieved: ${record.catalogKey}`);

    const firstSourceLineByYear = new Map();
    for (const sourceRow of record.sourceRows) {
      if (!firstSourceLineByYear.has(sourceRow.year)) firstSourceLineByYear.set(sourceRow.year, sourceRow.line);
    }
    for (const [year, sourceLine] of firstSourceLineByYear.entries()) {
      const sourceEdition = `NEML_${year}`;
      await connection.execute(
        `INSERT INTO drug_sources (drugId, sourceEdition, sourceDocument, sourceLine)
         VALUES (?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE sourceDocument = VALUES(sourceDocument), sourceLine = VALUES(sourceLine)`,
        [drugId, sourceEdition, sourceDocumentByYear[year], sourceLine],
      );
      provenanceRows += 1;
    }
    imported += 1;
  }
  await connection.commit();
  console.log(JSON.stringify({ status: 'imported', catalogRecords: imported, provenanceRows }, null, 2));
} catch (error) {
  await connection.rollback();
  throw error;
} finally {
  await connection.end();
}
