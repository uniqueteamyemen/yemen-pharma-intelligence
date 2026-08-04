# Matching Engine - Complete Guide

## Overview

The Yemen Pharma Intelligence platform now features an **intelligent automatic matching engine** that connects supply (offers) with demand (requests) based on drug names, with bonus points for location and urgency.

## How It Works

### 1. Drug Name Matching (Primary Criteria)

The matching engine automatically creates matches when:

- **Exact drug ID match**: An offer and request for the same drug → **100% drug match**
- **Drug alternative match**: An offer for a drug with a known alternative to the requested drug → **100% drug match**
- **Free-text match**: Both offer and request use free-text names and the names match (exact or partial) → **100% drug match**

**Key Point**: Quantity is NO LONGER a requirement for matching. A match is created regardless of quantity.

### 2. Bonus Scoring

Once a drug name match is found, the score is enhanced by:

| Factor | Points | When |
|--------|--------|------|
| **Location Bonus** | +10 | Same city (100%), same governorate (70%), same region (40%) |
| **Urgency Bonus** | +5 | Based on request urgency level (low/medium/high/critical) |

### 3. Match Score Calculation

```
Match Score = Drug Match (100) + Location Bonus (0-10) + Urgency Bonus (0-5)
Range: 100-115 (displayed as 100-115%)
```

### 4. Automatic Notifications

When a match is created:

- **Request creator** receives notification: "Your request matched with a new offer (XXX% match)"
- **Offer creator** receives notification: "Your offer matched with a new request (XXX% match)"

If location bonus is applied, the notification includes: "in the same region"

## Workflow

### Step 1: Create an Offer

1. Navigate to **Offers** page
2. Click **Create Offer**
3. Select drug or enter free-text name
4. Enter quantity and other details
5. Click **Submit**

**What happens automatically:**
- Matching engine searches all open requests
- Creates matches for any requests with the same drug name
- Sends notifications to matching request creators

### Step 2: Create a Request

1. Navigate to **Requests** page
2. Click **Create Request**
3. Select drug or enter free-text name
4. Enter quantity, urgency, and other details
5. Click **Submit**

**What happens automatically:**
- Matching engine searches all active offers
- Creates matches for any offers with the same drug name
- Sends notifications to matching offer creators

### Step 3: View Matches

1. Navigate to **Matches** page
2. Select **My Offers** or **My Requests** tab
3. Click on a specific offer/request to view its matches
4. Click **Find Matches** button to refresh

### Step 4: Accept or Reject

For each match:

- **Accept**: Creates a conversation between the two entities. Contact details are revealed only after mutual acceptance.
- **Reject**: Hides the match from your view.

## Match Score Interpretation

| Score | Meaning | Color |
|-------|---------|-------|
| 100% | Perfect drug name match | Green |
| 105-110% | Drug match + location bonus | Blue |
| 110-115% | Drug match + location + urgency bonus | Yellow |

## Example Scenarios

### Scenario 1: Simple Drug Match

**Offer**: Panadol 500mg, 50 boxes, Sana'a
**Request**: Panadol 500mg, 10 boxes, Aden

**Result**: 
- Drug Match: 100%
- Location Bonus: 0% (different cities)
- **Total Score: 100%** ✓ Match Created

### Scenario 2: Drug Match + Location Bonus

**Offer**: Amoxicillin 250mg, 100 tablets, Sana'a
**Request**: Amoxicillin 250mg, 50 tablets, Sana'a

**Result**:
- Drug Match: 100%
- Location Bonus: +10% (same city)
- **Total Score: 110%** ✓ Match Created

### Scenario 3: Alternative Drug Match

**Offer**: Ibuprofen 400mg (alternative to Paracetamol)
**Request**: Paracetamol 500mg

**Result**:
- Drug Match: 100% (recognized as alternative)
- Location Bonus: Depends on location
- **Total Score: 100%+** ✓ Match Created

### Scenario 4: No Match (Different Drugs)

**Offer**: Amoxicillin 250mg
**Request**: Ciprofloxacin 500mg

**Result**:
- Drug Match: 0% (different drugs, no alternative)
- **Total Score: 0%** ✗ No Match

## Database Schema

### Matches Table

```sql
CREATE TABLE matches (
  id INT PRIMARY KEY AUTO_INCREMENT,
  offerId INT NOT NULL,
  requestId INT NOT NULL,
  matchScore VARCHAR(10),           -- e.g., "110.5"
  drugMatchScore VARCHAR(10),       -- 0, 50, or 100
  locationMatchScore VARCHAR(10),   -- 0, 40, 70, or 100
  urgencyMatchScore VARCHAR(10),    -- 0-100 based on urgency
  quantityMatchScore VARCHAR(10),   -- Always 0 now (not used)
  status ENUM('suggested', 'accepted', 'rejected') DEFAULT 'suggested',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (offerId) REFERENCES offers(id),
  FOREIGN KEY (requestId) REFERENCES requests(id)
);
```

## API Endpoints

### Get Matches for an Offer

```typescript
trpc.matching.byOffer.useQuery({ offerId: 123 })
```

### Get Matches for a Request

```typescript
trpc.matching.byRequest.useQuery({ requestId: 456 })
```

### Run Matching Manually

```typescript
trpc.matching.run.useMutation({ offerId: 123 })
```

### Accept a Match

```typescript
trpc.matching.accept.useMutation({ matchId: 789 })
```

### Reject a Match

```typescript
trpc.matching.reject.useMutation({ matchId: 789 })
```

## Code Changes Summary

### 1. Database Layer (`server/db.ts`)

**Function**: `runMatching(offerId: number)`

**Changes**:
- Drug name is now the PRIMARY matching criteria
- Removed quantity requirement
- Location and urgency are now BONUSES only
- Simplified scoring: `drugMatch + (locationBonus * 0.1) + (urgencyBonus * 0.05)`
- Match created if `drugMatch >= 50` (no minimum total score)

### 2. API Layer (`server/routers.ts`)

**Offer Creation**:
- Automatically runs matching when offer is created
- Creates notifications for all matching requests (no minimum score threshold)

**Request Creation**:
- Searches all active offers and runs matching for each
- Creates notifications for all matching offers (no minimum score threshold)

### 3. UI Layer (`client/src/pages/dashboard/Matches.tsx`)

**Improvements**:
- Added "How Matching Works" info card
- Separated "My Offers" and "My Requests" tabs
- Better visual feedback for match scores
- Improved match details display with breakdown of scores
- Loading states and empty states
- Responsive design for mobile

## Testing the Matching Engine

### Test Case 1: Create Offer → Find Matching Request

1. Create **Offer**: Panadol 500mg, 50 boxes
2. Create **Request**: Panadol 500mg, 10 boxes (different entity)
3. Go to **Matches** → **My Offers** → Select the offer
4. **Expected**: Should show 1 match with 100%+ score

### Test Case 2: Create Request → Find Matching Offer

1. Create **Offer**: Amoxicillin 250mg, 100 tablets (different entity)
2. Create **Request**: Amoxicillin 250mg, 50 tablets
3. Go to **Matches** → **My Requests** → Select the request
4. **Expected**: Should show 1 match with 100%+ score

### Test Case 3: Location Bonus

1. Create **Offer**: Ibuprofen 400mg in Sana'a (same city as your entity)
2. Create **Request**: Ibuprofen 400mg in Sana'a
3. Go to **Matches** → View the match
4. **Expected**: Score should be 110%+ (includes location bonus)

### Test Case 4: No Match (Different Drugs)

1. Create **Offer**: Ciprofloxacin 500mg
2. Create **Request**: Paracetamol 500mg
3. Go to **Matches** → View requests
4. **Expected**: No matches should appear

## Notifications

### Notification Types

- **Type**: `match_found`
- **Title**: "New Match Found"
- **Body**: Includes match score and location info
- **Related Entity**: The entity that created the matching offer/request

### Notification Triggers

1. **When offer is created**: Notify all matching request creators
2. **When request is created**: Notify all matching offer creators

### Viewing Notifications

Navigate to **Notifications** page to see all match alerts.

## Performance Considerations

### Matching Algorithm Complexity

- **Time Complexity**: O(n) where n = number of open requests/active offers
- **Trigger**: On every offer/request creation
- **Optimization**: Queries are indexed on drug IDs and status fields

### Database Indexes

```sql
CREATE INDEX idx_requests_status ON requests(status);
CREATE INDEX idx_offers_status ON offers(status);
CREATE INDEX idx_requests_drugId ON requests(drugId);
CREATE INDEX idx_offers_drugId ON offers(drugId);
CREATE INDEX idx_matches_offerId ON matches(offerId);
CREATE INDEX idx_matches_requestId ON matches(requestId);
```

## Future Enhancements

1. **Real-time Matching**: Use WebSocket for instant match notifications
2. **Advanced Filters**: Filter matches by price range, expiry date, etc.
3. **Bulk Matching**: Run matching for all offers/requests at once
4. **Match History**: Track accepted/rejected matches over time
5. **Matching Analytics**: Dashboard showing match success rates by drug/region
6. **AI-Powered Suggestions**: Machine learning to predict best matches

## Troubleshooting

### Matches Not Appearing

**Problem**: Created offer and request with same drug, but no match shows

**Solutions**:
1. Verify both entities are **verified** (not pending)
2. Check that drug names match exactly (case-insensitive)
3. Ensure entities are different (can't match own offer/request)
4. Try clicking "Find Matches" button manually

### Notifications Not Received

**Problem**: Match created but no notification received

**Solutions**:
1. Check **Notifications** page directly
2. Verify notification settings are enabled
3. Check browser console for errors
4. Refresh the page

### Wrong Match Score

**Problem**: Match score doesn't match expected calculation

**Solutions**:
1. Verify location match: Same city (100%), governorate (70%), region (40%)
2. Check urgency level: low (25%), medium (50%), high (75%), critical (100%)
3. Confirm drug match: 100% for exact/alternative, 50% for mixed types

## Support

For issues or questions about the matching engine:
1. Check this guide first
2. Review the code comments in `server/db.ts` (runMatching function)
3. Check browser console for error messages
4. Review server logs in `.manus-logs/devserver.log`

---

**Last Updated**: August 4, 2026
**Version**: 1.0.0
**Status**: ✅ Production Ready
