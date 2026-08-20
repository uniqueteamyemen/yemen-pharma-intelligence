import {
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  boolean,
  decimal,
  date,
  index,
  uniqueIndex,
  bigint,
} from "drizzle-orm/mysql-core";

// ============================================================
// AUTH & USERS (from template)
// ============================================================

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ============================================================
// GEOGRAPHIC HIERARCHY
// ============================================================

export const regions = mysqlTable("regions", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  nameAr: varchar("nameAr", { length: 100 }),
}, (table) => [
  uniqueIndex("regions_name_idx").on(table.name),
]);

export type Region = typeof regions.$inferSelect;
export type InsertRegion = typeof regions.$inferInsert;

export const governorates = mysqlTable("governorates", {
  id: int("id").autoincrement().primaryKey(),
  regionId: int("regionId").references(() => regions.id),
  name: varchar("name", { length: 100 }).notNull(),
  nameAr: varchar("nameAr", { length: 100 }),
}, (table) => [
  index("gov_region_idx").on(table.regionId),
  uniqueIndex("gov_name_idx").on(table.name),
]);

export type Governorate = typeof governorates.$inferSelect;
export type InsertGovernorate = typeof governorates.$inferInsert;

export const cities = mysqlTable("cities", {
  id: int("id").autoincrement().primaryKey(),
  governorateId: int("governorateId").references(() => governorates.id),
  name: varchar("name", { length: 100 }).notNull(),
  nameAr: varchar("nameAr", { length: 100 }),
  latitude: decimal("latitude", { precision: 10, scale: 8 }),
  longitude: decimal("longitude", { precision: 11, scale: 8 }),
}, (table) => [
  index("city_gov_idx").on(table.governorateId),
  uniqueIndex("city_name_idx").on(table.name),
]);

export type City = typeof cities.$inferSelect;
export type InsertCity = typeof cities.$inferInsert;

// ============================================================
// ENTITY (ORGANIZATION PROFILE)
// ============================================================

export const entities = mysqlTable("entities", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").references(() => users.id),
  name: varchar("name", { length: 200 }).notNull(),
  type: mysqlEnum("type", ["pharmacy", "hospital", "distributor", "clinic"]).notNull(),
  status: mysqlEnum("status", ["pending", "verified", "suspended"]).default("pending").notNull(),
  licenseNumber: varchar("licenseNumber", { length: 100 }),
  contactPerson: varchar("contactPerson", { length: 200 }),
  phone: varchar("phone", { length: 30 }),
  regionId: int("regionId").references(() => regions.id),
  governorateId: int("governorateId").references(() => governorates.id),
  cityId: int("cityId").references(() => cities.id),
  address: text("address"),
  isDeleted: boolean("isDeleted").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => [
  index("entity_type_idx").on(table.type),
  index("entity_status_idx").on(table.status),
  index("entity_region_idx").on(table.regionId),
  index("entity_city_idx").on(table.cityId),
]);

export type Entity = typeof entities.$inferSelect;
export type InsertEntity = typeof entities.$inferInsert;

// ============================================================
// DRUG CATALOG
// ============================================================

export const drugs = mysqlTable("drugs", {
  id: int("id").autoincrement().primaryKey(),
  brandName: varchar("brandName", { length: 200 }).notNull(),
  brandNameAr: varchar("brandNameAr", { length: 200 }),
  genericName: varchar("genericName", { length: 200 }).notNull(),
  genericNameAr: varchar("genericNameAr", { length: 200 }),
  manufacturer: varchar("manufacturer", { length: 200 }),
  dosageForm: varchar("dosageForm", { length: 100 }),
  strength: varchar("strength", { length: 100 }),
  category: mysqlEnum("category", [
    "antibiotics", "analgesics", "cardiovascular", "respiratory",
    "gastrointestinal", "neurological", "endocrine", "antifungal",
    "antiviral", "oncology", "dermatological", "ophthalmological",
    "vitamins", "other",
  ]).notNull(),
  /** Stable normalization key for one essential-medicine formulation. */
  catalogKey: varchar("catalogKey", { length: 400 }),
  /** Verbatim therapeutic section heading from the Yemen NEML source. */
  nemlCategory: varchar("nemlCategory", { length: 255 }),
  /** Comma-delimited NEML editions in which this formulation appears, e.g. "2019,2022". */
  sourceYears: varchar("sourceYears", { length: 20 }),
  isOfficial: boolean("isOfficial").default(true).notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  isDeleted: boolean("isDeleted").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => [
  index("drug_brand_idx").on(table.brandName),
  index("drug_generic_idx").on(table.genericName),
  index("drug_category_idx").on(table.category),
  index("drug_official_idx").on(table.isOfficial),
  uniqueIndex("drug_catalog_key_idx").on(table.catalogKey),
]);

export type Drug = typeof drugs.$inferSelect;
export type InsertDrug = typeof drugs.$inferInsert;

/**
 * Anonymous category-filter activity for aggregate product analytics.
 * No user ID, entity ID, IP address, or raw medicine query is persisted.
 */
export const therapeuticSearchEvents = mysqlTable("therapeutic_search_events", {
  id: int("id").autoincrement().primaryKey(),
  category: mysqlEnum("category", [
    "antibiotics", "analgesics", "cardiovascular", "respiratory",
    "gastrointestinal", "neurological", "endocrine", "antifungal",
    "antiviral", "oncology", "dermatological", "ophthalmological",
    "vitamins", "other",
  ]).notNull(),
  context: mysqlEnum("context", ["catalog", "offer", "request"]).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => [
  index("therapeutic_search_category_created_idx").on(table.category, table.createdAt),
  index("therapeutic_search_created_idx").on(table.createdAt),
]);

export type TherapeuticSearchEvent = typeof therapeuticSearchEvents.$inferSelect;

/** Auditable provenance for each national essential-medicine record. */
export const drugSources = mysqlTable("drug_sources", {
  id: int("id").autoincrement().primaryKey(),
  drugId: int("drugId").references(() => drugs.id).notNull(),
  sourceEdition: mysqlEnum("sourceEdition", ["NEML_2019", "NEML_2022"]).notNull(),
  sourceDocument: varchar("sourceDocument", { length: 255 }).notNull(),
  sourceLine: int("sourceLine"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => [
  index("drug_source_drug_idx").on(table.drugId),
  uniqueIndex("drug_source_edition_idx").on(table.drugId, table.sourceEdition),
]);

export type DrugSource = typeof drugSources.$inferSelect;
export type InsertDrugSource = typeof drugSources.$inferInsert;

/**
 * Historical Yemen trade-name layer. Each record preserves the source wording
 * while optionally linking to one canonical essential-medicine record.
 * `scientificName` is a standardized scientific label; `activeIngredients`
 * preserves one or more active ingredients together with their stated strengths.
 */
export const drugTradeNames = mysqlTable("drug_trade_names", {
  id: int("id").autoincrement().primaryKey(),
  drugId: int("drugId").references(() => drugs.id),
  tradeName: varchar("tradeName", { length: 200 }).notNull(),
  tradeNameAr: varchar("tradeNameAr", { length: 200 }),
  scientificName: varchar("scientificName", { length: 200 }).notNull(),
  activeIngredients: text("activeIngredients").notNull(),
  dosageForm: varchar("dosageForm", { length: 100 }),
  package: varchar("package", { length: 255 }),
  manufacturer: varchar("manufacturer", { length: 200 }),
  manufacturerCountry: varchar("manufacturerCountry", { length: 100 }),
  sourceDocument: varchar("sourceDocument", { length: 255 }).notNull(),
  sourcePage: int("sourcePage"),
  sourceRow: int("sourceRow"),
  sourceYears: varchar("sourceYears", { length: 20 }).notNull(),
  sourceKey: varchar("sourceKey", { length: 191 }).notNull(),
  matchStatus: mysqlEnum("matchStatus", ["linked", "ambiguous", "unlinked"])
    .default("unlinked")
    .notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => [
  index("trade_name_drug_idx").on(table.drugId),
  index("trade_name_name_idx").on(table.tradeName),
  index("trade_name_scientific_idx").on(table.scientificName),
  index("trade_name_status_idx").on(table.matchStatus),
  uniqueIndex("trade_name_source_key_idx").on(table.sourceKey),
]);

export type DrugTradeName = typeof drugTradeNames.$inferSelect;
export type InsertDrugTradeName = typeof drugTradeNames.$inferInsert;

export const drugAlternatives = mysqlTable("drugAlternatives", {
  id: int("id").autoincrement().primaryKey(),
  sourceDrugId: int("sourceDrugId").references(() => drugs.id).notNull(),
  alternativeDrugId: int("alternativeDrugId").references(() => drugs.id).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => [
  index("alt_source_idx").on(table.sourceDrugId),
  index("alt_target_idx").on(table.alternativeDrugId),
]);

export type DrugAlternative = typeof drugAlternatives.$inferSelect;
export type InsertDrugAlternative = typeof drugAlternatives.$inferInsert;

// ============================================================
// OFFERS (SUPPLY)
// ============================================================

export const offers = mysqlTable("offers", {
  id: int("id").autoincrement().primaryKey(),
  entityId: int("entityId").references(() => entities.id).notNull(),
  drugId: int("drugId").references(() => drugs.id),
  isFreeText: boolean("isFreeText").default(false).notNull(),
  freeTextName: varchar("freeTextName", { length: 200 }),
  freeTextNameAr: varchar("freeTextNameAr", { length: 200 }),
  quantity: int("quantity").notNull(),
  unit: varchar("unit", { length: 50 }).notNull(),
  expiryDate: date("expiryDate"),
  price: decimal("price", { precision: 10, scale: 2 }),
  currency: varchar("currency", { length: 3 }).default("USD"),
  status: mysqlEnum("status", ["active", "closed", "expired"]).default("active").notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  isDeleted: boolean("isDeleted").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => [
  index("offer_entity_idx").on(table.entityId),
  index("offer_drug_idx").on(table.drugId),
  index("offer_status_idx").on(table.status),
  index("offer_free_text_idx").on(table.isFreeText),
  index("offer_expires_idx").on(table.expiresAt),
]);

export type Offer = typeof offers.$inferSelect;
export type InsertOffer = typeof offers.$inferInsert;

// ============================================================
// REQUESTS (DEMAND)
// ============================================================

export const requests = mysqlTable("requests", {
  id: int("id").autoincrement().primaryKey(),
  entityId: int("entityId").references(() => entities.id).notNull(),
  drugId: int("drugId").references(() => drugs.id),
  isFreeText: boolean("isFreeText").default(false).notNull(),
  freeTextName: varchar("freeTextName", { length: 200 }),
  freeTextNameAr: varchar("freeTextNameAr", { length: 200 }),
  quantity: int("quantity").notNull(),
  unit: varchar("unit", { length: 50 }).notNull(),
  urgency: mysqlEnum("urgency", ["low", "medium", "high", "critical"]).default("medium").notNull(),
  maxPrice: decimal("maxPrice", { precision: 10, scale: 2 }),
  currency: varchar("currency", { length: 3 }).default("USD"),
  status: mysqlEnum("status", ["open", "closed", "expired"]).default("open").notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  isDeleted: boolean("isDeleted").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => [
  index("request_entity_idx").on(table.entityId),
  index("request_drug_idx").on(table.drugId),
  index("request_status_idx").on(table.status),
  index("request_urgency_idx").on(table.urgency),
  index("request_free_text_idx").on(table.isFreeText),
  index("request_expires_idx").on(table.expiresAt),
]);

export type Request = typeof requests.$inferSelect;
export type InsertRequest = typeof requests.$inferInsert;

// ============================================================
// MATCHES
// ============================================================

export const matches = mysqlTable("matches", {
  id: int("id").autoincrement().primaryKey(),
  offerId: int("offerId").references(() => offers.id).notNull(),
  requestId: int("requestId").references(() => requests.id).notNull(),
  matchScore: decimal("matchScore", { precision: 5, scale: 2 }).notNull(),
  drugMatchScore: decimal("drugMatchScore", { precision: 5, scale: 2 }),
  locationMatchScore: decimal("locationMatchScore", { precision: 5, scale: 2 }),
  urgencyMatchScore: decimal("urgencyMatchScore", { precision: 5, scale: 2 }),
  quantityMatchScore: decimal("quantityMatchScore", { precision: 5, scale: 2 }),
  status: mysqlEnum("status", ["suggested", "accepted", "rejected"]).default("suggested").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => [
  index("match_offer_idx").on(table.offerId),
  index("match_request_idx").on(table.requestId),
  index("match_status_idx").on(table.status),
]);

export type Match = typeof matches.$inferSelect;
export type InsertMatch = typeof matches.$inferInsert;

// ============================================================
// CONVERSATIONS & MESSAGES
// ============================================================

export const conversations = mysqlTable("conversations", {
  id: int("id").autoincrement().primaryKey(),
  matchId: int("matchId").references(() => matches.id).notNull(),
  offerEntityId: int("offerEntityId").references(() => entities.id).notNull(),
  requestEntityId: int("requestEntityId").references(() => entities.id).notNull(),
  contactRevealed: boolean("contactRevealed").default(false).notNull(),
  offerEntityRevealed: boolean("offerEntityRevealed").default(false).notNull(),
  requestEntityRevealed: boolean("requestEntityRevealed").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => [
  index("conv_match_idx").on(table.matchId),
  index("conv_offer_entity_idx").on(table.offerEntityId),
  index("conv_request_entity_idx").on(table.requestEntityId),
]);

export type Conversation = typeof conversations.$inferSelect;
export type InsertConversation = typeof conversations.$inferInsert;

export const messages = mysqlTable("messages", {
  id: int("id").autoincrement().primaryKey(),
  conversationId: int("conversationId").references(() => conversations.id).notNull(),
  senderEntityId: int("senderEntityId").references(() => entities.id).notNull(),
  messageText: text("messageText").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => [
  index("msg_conv_idx").on(table.conversationId),
  index("msg_sender_idx").on(table.senderEntityId),
]);

export type Message = typeof messages.$inferSelect;
export type InsertMessage = typeof messages.$inferInsert;

// ============================================================
// NOTIFICATIONS
// ============================================================

export const notifications = mysqlTable("notifications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").references(() => users.id).notNull(),
  type: mysqlEnum("type", ["match_found", "new_message", "offer_expired", "request_expired", "signal_alert"]).notNull(),
  title: varchar("title", { length: 300 }).notNull(),
  body: text("body"),
  isRead: boolean("isRead").default(false).notNull(),
  relatedEntityId: int("relatedEntityId"),
  relatedType: varchar("relatedType", { length: 50 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => [
  index("notif_user_idx").on(table.userId),
  index("notif_read_idx").on(table.isRead),
  index("notif_type_idx").on(table.type),
]);

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;

// ============================================================
// MARKET SIGNALS
// ============================================================

export const marketSignals = mysqlTable("marketSignals", {
  id: int("id").autoincrement().primaryKey(),
  signalType: mysqlEnum("signalType", [
    "shortage", "surplus", "invisible_inventory", "price_anomaly", "trend_shift",
  ]).notNull(),
  drugId: int("drugId").references(() => drugs.id),
  regionId: int("regionId").references(() => regions.id),
  governorateId: int("governorateId").references(() => governorates.id),
  severity: mysqlEnum("severity", ["low", "medium", "high", "critical"]).default("medium").notNull(),
  confidence: int("confidence").default(0),
  generatedFrom: text("generatedFrom"),
  status: mysqlEnum("status", ["new", "acknowledged", "dismissed", "resolved"]).default("new").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => [
  index("signal_type_idx").on(table.signalType),
  index("signal_severity_idx").on(table.severity),
  index("signal_region_idx").on(table.regionId),
  index("signal_status_idx").on(table.status),
]);

export type MarketSignal = typeof marketSignals.$inferSelect;
export type InsertMarketSignal = typeof marketSignals.$inferInsert;

// ============================================================
// EXTERNAL MARKET SIGNAL GOVERNANCE
// ============================================================

/**
 * Admin-managed sources for external market observations. `autoApproveSignals`
 * is an explicit, reversible operational setting—not a permanent trust claim.
 */
export const externalMarketSources = mysqlTable("external_market_sources", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 200 }).notNull(),
  platform: mysqlEnum("platform", ["telegram", "facebook", "website", "other"]).notNull(),
  sourceUrl: varchar("sourceUrl", { length: 500 }).notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  autoApproveSignals: boolean("autoApproveSignals").default(false).notNull(),
  createdByUserId: int("createdByUserId").references(() => users.id).notNull(),
  lastCheckedAt: timestamp("lastCheckedAt"),
  lastSucceededAt: timestamp("lastSucceededAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => [
  uniqueIndex("external_source_url_idx").on(table.sourceUrl),
  index("external_source_active_idx").on(table.isActive),
  index("external_source_platform_idx").on(table.platform),
]);

export type ExternalMarketSource = typeof externalMarketSources.$inferSelect;
export type InsertExternalMarketSource = typeof externalMarketSources.$inferInsert;

/**
 * Evidence-level external observations. They remain separate from internal
 * offers/requests until the admin approves them or enables reversible
 * auto-approval for that source.
 */
export const externalMarketSignals = mysqlTable("external_market_signals", {
  id: int("id").autoincrement().primaryKey(),
  sourceId: int("sourceId").references(() => externalMarketSources.id).notNull(),
  externalReference: varchar("externalReference", { length: 255 }).notNull(),
  evidenceUrl: varchar("evidenceUrl", { length: 500 }),
  signalType: mysqlEnum("signalType", ["shortage", "rare_medicine", "demand"]).notNull(),
  drugId: int("drugId").references(() => drugs.id),
  freeTextName: varchar("freeTextName", { length: 200 }),
  governorateId: int("governorateId").references(() => governorates.id),
  severity: mysqlEnum("severity", ["low", "medium", "high", "critical"]).default("medium").notNull(),
  confidence: int("confidence").default(0).notNull(),
  summary: text("summary").notNull(),
  observedAt: timestamp("observedAt").notNull(),
  reviewStatus: mysqlEnum("reviewStatus", ["pending", "approved", "rejected", "auto_approved"])
    .default("pending")
    .notNull(),
  reviewedByUserId: int("reviewedByUserId").references(() => users.id),
  reviewNote: text("reviewNote"),
  reviewedAt: timestamp("reviewedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => [
  uniqueIndex("external_signal_reference_idx").on(table.sourceId, table.externalReference),
  index("external_signal_review_idx").on(table.reviewStatus),
  index("external_signal_source_idx").on(table.sourceId),
  index("external_signal_governorate_idx").on(table.governorateId),
  index("external_signal_observed_idx").on(table.observedAt),
]);

export type ExternalMarketSignal = typeof externalMarketSignals.$inferSelect;
export type InsertExternalMarketSignal = typeof externalMarketSignals.$inferInsert;
// ============================================================
// REFERENCE DRUGS (Official Drug Catalog - seeded from national data)
// ============================================================

export const referenceDrugs = mysqlTable("reference_drugs", {
  id: int("id").autoincrement().primaryKey(),
  brandName: varchar("brandName", { length: 200 }).notNull(),
  brandNameAr: varchar("brandNameAr", { length: 200 }),
  genericName: varchar("genericName", { length: 200 }).notNull(),
  genericNameAr: varchar("genericNameAr", { length: 200 }),
  manufacturer: varchar("manufacturer", { length: 200 }),
  manufacturerCountry: varchar("manufacturerCountry", { length: 100 }),
  dosageForm: varchar("dosageForm", { length: 100 }),
  dosageFormAr: varchar("dosageFormAr", { length: 100 }),
  strength: varchar("strength", { length: 100 }),
  strengthUnit: varchar("strengthUnit", { length: 50 }),
  category: mysqlEnum("category", [
    "antibiotics", "analgesics", "cardiovascular", "respiratory",
    "gastrointestinal", "neurological", "endocrine", "antifungal",
    "antiviral", "oncology", "dermatological", "ophthalmological",
    "vitamins", "vaccines", "antimalarials", "other",
  ]).notNull(),
  atcCode: varchar("atcCode", { length: 10 }),
  registrationNumber: varchar("registrationNumber", { length: 50 }),
  isEssential: boolean("isEssential").default(false).notNull(),
  isControlled: boolean("isControlled").default(false).notNull(),
  isDeleted: boolean("isDeleted").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => [
  index("ref_drug_brand_idx").on(table.brandName),
  index("ref_drug_generic_idx").on(table.genericName),
  index("ref_drug_category_idx").on(table.category),
  index("ref_drug_atc_idx").on(table.atcCode),
  index("ref_drug_registration_idx").on(table.registrationNumber),
  index("ref_drug_essential_idx").on(table.isEssential),
]);

export type ReferenceDrug = typeof referenceDrugs.$inferSelect;
export type InsertReferenceDrug = typeof referenceDrugs.$inferInsert;
