import { describe, expect, it } from "vitest";
import { buildMedicineEntryPayload } from "./medicineEntry";

describe("contextual medicine-name entry", () => {
  it("uses a catalog ID only after the user explicitly selects a suggestion", () => {
    expect(buildMedicineEntryPayload("Paradol 500", "120557")).toEqual({
      isFreeText: false,
      drugId: 120557,
    });
  });

  it("preserves a typed name as free text when no suggestion is selected", () => {
    expect(buildMedicineEntryPayload("Paradlo", "")).toEqual({
      isFreeText: true,
      freeTextName: "Paradlo",
    });
  });

  it("rejects an empty medicine-name input", () => {
    expect(buildMedicineEntryPayload("   ", "120557")).toBeNull();
  });
});
