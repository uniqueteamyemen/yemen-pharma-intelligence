# Trade-Name Matching Acceptance Scenario

## Test boundary

The platform currently has no approved authenticated test account or test entity data. In accordance with the agreed testing boundary, this scenario must be executed **after 25 August** by the platform owner using a real, authorized account. No fake users, pharmacies, offers, requests, or match records are created before that point.

The completed pre-authentication checks cover the same production code paths for trade-name resolution, public catalog search, score capping, and false-positive blocking. They do not create a `matches` row because that requires an authenticated verified entity and valid offer/request records.

## Preconditions

| Item | Required state |
|---|---|
| Account | Real authorized account signed in. |
| Entity | Approved entity able to create offers and requests. |
| Catalog reference | Use the canonical Paracetamol record returned after searching `Amol`; select the formulation that the search result identifies. |
| Cleanup | Close the acceptance-test offers and requests after verification. Do not use fabricated counterpart entities. |

## Scenario A — Free text trade name to canonical catalog

Create a request using free text `Amol`. Create an offer using the canonical catalog entry selected by the `Amol` search result. The offer creation flow must invoke `runMatching()` and create a record in `matches` for the new request and offer.

| Assertion | Expected result |
|---|---|
| Drug match | `drugMatchScore` is `100`. |
| Overall score | `matchScore` is at most `100`. |
| Match row | Exactly one row exists for the offer/request pair. |
| False linkage | Repeating the request name `Amol` against an `Amoxicillin` catalog offer must create no match. |

## Scenario B — Free text trade name to free text scientific name

Create one side with free text `Amol` and the other with free text `Paracetamol`. The name-resolution layer must resolve both to a shared canonical record and create one match. Repeat with `Amol` and `Amoxicillin`; no match must be created.

| Assertion | Expected result |
|---|---|
| Shared canonical resolution | `Amol` and `Paracetamol` resolve to at least one common `drugId`. |
| Correct match | One `matches` row is created with `drugMatchScore = 100`. |
| Blocked false positive | `Amol` and `Amoxicillin` create no row. |
| Score cap | A location and urgency bonus never raises `matchScore` above `100`. |

## Recorded pre-authentication verification

The documented checks before authenticated acceptance are as follows: the public API returns a canonical Paracetamol record for `Amol`; it returns a linked active-ingredient reference for `Paracetamol 500`; it returns the existing Arabic canonical record for `أموكسيسيلين`; and the verification script confirms `Amol`/`Paracetamol` overlap, blocks `Amol`/`Amoxicillin`, and returns a capped maximum score of `100`.
