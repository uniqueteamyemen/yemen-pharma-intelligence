# Yemen Trade-Name Integration — 2018–2019

## Scope and boundary

This internal layer supports **search and name-based matching only**. It does not alter, replace, or expand the canonical National Essential Medicines List (NEML) catalog, and it must not be described in the user interface as current official registration data.

The source files are user-provided CSV extractions from the **Yemen Drug Products Directory (2018–2019)**. The final extracted file is the primary import source because it includes package and dose context; the master file is used only as a complementary verification source for manufacturer and country values.

| Source quality measure | Master file | Final extracted file |
|---|---:|---:|
| Usable product rows | 943 | 987 |
| Distinct trade names | 776 | 776 |
| Rows with multi-ingredient compositions | 213 | 222 |
| Comparable product keys shared by both files | 925 | 925 |

## Data model

The `drug_trade_names` table is a separate historical reference layer. It has an optional `drugId` foreign key to the existing `drugs` catalog, rather than creating new canonical medicines or modifying NEML rows.

| Field | Purpose |
|---|---|
| `tradeName` | Trade name exactly as extracted from the supplied directory. |
| `scientificName` | A concise scientific label derived from the source composition. |
| `activeIngredients` | The source composition, retaining one or more active ingredients and their stated strengths or ratios. |
| `dosageForm`, `package`, `manufacturer`, `manufacturerCountry` | Product context retained from the supplied CSVs where structurally reliable. |
| `drugId` | Canonical NEML record only when the active-ingredient set, dosage form, and strength can be linked safely. |
| `matchStatus` | `linked`, `ambiguous`, or `unlinked`; unlinked records remain auditable but cannot affect canonical search or matching. |

## Safe linking policy

Automatic linking requires the same complete set of active ingredients. When the catalog has differentiating data, the dosage form and strength must also be compatible. The importer never maps a multi-ingredient product to a canonical record containing just one of its ingredients.

This conservative rule protects matching integrity. Products outside the essential-medicine catalog, rows whose formulation differs, and records with multiple valid candidate formulations remain review records rather than being guessed into the catalog.

| Import outcome | Records |
|---|---:|
| Imported historical trade-name rows | 987 |
| Safely linked to a canonical NEML record | 125 |
| Ambiguous candidates retained for review | 10 |
| Unlinked historical records retained for review | 852 |

## Search and matching behavior

The live search returns the **canonical scientific catalog record**. For linked references, the search normalizes and searches the trade name, scientific name, active-ingredient composition, and manufacturer in addition to the canonical catalog fields. A search for `Amol`, for example, returns its linked canonical **Paracetamol** record rather than creating a separate medicine entry.

For name-based matching, free-text names are resolved through the same linked trade-name layer. A free-text trade name matches a catalog-linked offer or request only when both resolve to the same canonical `drugId`. Mixed free-text/catalog records that cannot be resolved receive no name match. This removes the former blanket partial match for mixed entries. Contextual location and urgency remain secondary, and the overall score is capped at 100%.

The supplied trade-name files contain no dedicated Arabic trade-name column, so `tradeNameAr` is intentionally left empty. Arabic type-ahead continues to work for the Arabic scientific names already present in the canonical NEML catalog; it does not transliterate or invent Arabic trade-name aliases. At the time of this import, 43 of the 742 active canonical rows have an existing Arabic scientific-name value. Any future Arabic trade-name mapping must come from a reviewed source rather than automated translation.

The implementation was verified through the public search API for the linked trade name `Amol`, the active-ingredient query `Paracetamol 500`, and the existing Arabic scientific query `أموكسيسيلين`. The live name-resolution check confirmed `Amol` and `Paracetamol` share canonical records, while `Amol` and `Amoxicillin` do not; the accompanying unit tests also confirm that a contextual bonus cannot make a score exceed 100%.

Full authenticated acceptance of `runMatching()`—including offer/request creation and `matches` insertion—is intentionally deferred until the agreed real-account test date. The owner-facing scenario, preconditions, assertions, and cleanup boundary are documented in `TRADE_NAME_MATCHING_ACCEPTANCE_SCENARIO.md`; no dummy users or operational records are created to simulate it.

## Re-import and review

The importer is idempotent through a stable `sourceKey` and may be run in dry-run mode before any update.

```bash
node scripts/import-yemen-trade-names.mjs
node scripts/import-yemen-trade-names.mjs --apply
```

The current dry-run review is written to `/home/ubuntu/exports/yemen_trade_name_import_review_2018_2019.json`. Review the `ambiguous` and `unlinked` entries before introducing any future synonym rules. Do not relax the complete-active-ingredient requirement without a documented clinical and data-governance decision.
