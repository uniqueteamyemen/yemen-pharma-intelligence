import { describe, expect, it } from "vitest";
import {
  getMedicineSearchMatch,
  medicineMatchesQuery,
  medicineSearchRank,
  normalizeMedicineSearch,
  rankMedicinesBySearch,
} from "./medicineSearch";

const amoxicillin = {
  brandName: "Amoxicillin",
  genericName: "Amoxicillin",
  genericNameAr: "أموكسيسيلين",
  dosageForm: "Capsule",
  strength: "500mg",
};

const paradol = {
  brandName: "Paracetamol",
  genericName: "Paracetamol",
  genericNameAr: "باراسيتامول",
  dosageForm: "Tablet",
  strength: "500mg",
  tradeNames: [{
    tradeName: "Paradol",
    scientificName: "Paracetamol",
    activeIngredients: "Paracetamol 500mg",
    manufacturer: "Shaphaco",
  }],
};

describe("unified bilingual medicine recognition", () => {
  it("normalizes Arabic Alef variants for type-ahead queries", () => {
    expect(normalizeMedicineSearch("أمو")).toBe("امو");
    expect(medicineMatchesQuery(amoxicillin, "امو")).toBe(true);
  });

  it("recognizes complete and incomplete scientific names", () => {
    expect(medicineMatchesQuery(amoxicillin, "Amoxicillin")).toBe(true);
    expect(medicineMatchesQuery(amoxicillin, "Amoxi")).toBe(true);
    expect(medicineMatchesQuery(amoxicillin, "اموكس")).toBe(true);
  });

  it("recognizes a conservative typo in a scientific name but rejects unrelated text", () => {
    expect(getMedicineSearchMatch(amoxicillin, "Amoxcillin").kind).toBe("typo");
    expect(medicineMatchesQuery(amoxicillin, "CompletelyUnknownMedicine")).toBe(false);
  });

  it("recognizes complete, incomplete, and slightly misspelled trade names", () => {
    expect(getMedicineSearchMatch(paradol, "Paradol").kind).toBe("exact");
    expect(medicineMatchesQuery(paradol, "Para")).toBe(true);
    expect(getMedicineSearchMatch(paradol, "Paradlo").kind).toBe("typo");
  });

  it("uses strength as a ranking bonus rather than a requirement for trade-name recognition", () => {
    const withoutStrength = medicineSearchRank(paradol, "Paradol");
    const withStrength = medicineSearchRank(paradol, "Paradol 500");
    expect(withStrength).toBeGreaterThan(withoutStrength);
    expect(medicineMatchesQuery(paradol, "Paradol 250")).toBe(true);
  });

  it("ranks direct name recognition above incidental manufacturer context", () => {
    const incidental = { ...amoxicillin, manufacturer: "Amoxicillin Supplies" };
    expect(medicineSearchRank(amoxicillin, "Amoxi")).toBeGreaterThan(medicineSearchRank(incidental, "Supplies"));
  });

  it("keeps potentially ambiguous formulation records as separate ordered options", () => {
    const suppository = { ...paradol, dosageForm: "Suppository", strength: "250mg" };
    const ranked = rankMedicinesBySearch([suppository, paradol], "Paradol");
    expect(ranked).toHaveLength(2);
    expect(ranked.map((record) => record.dosageForm)).toContain("Tablet");
    expect(ranked.map((record) => record.dosageForm)).toContain("Suppository");
  });
});
