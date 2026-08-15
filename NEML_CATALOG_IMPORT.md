# Unified Yemen NEML Medicine Catalog

## Purpose

The platform now uses one searchable essential-medicines catalog derived from the Yemen National Essential Medicines List, Sixth Edition (2019), and the Seventh Edition (2022). Each imported formulation retains the therapeutic heading extracted from its source and the edition or editions in which it appears.

| Metric | Result |
|---|---:|
| Extracted source rows from the 2019 list | 255 |
| Extracted source rows from the 2022 list | 585 |
| Source rows considered during unification | 840 |
| Active normalized catalog records imported | 742 |
| Catalog records carrying both NEML edition labels | 261 |
| Provenance records saved in `drug_sources` | 997 |

## Data Model

The `drugs` table is the platform's single operational catalog. NEML records use a stable `catalogKey` built from the normalized generic name, dosage form, and strength. The original NEML section is retained in `nemlCategory`, while `sourceYears` makes the edition coverage visible to the user interface.

The `drug_sources` table stores auditable source provenance for every imported record. It records the NEML edition, document title, and extracted line reference. This keeps the catalog operationally simple while retaining traceability to the supplied documents.

## Normalization Rules

The importer treats a medicine formulation as unique when its normalized **generic name**, **dosage form**, and **strength** match. It removes only PDF-layout artifacts, such as presentation spacing and trailing VEN classification markers. It does not infer manufacturers, brands, Arabic names, or therapeutic alternatives that are absent from the supplied lists.

Where the same formulation appears in both editions, one catalog record is retained and labelled `2019,2022`. A source row that could not be represented cleanly as a medicine formulation is excluded rather than guessed.

## Re-running the Import

The extraction and import tools are stored in `data-sources/neml/`. The import script is idempotent because it upserts on `catalogKey` and upserts provenance on the medicine-and-edition pair.

```bash
node data-sources/neml/extract-neml.mjs
node data-sources/neml/import-neml-catalog.mjs
node data-sources/neml/import-neml-catalog.mjs --apply
```

The first import command is a dry run. The `--apply` form writes the catalog to the database.

## Validation

The normalization test suite covers category mapping, PDF-artifact cleanup, and source-verified corrections for split rows. Type checking also passes after the schema and UI updates. The platform's **Drugs** page was verified in the browser: it displays the imported count, NEML edition badge, platform category, and original national-list section for each record.

The public `drugs.search` API was also checked against a representative record from each source-coverage case.

| Coverage case | Search term | Normalized medicine returned | Form and strength | Expected source badge |
|---|---|---|---|---|
| 2019 only | `Abacavir` | Abacavir + Lamivudine | Tablet; 60mg + 30mg; 120mg + 60mg | NEML 2019 |
| 2022 only | `Abiraterone` | Abiraterone | Tablet; 250mg | NEML 2022 |
| Both editions | `Acetazolamide` | Acetazolamide | Tablet; 250mg | NEML 2019,2022 |

## Sources

[1] [Yemen National Essential Medicines List, Sixth Edition (2019)](data-sources/neml/yemen_neml_2019.txt)

[2] [List of Essential Medicines in Yemen, Seventh Edition (2022)](data-sources/neml/yemen_neml_2022.txt)
