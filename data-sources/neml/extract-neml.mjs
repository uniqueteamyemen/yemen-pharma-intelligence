import { readFileSync, writeFileSync } from 'node:fs';

const basePath = '/home/ubuntu/yemen-pharma-preview/data-sources/neml';
const source2019 = readFileSync(`${basePath}/yemen_neml_2019.txt`, 'utf8').split(/\r?\n/);
const source2022 = readFileSync(`${basePath}/yemen_neml_2022.txt`, 'utf8').split(/\r?\n/);

const dosageForms = [
  'Pow\\. Injection', 'Disp\\. Tablet', 'Chew\\.Table', 'Tablet \(scored\)',
  'Powder for injection', 'Injection for spinal anaesthesia', 'Oral liquid',
  'Oral Liquid', 'Solid oral dosage form', 'Transdermal patch', 'Medical gas',
  'Eye drops', 'Ear drops', 'Nasal spray', 'Nasal drops', 'Oral Drop', 'Oral Drops',
  'Injection', 'Inhalation', 'Capsule', 'Tablet', 'Suspension', 'Suppository',
  'Supp', 'syrup', 'Syrup', 'Infusion', 'Solution', 'Powder', 'Cream', 'Ointment',
  'Gel', 'Patch', 'Drops', 'Drop', 'Rectal', 'Lozenge', 'Lotion', 'Spray',
  'Mouthwash', 'Granules', 'Paste', 'Shampoo', 'Enema', 'Vaginal', 'Dental cartridge',
  'Implant', 'Device', 'Ampoule', 'Inhaler', 'Nebuliser', 'Pow. inj.', 'Pow. Injection',
];

const formMatcher = new RegExp(`\\b(${dosageForms.join('|')})\\b`, 'i');
const canonical = (value) => String(value ?? '')
  .toLowerCase()
  .replace(/\(.*?\)/g, ' ')
  .replace(/\b(hcl|hydrochloride|sodium|sulphate|sulfate|phosphate|mesilate|maleate)\b/g, ' ')
  .replace(/\b[EVNS#]{1,4}\b/g, ' ')
  .replace(/[^a-z0-9]+/g, ' ')
  .trim()
  .replace(/\s+/g, ' ');

const categoryKey = (value = '') => {
  const category = value
    .replace(/^\s*\d+(?:\.\d+)*\.?\s*/, '')
    .replace(/_/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  const aliases = {
    Antineoplasticand: 'Antineoplastic and Immunosuppressives',
    AntimigraineMedic: 'Antimigraine Medicines',
    'SOLUTIONS CORRECTING WATER, ELECTROLYTE AND': 'SOLUTIONS CORRECTING WATER, ELECTROLYTE AND ACID-BASE DISTURBANCES',
  };
  return aliases[category] ?? category;
};

const extractStrength = (value = '') => {
  const normalized = String(value).replace(/\s+/g, ' ');
  const strength = normalized.match(/\d+(?:\.\d+)?\s*(?:mg|mcg|g|gm|%|I\.?U\.?)(?:\s*\/\s*\d+(?:\.\d+)?\s*m[lL])?(?:\s*(?:,|–|-|to)\s*\d+(?:\.\d+)?\s*(?:mg|mcg|g|gm|%|I\.?U\.?))*/i);
  return strength ? strength[0].replace(/\s+/g, ' ').trim() : null;
};

function parse2022(lines) {
  const records = [];
  let category = '';
  for (let index = 255; index < lines.length; index += 1) {
    const line = lines[index].replace(/\f/g, '').trimEnd();
    const trimmed = line.trim();
    if (!trimmed) continue;

    if (/^\d{1,2}\.\s*[A-Z][A-Za-z].*$/.test(trimmed) && !/^\d+\.\d+/.test(trimmed)) {
      category = categoryKey(trimmed);
      continue;
    }

    const row = trimmed.match(/^(\d{1,3})\s+([A-Za-z][A-Za-z0-9+,.()/' -]*?)\s{2,}(.+)$/);
    if (!row || /^(List Of Essential|7th Edition|Page |# through)/i.test(trimmed)) continue;

    const [, , genericNameRaw, remainder] = row;
    const formFound = remainder.match(formMatcher);
    if (!formFound) continue;
    const formStart = formFound.index ?? 0;
    const dosageForm = formFound[0].replace(/\s+/g, ' ').trim();
    const afterForm = remainder.slice(formStart + dosageForm.length).trim();
    const inlineStrength = afterForm
      .replace(/\s{2,}(?:amp|vial|btl|bottle|cylinder|tube|pack|box|ml|V|E|N|S#?).*$/i, '')
      .trim();
    const continuation = lines.slice(index + 1, index + 4)
      .map((candidate) => candidate.replace(/\f/g, '').trim())
      .filter((candidate) => !/^\d+\s+[A-Za-z]/.test(candidate))
      .join(' ');
    const strength = extractStrength(inlineStrength) ?? extractStrength(continuation);

    let genericName = genericNameRaw.replace(/\s*\([EVNS#]+\)\s*$/i, '').replace(/\s+/g, ' ').trim();
    if ((genericName.endsWith('+') || (genericName.includes('(') && !genericName.includes(')'))) && index + 1 < lines.length) {
      const nextLine = lines[index + 1].replace(/\f/g, '').replace(/^\s*[-–]\s*/, '').trim();
      if (nextLine && !formMatcher.test(nextLine) && !/^\d+\s+[A-Za-z]/.test(nextLine)) {
        genericName = `${genericName} ${nextLine.replace(/\s{2,}.*$/, '').trim()}`.replace(/\s+/g, ' ');
      }
    }
    if (genericName.length < 3 || /^(List|Edition|Medicine)$/i.test(genericName)) continue;
    records.push({
      sourceYear: 2022,
      sourceLine: index + 1,
      category,
      genericName,
      dosageForm,
      strength: strength || null,
    });
  }
  return records;
}

function parse2019(lines) {
  const records = [];
  let category = '';
  for (let index = 217; index < lines.length; index += 1) {
    const line = lines[index].replace(/\f/g, '').trimEnd();
    const trimmed = line.trim();
    if (!trimmed) continue;

    if (/^\d{1,2}\.\s+[A-Z][A-Z ,/()\-]+$/.test(trimmed)) {
      const continuation = lines[index + 1]?.replace(/\f/g, '').trim() ?? '';
      category = categoryKey(trimmed.endsWith('AND') && /^[A-Z][A-Z ,/()\-]+$/.test(continuation)
        ? `${trimmed} ${continuation}`
        : trimmed);
      continue;
    }

    const row = line.match(/^\s*([a-z][a-z +,()./'-]{2,}?)\s{2,}(.+)$/);
    if (!row || /^(medicine|dosage|generic|classification|health|level|table|list)/i.test(trimmed)) continue;
    const [, genericNameRaw, remainder] = row;
    const formFound = remainder.match(formMatcher);
    if (!formFound) continue;
    const formStart = formFound.index ?? 0;
    const dosageForm = formFound[0].replace(/\s+/g, ' ').trim();
    const strength = remainder.slice(formStart + dosageForm.length)
      .replace(/\s{2,}[EVN]\s+\d+.*$/i, '')
      .trim();
    const genericName = genericNameRaw.replace(/^\W+/, '').replace(/\s+/g, ' ').trim();
    if (genericName.length < 3) continue;
    records.push({
      sourceYear: 2019,
      sourceLine: index + 1,
      category,
      genericName,
      dosageForm,
      strength: strength || null,
    });
  }
  return records;
}

const records2019 = parse2019(source2019);
const records2022 = parse2022(source2022);
const records = [...records2019, ...records2022];

const genericYears = new Map();
for (const row of records) {
  const key = canonical(row.genericName);
  if (!key) continue;
  const sourceRows = genericYears.get(key) ?? [];
  sourceRows.push({ year: row.sourceYear, line: row.sourceLine });
  genericYears.set(key, sourceRows);
}

const unified = new Map();
for (const row of records) {
  const key = [canonical(row.genericName), canonical(row.dosageForm), canonical(row.strength)].join('|');
  if (!key.replaceAll('|', '')) continue;
  const existing = unified.get(key);
  if (existing) {
    existing.sourceYears = [...new Set([...existing.sourceYears, row.sourceYear])].sort();
    existing.sourceRows.push({ year: row.sourceYear, line: row.sourceLine });
    if (!existing.category && row.category) existing.category = row.category;
  } else {
    const nameSources = genericYears.get(canonical(row.genericName)) ?? [];
    unified.set(key, {
      catalogKey: key,
      genericName: row.genericName,
      dosageForm: row.dosageForm,
      strength: row.strength,
      category: row.category || 'Unclassified',
      sourceYears: [...new Set(nameSources.map((source) => source.year))].sort(),
      sourceRows: nameSources,
    });
  }
}

const catalog = [...unified.values()].sort((a, b) => a.genericName.localeCompare(b.genericName));
const summary = {
  generatedAt: new Date().toISOString(),
  extraction: {
    '2019': records2019.length,
    '2022': records2022.length,
    totalSourceRows: records.length,
    unifiedRecords: catalog.length,
    recordsInBothSources: catalog.filter((record) => record.sourceYears.length === 2).length,
    sharedGenericNames: [...genericYears.values()].filter((rows) => new Set(rows.map((row) => row.year)).size === 2).length,
  },
};

writeFileSync(`${basePath}/neml_2019_extracted.json`, JSON.stringify(records2019, null, 2));
writeFileSync(`${basePath}/neml_2022_extracted.json`, JSON.stringify(records2022, null, 2));
writeFileSync(`${basePath}/neml_unified_catalog_draft.json`, JSON.stringify({ summary, catalog }, null, 2));
console.log(JSON.stringify(summary, null, 2));
