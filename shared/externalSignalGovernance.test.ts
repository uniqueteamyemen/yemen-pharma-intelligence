import { describe, expect, it } from "vitest";
import { determineExternalSignalReviewStatus, externalSignalNeedsAdminReview } from "./externalSignalGovernance";

describe("external signal governance", () => {
  it("keeps a new source observation pending when automatic acceptance is not enabled", () => {
    const status = determineExternalSignalReviewStatus(false);
    expect(status).toBe("pending");
    expect(externalSignalNeedsAdminReview(status)).toBe(true);
  });

  it("uses an explicit and reversible automatic-acceptance setting without claiming permanent trust", () => {
    const status = determineExternalSignalReviewStatus(true);
    expect(status).toBe("auto_approved");
    expect(externalSignalNeedsAdminReview(status)).toBe(false);
  });
});
