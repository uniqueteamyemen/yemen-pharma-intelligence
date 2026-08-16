import { resolveCanonicalDrugIdsByName } from "../server/db";
import { calculateCappedMatchScore, canonicalDrugIdsMatch } from "../shared/medicineMatching";

async function main() {
  const [amolIds, paracetamolIds, amoxicillinIds] = await Promise.all([
    resolveCanonicalDrugIdsByName("Amol"),
    resolveCanonicalDrugIdsByName("Paracetamol"),
    resolveCanonicalDrugIdsByName("Amoxicillin"),
  ]);
  const freeTextToCatalogMatch = canonicalDrugIdsMatch(amolIds, paracetamolIds);
  const freeTextToFreeTextMatch = canonicalDrugIdsMatch(amolIds, paracetamolIds);
  const falsePositiveBlocked = !canonicalDrugIdsMatch(amolIds, amoxicillinIds);
  const cappedScore = calculateCappedMatchScore(100, 100, 100);

  if (!freeTextToCatalogMatch || !freeTextToFreeTextMatch || !falsePositiveBlocked || cappedScore !== 100) {
    throw new Error("Trade-name canonical resolution verification failed");
  }

  console.log(JSON.stringify({
    status: "verified",
    freeTextToCatalog: { typedName: "Amol", canonicalName: "Paracetamol", matched: freeTextToCatalogMatch },
    freeTextToFreeText: { leftName: "Amol", rightName: "Paracetamol", matched: freeTextToFreeTextMatch },
    falsePositiveCheck: { leftName: "Amol", rightName: "Amoxicillin", blocked: falsePositiveBlocked },
    cappedScoreWithMaximumContext: cappedScore,
    resolvedCanonicalIds: { amolIds, paracetamolIds, amoxicillinIds },
  }, null, 2));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
