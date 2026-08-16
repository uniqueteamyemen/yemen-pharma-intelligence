# Unified Medicine Search and Recognition

## Scope

This change updates **search and recognition logic only**. It does not alter the canonical NEML catalog, the `drug_trade_names` reference layer, the ten ambiguous trade-name rows, or any existing name-to-catalog relationship.

## Recognition policy

All current search paths use the same shared ranking utility: the Drugs catalog, catalog selectors in Offers and Requests, free-text suggestions in Offers and Requests, and the Alternatives page.

| Input characteristic | Recognition behavior |
|---|---|
| Exact scientific or trade name | Highest-ranked result. |
| Incomplete name | Prefix and token-prefix matches are returned. |
| Small spelling variation | Conservative edit-distance matching begins at four characters and allows only 1–3 edits based on name length. |
| Arabic or English | Arabic normalization handles standard Alef variants and diacritics; matching uses only Arabic/English values already stored in the catalog or linked references. |
| Name with strength | The name still identifies the medicine; a matching strength raises that formulation in the ranking. |
| Name without strength | All stored formulations remain available as explicit options. |
| More than one viable formulation | The system shows ordered catalog options and requires the user to choose. It never silently selects a formulation. |
| No close candidate | The search reports no close stored name. In free text, the value remains free text and no medicine is invented. |

## Matching boundary

The matching engine retains its safe canonical-ID rule. A fuzzy suggestion does **not** automatically assign a catalog record to a free-text offer or request. The user must explicitly select a catalog option; otherwise the original text remains free text. This prevents an approximate lookup from creating a false market match.

## Verification results

The public `drugs.search` API and shared search utility were tested against actual imported records.

| Scenario | Query | Result |
|---|---|---|
| Correct scientific name | `Amoxicillin` | Returned stored Amoxicillin records. |
| Incomplete scientific name | `Amoxi` | Returned close Amoxicillin records. |
| Small scientific-name typo | `Amoxcillin` | Returned close Amoxicillin records. |
| Correct trade name | `Paradol` | Returned two stored Paradol formulations. |
| Incomplete trade name | `Para` | Returned ranked close stored options. |
| Small trade-name typo | `Paradlo` | Returned the stored Paradol options. |
| Arabic scientific-name typo | `اموكسسلين` | Returned stored Amoxicillin records. |
| Trade name with strength | `Paradol 500` | A stored 500-strength option ranked first; other close options remained available. |
| Trade name without strength | `Paradol` | Both stored formulations remained available for user choice. |
| Completely unrelated text | `Xylopharmzz` | Returned zero results. |

The full test suite passed with **15 unit tests**, TypeScript validation, a production build, API scenario verification, and a visual review of the authenticated catalog, offer, and request pages.
