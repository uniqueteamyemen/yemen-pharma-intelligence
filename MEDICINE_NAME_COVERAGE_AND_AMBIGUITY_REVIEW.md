# Medicine Name Coverage and Ambiguity Review

## Review boundary

This review uses the current internal catalog, the user-provided 2018–2019 trade-name extraction, and the supplied 2019/2022 NEML text files. It makes **no database change**: no canonical medicine is changed, no Arabic name is invented, and none of the ten ambiguous trade-name records receives a guessed `drugId`.

## Arabic scientific-name coverage

The active canonical catalog contains **742** records. Of these, **43** have a non-empty `genericNameAr` stored in the database.

| NEML provenance | Catalog records | Rows with stored Arabic scientific name |
|---|---:|---:|
| 2019 | 117 | 9 |
| 2019 and 2022 | 261 | 18 |
| 2022 | 358 | 16 |
| Unspecified legacy rows | 6 | 0 |
| **Total** | **742** | **43** |

The supplied NEML text files contain Arabic material, but their PDF extraction is not a reliable record-by-record Arabic-to-English medicine mapping for the remaining catalog. It includes cover pages, narratives, headings, layout artefacts, and unstructured Arabic text. Therefore, bulk extraction or automatic translation would risk creating unverified aliases.

The platform continues to recognize the 43 stored Arabic scientific names, including their standard Alef and diacritic variants. A future expansion must use a reviewed official Arabic table that maps each Arabic name to a specific canonical `catalogKey` or `drugId`; it must not use machine translation as a source of medical identity.

## Manual review of the ten ambiguous trade-name rows

Each row remains `ambiguous` and unlinked. The table records the evidence available in the imported row and the review outcome; recommendations are **not** applied automatically.

| Trade name | Source evidence | Candidate canonical records | Manual review outcome |
|---|---|---|---|
| ALBEX | Albendazole 400mg; package says chewable tablet | `120018`, `120019` | `120019` is the closest form, but the catalog retains overlapping Albendazole 400mg records. Keep ambiguous until canonical duplicate policy is reviewed. |
| BEZOL 400 | Albendazole 400mg tablet | `120018`, `120019` | Same overlapping 400mg candidates; no safe automatic choice. |
| Bone-vit | CSV columns are malformed around calcium/Vitamin D3 | `120094`, `120095`, `120096` | Source row is structurally corrupted, so its active ingredients and form cannot be reconstructed safely. Keep unlinked. |
| Captopril | Captopril 25mg tablet | `120104`, `120105` | Both candidates represent Captopril 25mg tablets with duplicate/near-duplicate catalog representation. Keep ambiguous. |
| DWAPRIL | Captopril 25mg tablet | `120104`, `120105` | Same candidate conflict as Captopril. Keep ambiguous. |
| Diazepam | Ampoules; package `5 amp × 2mL` | `120208`, `120209`, `120211` | `120208` is closest to 5mg/mL in a 2mL ampoule, but multiple overlapping injection records remain. Keep ambiguous pending duplicate review. |
| Malartam | Artemether 20mg + Lumefantrine 120mg tablet | `120053`, `120054` | `120053` is closest to the full combination, while `120054` contains incomplete strength data. Do not auto-link while both canonical records exist. |
| Moxalin | Amoxicillin dry syrup, 100mL; no strength | `120036`, `120038` | Concentration is required to distinguish oral-liquid/suspension records. Keep ambiguous. |
| Normalax | Lactulose syrup, 100mL; no strength | `120415`, `120416` | Concentration is required to distinguish 3.1–3.7g/5mL and 3.7g/5mL. Keep ambiguous. |
| Rafamox Syrup | Amoxicillin dry syrup, 80mL; no strength | `120036`, `120038` | Concentration is absent, so no safe formulation-level link exists. Keep ambiguous. |

## Decision

The ambiguity rule remains correct: a known trade name may assist a user’s search, but it must not become a canonical formulation reference unless the complete ingredient set, form, and strength establish one unambiguous target. The review identifies useful follow-up evidence, but it does not convert any of these ten records into live search or matching aliases.
