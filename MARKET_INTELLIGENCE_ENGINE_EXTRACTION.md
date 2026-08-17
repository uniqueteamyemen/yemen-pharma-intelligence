# Market Intelligence Engine Extraction

## Purpose

The reusable analytical core of the administrative market-intelligence dashboard has been extracted into a separate project. The extraction does **not** remove, replace, or modify the working PharmaYemen dashboard. This platform remains the domain integration that supplies pharmaceutical offers, requests, drug labels, governorates, user identities, database persistence, and the authenticated administrative interface.

The private standalone repository is available at [uniqueteamyemen/market-intelligence-engine](https://github.com/uniqueteamyemen/market-intelligence-engine).

## Extracted responsibilities

| Capability | Generic engine representation |
|---|---|
| Active offers and open requests | Pre-filtered `activeSupply` and `activeDemand` records. |
| Governorates | Generic `locations`. |
| Drugs and formulations | Generic `items`. |
| Demand pressure | `max(0, demandCount - supplyCount)` per location and item. |
| External sources | Generic `externalSources` with platform, URL, activity, and reversible automatic acceptance. |
| External signals | Generic `externalSignals` with evidence, severity, confidence, review state, and optional item/location references. |
| Review workflow | Pending, approved, rejected, and automatically accepted counts, plus the reversible initial-status rule. |

## Deliberately retained in PharmaYemen

The following concerns remain specific to this platform and were intentionally not copied into the generic core: the Drizzle queries joining `offers`, `requests`, `drugs`, `entities`, and `governorates`; tRPC authorization; administrator notification delivery; medicine-name recognition; route registration; bilingual product language; and the dashboard’s project-specific components.

> External observations continue to be isolated from internal offer and request metrics until an administrator reviews them. Automatic acceptance is an explicit setting that can be disabled; it is not a permanent trust classification.

## Verification boundary

The standalone project has equivalent unit coverage for pressure aggregation, review-status counting, source ordering, and reversible automatic acceptance. PharmaYemen is separately verified through its existing test suite, TypeScript check, and production build so the extraction remains non-invasive.

## Verified repository state

| Repository | Branch and commit | Verification |
|---|---|---|
| [PharmaYemen](https://github.com/uniqueteamyemen/yemen-pharma-intelligence/tree/feature/trade-name-integration-v2) | `feature/trade-name-integration-v2` at `3623ea6` | 21 unit tests passed, TypeScript check passed, and the production build passed. |
| [Market Intelligence Engine](https://github.com/uniqueteamyemen/market-intelligence-engine) | `master` at `a06a8c1` | 3 unit tests passed, TypeScript check passed, and the library build passed. |

Both repositories are private. The generic engine contains no PharmaYemen runtime import, no pharmaceutical record, and no hard-coded domain terminology in its analytical API.
