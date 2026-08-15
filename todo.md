# Project TODO

- [x] Extract medicine records from the 2019 and 2022 Yemen National Essential Medicines List source files.
- [x] Normalize medicine names, strengths, dosage forms, and categories into one canonical catalog.
- [x] Preserve 2019/2022 source provenance and resolve duplicate entries.
- [x] Import the unified medicine catalog into the application database.
- [x] Validate catalog data in the platform and document the import results.
- [x] Audit and correct malformed medicine names, strengths, dosage forms, and source section labels from PDF extraction.
- [x] Run duplicate and near-duplicate quality checks and document their resolution.
- [x] Verify representative 2019 and 2022 records through the Drugs API and interface.
- [x] Verify 2019-only, 2022-only, and shared medicines through the Drugs API and record the exact sample results.
- [x] Fix Vite HMR WebSocket connection failure in the managed preview URL.

# Localization and Bilingual Search

- [ ] Inspect and extend the existing localization architecture without creating a parallel system.
- [ ] Make Arabic the default language with persisted Arabic/English switching and RTL/LTR support.
- [ ] Localize all visible platform UI strings, validation, notifications, authentication, dashboards, catalog, and onboarding.
- [ ] Add Arabic medicine-name mappings without changing canonical medicine keys or duplicating catalog records.
- [ ] Implement shared Arabic/English search normalization in API and frontend.
- [ ] Audit catalog integrity and test Arabic/English responsive behavior before delivery.
