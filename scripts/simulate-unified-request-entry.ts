import { buildMedicineEntryPayload } from "../shared/medicineEntry";

const API_URL = "http://127.0.0.1:3000/api/trpc/drugs.search";

async function searchSuggestions(query: string) {
  const url = new URL(API_URL);
  url.searchParams.set("input", JSON.stringify({ json: { query } }));
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Suggestion lookup failed: HTTP ${response.status}`);
  const payload = await response.json();
  return payload?.result?.data?.json ?? [];
}

async function main() {
  const typedName = "Paradol 500";
  const suggestions = await searchSuggestions(typedName);
  if (!suggestions.length) throw new Error("Expected one or more stored suggestions for Paradol 500");

  const selectedSuggestion = suggestions[0];
  const selectedPayload = buildMedicineEntryPayload(typedName, String(selectedSuggestion.id));
  const freeTextPayload = buildMedicineEntryPayload("Paradlo", "");

  if (!selectedPayload || selectedPayload.isFreeText || selectedPayload.drugId !== selectedSuggestion.id) {
    throw new Error("Explicit suggestion selection did not produce a catalog reference payload");
  }
  if (!freeTextPayload || !freeTextPayload.isFreeText || freeTextPayload.freeTextName !== "Paradlo") {
    throw new Error("Unselected typed name was not preserved as free text");
  }

  console.log(JSON.stringify({
    simulation: "no database request row created",
    typedName,
    suggestionCount: suggestions.length,
    firstSuggestion: {
      id: selectedSuggestion.id,
      genericName: selectedSuggestion.genericName,
      dosageForm: selectedSuggestion.dosageForm,
      strength: selectedSuggestion.strength,
    },
    onExplicitSelection: selectedPayload,
    withoutSelection: freeTextPayload,
    passed: true,
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
