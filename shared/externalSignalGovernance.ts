export type ExternalSignalReviewStatus = "pending" | "auto_approved";

/**
 * A source setting is operational and reversible. It is deliberately not a
 * permanent source-trust classification.
 */
export function determineExternalSignalReviewStatus(autoApproveSignals: boolean): ExternalSignalReviewStatus {
  return autoApproveSignals ? "auto_approved" : "pending";
}

export function externalSignalNeedsAdminReview(status: ExternalSignalReviewStatus): boolean {
  return status === "pending";
}
