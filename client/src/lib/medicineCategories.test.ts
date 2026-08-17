import { describe, expect, it } from "vitest";
import { therapeuticCategories, therapeuticCategoryLabel } from "./medicineCategories";

describe("therapeutic medicine categories", () => {
  it("includes the all-categories option and stored medicine categories", () => {
    expect(therapeuticCategories.map((item) => item.value)).toEqual(expect.arrayContaining([
      "all", "antibiotics", "analgesics", "cardiovascular", "vitamins", "other",
    ]));
  });

  it("renders Arabic and English labels without changing stored category keys", () => {
    expect(therapeuticCategoryLabel("antibiotics", "ar")).toBe("مضادات حيوية");
    expect(therapeuticCategoryLabel("antibiotics", "en")).toBe("Antibiotics");
    expect(therapeuticCategoryLabel("unmapped", "ar")).toBe("unmapped");
  });
});
