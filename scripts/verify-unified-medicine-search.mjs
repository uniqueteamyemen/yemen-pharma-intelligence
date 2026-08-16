const API_URL = "http://127.0.0.1:3000/api/trpc/drugs.search";

function searchableText(record) {
  return [
    record.brandName,
    record.brandNameAr,
    record.genericName,
    record.genericNameAr,
    record.strength,
    ...(record.tradeNames ?? []).flatMap((reference) => [
      reference.tradeName,
      reference.scientificName,
      reference.activeIngredients,
    ]),
  ].filter(Boolean).join(" ").toLowerCase();
}

async function search(query) {
  const url = new URL(API_URL);
  url.searchParams.set("input", JSON.stringify({ json: { query } }));
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Search API failed for ${query}: HTTP ${response.status}`);
  const payload = await response.json();
  return payload?.result?.data?.json ?? [];
}

async function assertHasResult(label, query, expectedText) {
  const records = await search(query);
  const found = records.some((record) => searchableText(record).includes(expectedText.toLowerCase()));
  if (!found) throw new Error(`${label}: expected a result containing ${expectedText}, received ${records.length} result(s)`);
  return { label, query, results: records.length, passed: true };
}

async function main() {
  const results = [];
  results.push(await assertHasResult("correct scientific name", "Amoxicillin", "amoxicillin"));
  results.push(await assertHasResult("incomplete scientific name", "Amoxi", "amoxicillin"));
  results.push(await assertHasResult("scientific-name typo", "Amoxcillin", "amoxicillin"));
  results.push(await assertHasResult("correct trade name", "Paradol", "paradol"));
  results.push(await assertHasResult("incomplete trade name", "Para", "paradol"));
  results.push(await assertHasResult("trade-name typo", "Paradlo", "paradol"));
  results.push(await assertHasResult("Arabic scientific-name typo", "اموكسسلين", "amoxicillin"));
  const withStrength = await search("Paradol 500");
  if (!withStrength.length || !searchableText(withStrength[0]).includes("500")) {
    throw new Error("name with strength: expected a 500-strength formulation to rank first");
  }
  results.push({ label: "name with strength", query: "Paradol 500", results: withStrength.length, passed: true });
  results.push(await assertHasResult("name without strength", "Paradol", "paradol"));

  const ambiguous = await search("Paradol");
  if (ambiguous.length < 2) throw new Error("multiple-option search: expected more than one stored formulation for Paradol");
  results.push({ label: "multiple stored options", query: "Paradol", results: ambiguous.length, passed: true });

  const absent = await search("Xylopharmzz");
  if (absent.length !== 0) throw new Error(`unrelated input: expected no results, received ${absent.length}`);
  results.push({ label: "unrelated input", query: "Xylopharmzz", results: 0, passed: true });

  console.log(JSON.stringify({ status: "verified", results }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
