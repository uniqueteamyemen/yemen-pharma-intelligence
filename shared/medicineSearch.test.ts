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
});
