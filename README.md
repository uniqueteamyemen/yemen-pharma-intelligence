# Yemen Pharma Intelligence (PharmaYemen)

**Pharmaceutical security through market intelligence.**

PharmaYemen is a non-commercial Market Intelligence Platform designed for Yemen's pharmaceutical market. It connects supply and demand across verified pharmacies, hospitals, distributors, and clinics to detect shortages, identify surpluses, surface invisible inventory, and map viable alternatives.

**Important Note:** This is an intelligence and matching platform, not an e-commerce storefront. It does not handle retail sales, payments, or commercial transactions.

---

## 🎯 Core Objectives

- **Visibility:** Make supply and demand visible to verified healthcare entities.
- **Security:** Identify critical medicine shortages and locate emergency surpluses.
- **Alternatives:** Map trade names to their canonical scientific (NEML) equivalents to surface safe alternatives when specific brands are unavailable.
- **Data Integrity:** Preserve the canonical National Essential Medicines List (NEML) while supporting flexible, error-tolerant trade-name recognition.

## ✨ Key Features

- **Bilingual Interface:** Full Arabic (RTL) and English (LTR) support across all user journeys.
- **Unified Medicine Recognition:** A robust, fuzzy-search engine that resolves trade names, scientific names, and active ingredients (including typos and incomplete inputs) to canonical catalog records.
- **Contextual Entry:** Offers and Requests use a single, unified medicine-name field. Users receive contextual dropdown suggestions (with loading states) to aid identification.
- **Safe Matching:** Explicitly selecting a suggestion saves the canonical `drugId`. Submitting without selection preserves the input as free text, ensuring the platform never invents or forces incorrect catalog records.
- **Strict Data Governance:** The matching engine relies on 100% name-match constraints to prevent false positives, while the recognition engine supports flexible typo allowances.

## 🛠 Tech Stack

- **Frontend:** React 19, Vite, Tailwind CSS 4, shadcn/ui
- **Backend:** Express 4, tRPC 11
- **Database:** TiDB (MySQL), Drizzle ORM
- **Authentication:** Manus OAuth

## 🚀 Development & Setup

This project uses `pnpm` as its package manager.

```bash
# Install dependencies
pnpm install

# Start development server
pnpm run dev

# Run unit tests
pnpm test

# Run TypeScript checks
pnpm run check

# Build for production
pnpm run build
```

## 📁 Project Structure

- `client/`: React frontend (Pages, Components, Contexts)
- `server/`: Express backend, tRPC routers, and database helpers
- `shared/`: Shared types and unified medicine recognition/matching logic
- `drizzle/`: Database schema and migrations
- `scripts/`: Verification and simulation scripts for medicine recognition

## 🛡 Medicine Name Reference Integration

The platform includes a custom, reusable skill for integrating trade names safely:
- **Separation of Concerns:** Trade names are stored as reference aliases (`tradeNames` JSON or separate table) and never overwrite canonical scientific records.
- **Deterministic Ranking:** Suggestions are ranked by exact match, prefix match, contained match, and conservative typo match. Strengths act as a ranking bonus, not a prerequisite.
- **Ambiguity Handling:** If a trade name maps to multiple distinct canonical formulations, it is marked as `ambiguous` and requires manual review rather than algorithmic guessing.

---
*Built for Yemen's pharmaceutical security.*
