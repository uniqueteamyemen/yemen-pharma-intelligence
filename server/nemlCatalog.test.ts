import { describe, expect, it } from "vitest";
import { cleanNemlField, isSafeNemlRecord, platformCategoryForNeml } from "../data-sources/neml/catalog-normalization.mjs";
import { manualOverrides } from "../data-sources/neml/manual-overrides.mjs";

describe("NEML catalog normalization", () => {
  it("maps core NEML therapeutic sections to supported platform categories", () => {
    expect(platformCategoryForNeml("Anti-infective Medicines")).toBe("antibiotics");
    expect(platformCategoryForNeml("Antineoplastic and Immunosuppressives")).toBe("oncology");
    expect(platformCategoryForNeml("Anticonvulsants / Antiepileptics")).toBe("neurological");
    expect(platformCategoryForNeml("Vitamins and Minerals")).toBe("vitamins");
  });

  it("cleans PDF-layout artefacts without fabricating medicine data", () => {
    expect(cleanNemlField(": 500mg                       4 N", 100)).toBe("500mg");
    expect(cleanNemlField("  Paracetamol   ", 200)).toBe("Paracetamol");
    expect(cleanNemlField(null, 100)).toBeNull();
  });

  it("excludes incomplete PDF rows rather than guessing a medicine name or strength", () => {
    expect(isSafeNemlRecord({ genericName: "amoxicillin +", strength: "125 mg + 31.25 mg" })).toBe(false);
    expect(isSafeNemlRecord({ genericName: "caffeine citrate", strength: "20 mg/mL" })).toBe(true);
  });

  it("uses source-verified corrections for PDF rows split across lines", () => {
    expect(manualOverrides['amoxicillin|oral liquid|125 mg amoxicillin 31 25 mg']).toMatchObject({
      genericName: "Amoxicillin + Clavulanic Acid",
      strength: "125mg + 31.25mg/5mL; 250mg + 62.5mg/5mL",
    });
  });
});
