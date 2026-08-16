/** Returns true only when both name-resolution paths identify at least one identical canonical record. */
export function canonicalDrugIdsMatch(leftIds: number[], rightIds: number[]): boolean {
  return leftIds.some((id) => rightIds.includes(id));
}

/** Keeps contextual bonuses informative without allowing any match score above 100%. */
export function calculateCappedMatchScore(drugMatch: number, locationMatch: number, urgencyScore: number): number {
  return Math.min(100, drugMatch + (locationMatch * 0.1) + (urgencyScore * 0.05));
}
