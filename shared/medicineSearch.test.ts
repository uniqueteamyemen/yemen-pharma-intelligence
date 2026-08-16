import { describe, expect, it } from "vitest";
import { medicineMatchesQuery, medicineSearchRank, normalizeMedicineSearch } from "./medicineSearch";

const amoxicillin = {
  brandName: "Amoxicillin",
  genericName: "Amoxicillin",
  genericNameAr: "أموكسيسيلين",
  dosageForm: "Capsule",
  strength: "500mg",
};

describe("bilingual medicine search", () => {
  it("normalizes Arabic Alef variants for type-ahead queries", () => {
    expect(normalizeMedicineSearch("أمو")).toBe("امو");
    expect(medicineMatchesQuery(amoxicillin, "امو")).toBe(true);
  });

  it("ranks an Arabic name prefix above an incidental substring", () => {
    const incidental = { ...amoxicillin, genericNameAr: "سالبوتامول" };
    expect(medicineSearchRank(amoxicillin, "امو")).toBeGreaterThan(medicineSearchRank(incidental, "امو"));
  });

  it("continues to support English partial-name matching", () => {
    expect(medicineMatchesQuery(amoxicillin, "amox")).toBe(true);
  });

  it("supports searching by manufacturer / company name", () => {
    const branded = {
      brandName: "Panadol",
      genericName: "Paracetamol",
      genericNameAr: "باراسيتامول",
      manufacturer: "Shiba Pharma (سبأ فارما)",
      dosageForm: "Tablet",
      strength: "500mg",
    };
    expect(medicineMatchesQuery(branded, "Shiba")).toBe(true);
    expect(medicineMatchesQuery(branded, "سبأ")).toBe(true);
    expect(medicineMatchesQuery(branded, "Panadol")).toBe(true);
  });

  it("supports search through linked trade names and active ingredients without changing the canonical record", () => {
    const canonicalParacetamol = {
      brandName: "Paracetamol",
      genericName: "Paracetamol",
      genericNameAr: "باراسيتامول",
      dosageForm: "Tablet",
      strength: "500mg",
      tradeNames: [{
        tradeName: "Amol",
        scientificName: "Paracetamol",
        activeIngredients: "Paracetamol 500mg",
        manufacturer: "Shaphaco",
      }],
    };

    expect(medicineMatchesQuery(canonicalParacetamol, "Amol")).toBe(true);
    expect(medicineMatchesQuery(canonicalParacetamol, "Paracetamol 500")).toBe(true);
    expect(medicineSearchRank(canonicalParacetamol, "Amol")).toBeGreaterThan(0);
  });
});
