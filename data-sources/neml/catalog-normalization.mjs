export const platformCategoryForNeml = (nemlCategory = '') => {
  const category = nemlCategory.toLowerCase();
  if (category.includes('anti-infective') || category.includes('anti-bacterial') || category.includes('antibacterial')) return 'antibiotics';
  if (category.includes('anti-fungal') || category.includes('antifungal')) return 'antifungal';
  if (category.includes('anti-viral') || category.includes('antiviral')) return 'antiviral';
  if (category.includes('analgesic') || category.includes('pain') || category.includes('anti-inflammatory')) return 'analgesics';
  if (category.includes('cardiovascular') || category.includes('blood')) return 'cardiovascular';
  if (category.includes('respiratory')) return 'respiratory';
  if (category.includes('gastrointestinal')) return 'gastrointestinal';
  if (category.includes('hormone') || category.includes('endocrine') || category.includes('contraceptive')) return 'endocrine';
  if (category.includes('dermatological')) return 'dermatological';
  if (category.includes('ophthalmological')) return 'ophthalmological';
  if (category.includes('vitamin') || category.includes('mineral')) return 'vitamins';
  if (category.includes('antineoplastic') || category.includes('cytotoxic')) return 'oncology';
  if (category.includes('anticonvulsant') || category.includes('antiepileptic') || category.includes('antiparkinson') || category.includes('psychotherapeutic')) return 'neurological';
  return 'other';
};

export const cleanNemlField = (value, maxLength) => {
  const normalized = String(value ?? '')
    .replace(/^\s*:\s*/, '')
    .replace(/\bSub\s+stances\b/gi, 'Substances')
    .replace(/\s+\d+\s+[EVNS#]{1,4}\s*$/i, '')
    .replace(/\s+/g, ' ')
    .trim();
  return normalized ? normalized.slice(0, maxLength) : null;
};

export const isSafeNemlRecord = (record) => {
  const genericName = String(record.genericName ?? '').trim();
  const strength = String(record.strength ?? '').trim();
  const hasUnbalancedParentheses = (genericName.match(/\(/g) ?? []).length !== (genericName.match(/\)/g) ?? []).length;
  const endsWithIncompleteCombination = /\+\s*$/.test(genericName);
  const hasTruncatedStrength = /(?:\s|^)\d{1,2}\s*$/.test(strength) || /equivalent to\s+\d+\s*$/i.test(strength);
  return Boolean(genericName) && !hasUnbalancedParentheses && !endsWithIncompleteCombination && !hasTruncatedStrength;
};
