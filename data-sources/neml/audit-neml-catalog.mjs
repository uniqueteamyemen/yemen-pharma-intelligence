import { writeFileSync } from 'node:fs';
import mysql from 'mysql2/promise';

const outPath = '/home/ubuntu/yemen-pharma-preview/data-sources/neml/neml_catalog_audit.json';
const normalize = (value = '') => String(value)
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, ' ')
  .trim()
  .replace(/\s+/g, ' ');

if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is required.');

const connection = await mysql.createConnection(process.env.DATABASE_URL);
try {
  const [records] = await connection.execute(
    'SELECT id, genericName, dosageForm, strength, nemlCategory, sourceYears, catalogKey FROM drugs WHERE catalogKey IS NOT NULL ORDER BY genericName, dosageForm, strength',
  );
  const invalidGeneric = records.filter((record) => !record.genericName || /[+]\s*$|\(\s*[EVNS#]+\s*\)/i.test(record.genericName));
  const malformedStrength = records.filter((record) => record.strength && (/\s\d{1,2}\s*[EVNS#]?\s*$/i.test(record.strength) || /[EVNS#]{2,}/.test(record.strength)));
  const malformedCategory = records.filter((record) => record.nemlCategory && (/_|and$/i.test(record.nemlCategory) || /\d/.test(record.nemlCategory)));

  const byGenericForm = new Map();
  for (const record of records) {
    const key = `${normalize(record.genericName)}|${normalize(record.dosageForm)}`;
    const group = byGenericForm.get(key) ?? [];
    group.push(record);
    byGenericForm.set(key, group);
  }
  const exactDuplicateGroups = [...byGenericForm.values()]
    .map((group) => group.filter((item, index, all) => all.findIndex((candidate) => normalize(candidate.strength) === normalize(item.strength)) !== index))
    .filter((group) => group.length > 0);

  const report = {
    generatedAt: new Date().toISOString(),
    totalRecords: records.length,
    invalidGenericCount: invalidGeneric.length,
    malformedStrengthCount: malformedStrength.length,
    malformedCategoryCount: malformedCategory.length,
    exactDuplicateGroupCount: exactDuplicateGroups.length,
    samples: {
      invalidGeneric: invalidGeneric.slice(0, 20),
      malformedStrength: malformedStrength.slice(0, 30),
      malformedCategory: malformedCategory.slice(0, 20),
      exactDuplicateGroups: exactDuplicateGroups.slice(0, 10),
    },
  };
  writeFileSync(outPath, JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
} finally {
  await connection.end();
}
