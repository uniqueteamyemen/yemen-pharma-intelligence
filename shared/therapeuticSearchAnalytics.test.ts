import { describe, expect, it } from "vitest";
import { isTrackedTherapeuticSearchCategory, therapeuticSearchCategories, therapeuticSearchContexts } from "./therapeuticSearchAnalytics";

describe("therapeutic search analytics", () => {
  it("tracks only persisted therapeutic categories, never the all-categories UI option", () => {
    expect(therapeuticSearchCategories).toContain("antibiotics");
    expect(isTrackedTherapeuticSearchCategory("antibiotics")).toBe(true);
    expect(isTrackedTherapeuticSearchCategory("all")).toBe(false);
  });

  it("uses a small fixed set of anonymous interaction contexts", () => {
    expect(therapeuticSearchContexts).toEqual(["catalog", "offer", "request"]);
  });
});
