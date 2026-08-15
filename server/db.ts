import { eq, and, or, like, desc, sql, gt, asc, ne } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser, users,
  entities, Entity,
  regions, Region,
  governorates, Governorate,
  cities, City,
  drugs, Drug,
  drugAlternatives,
  offers, Offer,
  requests, Request,
  matches, Match,
  conversations, Conversation,
  messages, Message,
  notifications, Notification,
  marketSignals, MarketSignal,
} from "../drizzle/schema";
import { ENV } from './_core/env';
import { medicineMatchesQuery, medicineSearchRank, normalizeMedicineSearch } from "../shared/medicineSearch";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ============================================================
// USER
// ============================================================

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = { openId: user.openId };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ============================================================
// GEOGRAPHY
// ============================================================

export async function getRegions() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(regions).orderBy(asc(regions.id));
}

export async function getGovernorates(regionId?: number) {
  const db = await getDb();
  if (!db) return [];
  if (regionId) {
    return db.select().from(governorates).where(eq(governorates.regionId, regionId)).orderBy(asc(governorates.name));
  }
  return db.select().from(governorates).orderBy(asc(governorates.name));
}

export async function getCities(governorateId?: number) {
  const db = await getDb();
  if (!db) return [];
  if (governorateId) {
    return db.select().from(cities).where(eq(cities.governorateId, governorateId)).orderBy(asc(cities.name));
  }
  return db.select().from(cities).orderBy(asc(cities.name));
}

export async function getGeography() {
  const db = await getDb();
  if (!db) return { regions: [], governorates: [], cities: [] };
  const [allRegions, allGovs, allCities] = await Promise.all([
    db.select().from(regions).orderBy(asc(regions.id)),
    db.select().from(governorates).orderBy(asc(governorates.id)),
    db.select().from(cities).orderBy(asc(cities.id)),
  ]);
  return { regions: allRegions, governorates: allGovs, cities: allCities };
}

// ============================================================
// ENTITIES
// ============================================================

export async function createEntity(data: {
  userId: number;
  name: string;
  type: Entity['type'];
  status?: Entity['status'];
  licenseNumber?: string;
  contactPerson?: string;
  phone?: string;
  regionId?: number;
  governorateId?: number;
  cityId?: number;
  address?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [result] = await db.insert(entities).values({
    ...data,
    status: data.status ?? 'pending',
  });
  return { id: result.insertId };
}

export async function getEntityByUserId(userId: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(entities)
    .where(and(eq(entities.userId, userId), eq(entities.isDeleted, false)))
    .limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function getEntityById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(entities).where(eq(entities.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getEntitiesForVerification() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(entities)
    .where(and(eq(entities.status, 'pending'), eq(entities.isDeleted, false)))
    .orderBy(desc(entities.createdAt));
}

export async function verifyEntity(id: number, status: Entity['status']) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(entities)
    .set({ status })
    .where(eq(entities.id, id));
}

// ============================================================
// DRUGS
// ============================================================

export async function searchDrugs(query: string, limit = 20) {
  const db = await getDb();
  if (!db) return [];

  // The catalog is intentionally small enough for one consistent bilingual
  // filter. This keeps Arabic normalization identical for API and frontend
  // callers without changing canonical keys or database records.
  const normalizedQuery = normalizeMedicineSearch(query);
  if (!normalizedQuery) return [];

  const records = await db.select().from(drugs)
    .where(and(eq(drugs.isDeleted, false), eq(drugs.isActive, true)))
    .orderBy(desc(drugs.id));

  return records
    .map((record) => ({ record, rank: medicineSearchRank(record, normalizedQuery) }))
    .filter(({ rank }) => rank > 0)
    .sort((a, b) => b.rank - a.rank || b.record.id - a.record.id)
    .slice(0, limit)
    .map(({ record }) => record);
}

export async function getDrugsByCategory(category: string) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(drugs)
    .where(and(eq(drugs.category, category as any), eq(drugs.isDeleted, false), eq(drugs.isActive, true)))
    .orderBy(asc(drugs.brandName));
}

export async function getAllDrugs() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(drugs)
    .where(and(eq(drugs.isDeleted, false), eq(drugs.isActive, true)))
    .orderBy(asc(drugs.brandName));
}

export async function getDrugById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(drugs).where(eq(drugs.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getDrugAlternatives(drugId: number) {
  const db = await getDb();
  if (!db) return [];
  const alts = await db.select().from(drugAlternatives).where(eq(drugAlternatives.sourceDrugId, drugId));
  if (alts.length === 0) return [];
  const altIds = alts.map(a => a.alternativeDrugId);
  return db.select().from(drugs).where(
    or(...altIds.map(id => eq(drugs.id, id)))
  );
}

// ============================================================
// OFFERS
// ============================================================

export async function createOffer(data: {
  entityId: number;
  drugId?: number;
  isFreeText: boolean;
  freeTextName?: string;
  freeTextNameAr?: string;
  quantity: number;
  unit: string;
  expiryDate?: string;
  price?: string;
  currency?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
  const insertData: any = {
    ...data,
    status: 'active',
    expiresAt,
  };
  // Convert expiryDate string to Date if provided
  if (data.expiryDate) {
    insertData.expiryDate = new Date(data.expiryDate);
  }
  console.log(`[CREATE_OFFER] Inserting offer:`, insertData);
  const result = await db.insert(offers).values(insertData);
  console.log(`[CREATE_OFFER] Insert result:`, result);
  
  // Get the inserted offer to ensure we have the correct ID
  const insertedOffers = await db.select().from(offers)
    .where(eq(offers.entityId, data.entityId))
    .orderBy(desc(offers.createdAt))
    .limit(1);
  
  if (insertedOffers.length === 0) {
    throw new Error("Failed to retrieve inserted offer");
  }
  
  const offerId = insertedOffers[0].id;
  console.log(`[CREATE_OFFER] Created offer with ID: ${offerId}`);
  return { id: offerId };
}

export async function getOffers(filters?: {
  entityId?: number;
  drugId?: number;
  status?: Offer['status'];
  regionId?: number;
  cityId?: number;
  search?: string;
  limit?: number;
  offset?: number;
}): Promise<Offer[]> {
  const db = await getDb();
  if (!db) return [];
  const conditions: any[] = [eq(offers.isDeleted, false)];
  
  if (filters?.entityId) conditions.push(eq(offers.entityId, filters.entityId));
  if (filters?.drugId) conditions.push(eq(offers.drugId, filters.drugId));
  if (filters?.status) conditions.push(eq(offers.status, filters.status));
  
  const result = await db.select().from(offers)
    .where(and(...conditions))
    .orderBy(desc(offers.createdAt));
  
  let output = result;
  if (filters?.offset) output = output.slice(filters.offset);
  if (filters?.limit) output = output.slice(0, filters.limit);
  return output;
}

export async function getOfferById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(offers).where(eq(offers.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function closeOffer(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(offers).set({ status: 'closed' }).where(eq(offers.id, id));
}

export async function expireOffers() {
  const db = await getDb();
  if (!db) return;
  await db.update(offers)
    .set({ status: 'expired' })
    .where(and(
      eq(offers.status, 'active'),
      sql`expiresAt < NOW()`
    ));
}

// ============================================================
// REQUESTS
// ============================================================

export async function createRequest(data: {
  entityId: number;
  drugId?: number;
  isFreeText: boolean;
  freeTextName?: string;
  freeTextNameAr?: string;
  quantity: number;
  unit: string;
  urgency: Request['urgency'];
  maxPrice?: string;
  currency?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  console.log(`[CREATE_REQUEST] Inserting request`);
  const result = await db.insert(requests).values({
    ...data,
    status: 'open',
    expiresAt,
  });
  console.log(`[CREATE_REQUEST] Insert result:`, result);
  
  // Get the inserted request to ensure we have the correct ID
  const insertedRequests = await db.select().from(requests)
    .where(eq(requests.entityId, data.entityId))
    .orderBy(desc(requests.createdAt))
    .limit(1);
  
  if (insertedRequests.length === 0) {
    throw new Error("Failed to retrieve inserted request");
  }
  
  const requestId = insertedRequests[0].id;
  console.log(`[CREATE_REQUEST] Created request with ID: ${requestId}`);
  return { id: requestId };
}

export async function getRequests(filters?: {
  entityId?: number;
  drugId?: number;
  status?: Request['status'];
  regionId?: number;
  cityId?: number;
  urgency?: Request['urgency'];
  limit?: number;
  offset?: number;
}): Promise<Request[]> {
  const db = await getDb();
  if (!db) return [];
  const conditions: any[] = [eq(requests.isDeleted, false)];
  
  if (filters?.entityId) conditions.push(eq(requests.entityId, filters.entityId));
  if (filters?.drugId) conditions.push(eq(requests.drugId, filters.drugId));
  if (filters?.status) conditions.push(eq(requests.status, filters.status));
  if (filters?.urgency) conditions.push(eq(requests.urgency, filters.urgency));
  
  const result = await db.select().from(requests)
    .where(and(...conditions))
    .orderBy(desc(requests.createdAt));
  
  let output = result;
  if (filters?.offset) output = output.slice(filters.offset);
  if (filters?.limit) output = output.slice(0, filters.limit);
  return output;
}

export async function getRequestById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(requests).where(eq(requests.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function closeRequest(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(requests).set({ status: 'closed' }).where(eq(requests.id, id));
}

export async function expireRequests() {
  const db = await getDb();
  if (!db) return;
  await db.update(requests)
    .set({ status: 'expired' })
    .where(and(
      eq(requests.status, 'open'),
      sql`expiresAt < NOW()`
    ));
}

// ============================================================
// MATCHING ENGINE
// ============================================================

export async function runMatching(offerId: number) {
  console.log(`\n[MATCHING] ===== START: runMatching for offerId=${offerId} =====`);
  
  const db = await getDb();
  if (!db) {
    console.error(`[MATCHING] FAIL Step 1: Database not available`);
    return [];
  }
  console.log(`[MATCHING] ✓ Step 1: Database connected`);
  
  const offer = await getOfferById(offerId);
  if (!offer) {
    console.error(`[MATCHING] FAIL Step 2: Offer not found for offerId=${offerId}`);
    return [];
  }
  console.log(`[MATCHING] ✓ Step 2: Offer found - id=${offer.id}, drugId=${offer.drugId}, entityId=${offer.entityId}, isFreeText=${offer.isFreeText}, freeTextName=${offer.freeTextName}`);
  
  // Get open requests
  const openRequests = await db.select().from(requests)
    .where(and(
      eq(requests.status, 'open'),
      eq(requests.isDeleted, false),
      // Match supply and demand by name even when a verified entity records
      // both sides. This supports inventory-intelligence use cases while
      // conversation creation remains limited to two distinct entities.
    ));
  console.log(`[MATCHING] ✓ Step 3: Found ${openRequests.length} open requests`);
  if (openRequests.length === 0) {
    console.log(`[MATCHING] No open requests to match against`);
    return [];
  }
  
  const offerEntity = await getEntityById(offer.entityId);
  if (!offerEntity) {
    console.error(`[MATCHING] FAIL Step 4: Offer entity not found for entityId=${offer.entityId}`);
    return [];
  }
  console.log(`[MATCHING] ✓ Step 4: Offer entity found - id=${offerEntity.id}, cityId=${offerEntity.cityId}`);
  
  const matchesToCreate = [];
  
  for (const req of openRequests) {
    console.log(`\n[MATCHING]   Checking request id=${req.id}, drugId=${req.drugId}, isFreeText=${req.isFreeText}, freeTextName=${req.freeTextName}`);
    
    let drugMatch = 0;
    
    // Drug name matching (primary criteria - no quantity requirement)
    if (req.drugId && offer.drugId) {
      // Exact match
      if (req.drugId === offer.drugId) {
        drugMatch = 100;
        console.log(`[MATCHING]     → Exact drug ID match: ${req.drugId} === ${offer.drugId}`);
      } else {
        // Check alternatives
        const offerAlts = await getDrugAlternatives(offer.drugId);
        console.log(`[MATCHING]     → Checking alternatives for offer drugId=${offer.drugId}, found ${offerAlts.length} alternatives`);
        if (offerAlts.some(a => a.id === req.drugId)) {
          drugMatch = 100; // Alternative counts as full match
          console.log(`[MATCHING]     → Alternative match found`);
        }
      }
    } else if (req.isFreeText && offer.isFreeText) {
      const reqName = normalizeMedicineSearch(req.freeTextName);
      const offerName = normalizeMedicineSearch(offer.freeTextName);
      console.log(`[MATCHING]     → Free-text match: "${reqName}" vs "${offerName}"`);
      // Exact or partial match on drug name
      if (reqName === offerName || reqName.includes(offerName) || offerName.includes(reqName)) {
        drugMatch = 100;
        console.log(`[MATCHING]     → Free-text match SUCCESS`);
      }
    } else if ((req.drugId && offer.isFreeText) || (req.isFreeText && offer.drugId)) {
      // Mixed: one has drugId, other has freeText - try to match
      // This is a weaker match but still valid
      drugMatch = 50;
      console.log(`[MATCHING]     → Mixed type match (drugId + freeText): drugMatch=50`);
    }
    
    console.log(`[MATCHING]     → drugMatch=${drugMatch}`);
    
    // Only create match if drug names match
    if (drugMatch === 0) {
      console.log(`[MATCHING]     → SKIP: No drug match`);
      continue;
    }
    
    // Location match is secondary (bonus, not required)
    let locationMatch = 0;
    const reqEntity = await getEntityById(req.entityId);
    if (reqEntity && offerEntity) {
      if (reqEntity.cityId === offerEntity.cityId) locationMatch = 100;
      else if (reqEntity.governorateId === offerEntity.governorateId) locationMatch = 70;
      else if (reqEntity.regionId === offerEntity.regionId) locationMatch = 40;
      console.log(`[MATCHING]     → locationMatch=${locationMatch}`);
    }
    
    // Urgency match (secondary)
    const urgencyMap = { low: 1, medium: 2, high: 3, critical: 4 };
    const urgScore = (urgencyMap[req.urgency] / 4) * 100;
    console.log(`[MATCHING]     → urgency="${req.urgency}", urgScore=${urgScore}`);
    
    // NEW: Simplified scoring - drug match is primary, others are bonuses
    // Base score is 100 for drug match, then add bonuses for location and urgency
    const totalScore = drugMatch + (locationMatch * 0.1) + (urgScore * 0.05);
    
    console.log(`[MATCHING]     → totalScore = ${drugMatch} + (${locationMatch} * 0.1) + (${urgScore} * 0.05) = ${totalScore}`);
    
    // Match created if drug names match (drugMatch >= 50)
    if (drugMatch >= 50) {
      const existingMatch = await db.select({ id: matches.id }).from(matches)
        .where(and(eq(matches.offerId, offerId), eq(matches.requestId, req.id)))
        .limit(1);
      if (existingMatch.length > 0) {
        console.log(`[MATCHING]     → SKIP: Existing match already recorded for offer=${offerId}, request=${req.id}`);
        continue;
      }
      const matchData = {
        offerId,
        requestId: req.id,
        matchScore: String(Math.round(totalScore * 100) / 100),
        drugMatchScore: String(drugMatch),
        locationMatchScore: String(locationMatch),
        urgencyMatchScore: String(urgScore),
        quantityMatchScore: String(0), // Quantity no longer affects matching
      };
      matchesToCreate.push(matchData);
      console.log(`[MATCHING]     → MATCH CREATED: ${JSON.stringify(matchData)}`);
    }
  }
  
  console.log(`\n[MATCHING] ✓ Step 5: Prepared ${matchesToCreate.length} matches to insert`);
  
  // Insert matches
  if (matchesToCreate.length > 0) {
    try {
      await db.insert(matches).values(matchesToCreate);
      console.log(`[MATCHING] ✓ Step 6: Inserted matches into database`);
      
      // Create conversations only for matches between distinct entities and
      // reference the actual match ID instead of the request ID.
      for (let i = 0; i < matchesToCreate.length; i++) {
        const m = matchesToCreate[i];
        const matchedReq = openRequests.find(r => r.id === m.requestId);
        const insertedMatch = await db.select({ id: matches.id }).from(matches)
          .where(and(eq(matches.offerId, m.offerId), eq(matches.requestId, m.requestId)))
          .orderBy(desc(matches.id))
          .limit(1);
        if (matchedReq && matchedReq.entityId !== offer.entityId && insertedMatch[0]) {
          await db.insert(conversations).values({
            matchId: insertedMatch[0].id,
            offerEntityId: offer.entityId,
            requestEntityId: matchedReq.entityId,
          });
        }
      }
      console.log(`[MATCHING] ✓ Step 7: Created conversations`);
    } catch (err) {
      console.error(`[MATCHING] FAIL Step 6: Error inserting matches:`, err);
      throw err;
    }
  } else {
    console.log(`[MATCHING] ✓ Step 6: No matches to insert`);
  }
  
  console.log(`[MATCHING] ===== END: runMatching returned ${matchesToCreate.length} matches =====\n`);
  return matchesToCreate;
}

export async function getMatchesByOfferId(offerId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(matches).where(eq(matches.offerId, offerId)).orderBy(desc(matches.matchScore));
}

export async function getMatchesByRequestId(requestId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(matches).where(eq(matches.requestId, requestId)).orderBy(desc(matches.matchScore));
}

export async function getMatchById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(matches).where(eq(matches.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateMatchStatus(id: number, status: Match['status']) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(matches).set({ status }).where(eq(matches.id, id));
}

// ============================================================
// CONVERSATIONS & MESSAGES
// ============================================================

export async function getConversationsByEntityId(entityId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(conversations)
    .where(or(eq(conversations.offerEntityId, entityId), eq(conversations.requestEntityId, entityId)))
    .orderBy(desc(conversations.updatedAt));
}

export async function getConversationById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(conversations).where(eq(conversations.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createMessage(data: {
  conversationId: number;
  senderEntityId: number;
  messageText: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [result] = await db.insert(messages).values(data);
  await db.update(conversations)
    .set({ updatedAt: new Date() })
    .where(eq(conversations.id, data.conversationId));
  return { id: result.insertId };
}

export async function getMessagesByConversationId(conversationId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(messages)
    .where(eq(messages.conversationId, conversationId))
    .orderBy(asc(messages.createdAt));
}

export async function revealContact(entityId: number, conversationId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const conv = await getConversationById(conversationId);
  if (!conv) throw new Error("Conversation not found");
  
  const isOfferSide = conv.offerEntityId === entityId;
  const isRequestSide = conv.requestEntityId === entityId;
  
  if (!isOfferSide && !isRequestSide) throw new Error("Entity not part of this conversation");
  
  const updateData: Partial<Conversation> = {};
  if (isOfferSide) {
    updateData.offerEntityRevealed = true;
  } else {
    updateData.requestEntityRevealed = true;
  }
  
  if ((updateData.offerEntityRevealed && conv.requestEntityRevealed) ||
      (updateData.requestEntityRevealed && conv.offerEntityRevealed)) {
    updateData.contactRevealed = true;
  }
  
  await db.update(conversations)
    .set(updateData)
    .where(eq(conversations.id, conversationId));
}

// ============================================================
// NOTIFICATIONS
// ============================================================

export async function createNotification(data: {
  userId: number;
  type: Notification['type'];
  title: string;
  body?: string;
  relatedEntityId?: number;
  relatedType?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [result] = await db.insert(notifications).values(data);
  return { id: result.insertId };
}

export async function getNotificationsByUserId(userId: number, limit = 50) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(notifications)
    .where(eq(notifications.userId, userId))
    .orderBy(desc(notifications.createdAt))
    .limit(limit);
}

export async function getUnreadCount(userId: number) {
  const db = await getDb();
  if (!db) return 0;
  const result = await db.select({ count: sql<number>`count(*)` }).from(notifications)
    .where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)));
  return result[0]?.count ?? 0;
}

export async function markNotificationRead(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(notifications).set({ isRead: true }).where(eq(notifications.id, id));
}

export async function markAllNotificationsRead(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(notifications)
    .set({ isRead: true })
    .where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)));
}

// ============================================================
// MARKET SIGNALS
// ============================================================

export async function getMarketSignals(filters?: {
  signalType?: MarketSignal['signalType'];
  severity?: MarketSignal['severity'];
  status?: MarketSignal['status'];
  regionId?: number;
  governorateId?: number;
  limit?: number;
}): Promise<MarketSignal[]> {
  const db = await getDb();
  if (!db) return [];
  
  const conditions: any[] = [];
  if (filters?.signalType) conditions.push(eq(marketSignals.signalType, filters.signalType));
  if (filters?.severity) conditions.push(eq(marketSignals.severity, filters.severity));
  if (filters?.status) conditions.push(eq(marketSignals.status, filters.status));
  if (filters?.regionId) conditions.push(eq(marketSignals.regionId, filters.regionId));
  if (filters?.governorateId) conditions.push(eq(marketSignals.governorateId, filters.governorateId));
  
  if (conditions.length > 0) {
    const result = await db.select().from(marketSignals)
      .where(and(...conditions))
      .orderBy(desc(marketSignals.createdAt));
    return filters?.limit ? result.slice(0, filters.limit) : result;
  }
  
  const result = await db.select().from(marketSignals)
    .orderBy(desc(marketSignals.createdAt));
  return filters?.limit ? result.slice(0, filters.limit) : result;
}

export async function createMarketSignal(data: {
  signalType: MarketSignal['signalType'];
  drugId?: number;
  regionId?: number;
  governorateId?: number;
  severity?: MarketSignal['severity'];
  confidence?: number;
  generatedFrom?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [result] = await db.insert(marketSignals).values({
    ...data,
    severity: data.severity || 'medium',
    confidence: data.confidence || 0,
  });
  return { id: result.insertId };
}
