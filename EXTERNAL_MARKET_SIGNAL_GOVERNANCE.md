# External Market Signal Governance

## Purpose

External observations from permitted Telegram channels, Facebook pages, websites, or other sources may help the internal market-intelligence team detect reports of **shortage**, **rare medicines**, and **demand**. They are not equivalent to verified offers, requests, inventory, or national market facts.

## Current approval rule

Every newly ingested external observation receives one of two operational outcomes.

| Source setting at ingestion | Result | Effect on internal demand/supply metrics |
|---|---|---|
| Manual review | `pending` and an in-app notification is created for each administrator | None until an administrator explicitly approves or rejects it. |
| Reversible automatic acceptance | `auto_approved` | Recorded as an external observation; it remains separate from internal offer/request metrics. |

An administrator can pause a source or disable automatic acceptance at any time. Neither setting claims that a source is permanently trustworthy.

## Evidence and audit fields

Each observation retains its source, external reference, evidence URL when available, raw summary, reported time, drug reference or free-text name, governorate when known, confidence, review result, reviewer, review time, and review note. The system does not create an external observation from invented market data.

## Future source lifecycle

The next governance expansion should replace the current reversible operational toggle with an audited source-lifecycle model:

| Future lifecycle state | Intended meaning |
|---|---|
| `trusted` | The administrator currently permits automatic handling under documented conditions. |
| `suspended` | Collection and automatic handling are paused while the source is reviewed. |
| `revoked` | The source must not be collected or automatically handled unless explicitly re-authorized. |

That future expansion must include a source-status change history with administrator, timestamp, reason, and prior state. It is documented here as a design rule and is intentionally **not** introduced as a data migration in this iteration.

## Automation boundary

The dashboard and governance layer are ready for real sources, but no Telegram, Facebook, or website is connected yet. Automated collection may begin only after the administrator supplies an authorized source list and the appropriate official access method is verified. Until then, the dashboard must show real internal platform metrics and honest empty states for external observations.
