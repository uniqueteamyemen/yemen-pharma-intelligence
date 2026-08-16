import { describe, expect, it } from "vitest";
import { calculateCappedMatchScore, canonicalDrugIdsMatch } from "./medicineMatching";

describe("canonical medicine-name matching", () => {
  it("matches only when two resolved names share a canonical catalog record", () => {
    expect(canonicalDrugIdsMatch([120557], [120557])).toBe(true);
    expect(canonicalDrugIdsMatch([120557], [120037])).toBe(false);
    expect(canonicalDrugIdsMatch([], [120557])).toBe(false);
  });

  it("caps contextual bonuses at 100 percent", () => {
    expect(calculateCappedMatchScore(100, 100, 100)).toBe(100);
    expect(calculateCappedMatchScore(100, 0, 25)).toBe(100);
    expect(calculateCappedMatchScore(0, 100, 100)).toBe(15);
  });
});
