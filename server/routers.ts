import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, adminProcedure, router } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import * as db from "./db";
import { therapeuticSearchCategories, therapeuticSearchContexts } from "../shared/therapeuticSearchAnalytics";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // ============================================================
  // GEOGRAPHY
  // ============================================================
  geography: router({
    getAll: publicProcedure.query(async () => {
      return db.getGeography();
    }),
    governorates: publicProcedure
      .input(z.object({ regionId: z.number().optional() }))
      .query(async ({ input }) => {
        return db.getGovernorates(input.regionId);
      }),
    cities: publicProcedure
      .input(z.object({ governorateId: z.number().optional() }))
      .query(async ({ input }) => {
        return db.getCities(input.governorateId);
      }),
  }),

  // ============================================================
  // ENTITIES
  // ============================================================
  entity: router({
    getByUserId: protectedProcedure.query(async ({ ctx }) => {
      const entity = await db.getEntityByUserId(ctx.user!.id);
      // Return null (not undefined) when no entity exists — tRPC requires non-undefined returns
      return entity ?? null;
    }),
    create: protectedProcedure
      .input(z.object({
        name: z.string().min(1),
        type: z.enum(["pharmacy", "hospital", "distributor", "clinic"]),
        licenseNumber: z.string().optional(),
        contactPerson: z.string().optional(),
        phone: z.string().optional(),
        regionId: z.number().optional(),
        governorateId: z.number().optional(),
        cityId: z.number().optional(),
        address: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const existing = await db.getEntityByUserId(ctx.user!.id);
        if (existing) {
          throw new TRPCError({ code: "CONFLICT", message: "Entity already registered" });
        }
        const result = await db.createEntity({
          ...input,
          userId: ctx.user!.id,
          status: ctx.user!.role === 'admin' ? 'verified' : 'pending',
        });
        return result;
      }),
    verificationQueue: adminProcedure.query(async () => {
      return db.getEntitiesForVerification();
    }),
    verify: adminProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(["verified", "suspended"]),
      }))
      .mutation(async ({ input }) => {
        await db.verifyEntity(input.id, input.status);
        return { success: true };
      }),
  }),

  // ============================================================
  // DRUGS
  // ============================================================
  drugs: router({
    search: publicProcedure
      .input(z.object({ query: z.string().min(1) }))
      .query(async ({ input }) => {
        return db.searchDrugs(input.query);
      }),
    byCategory: publicProcedure
      .input(z.object({ category: z.string() }))
      .query(async ({ input }) => {
        return db.getDrugsByCategory(input.category);
      }),
    all: publicProcedure.query(async () => {
      return db.getAllDrugs();
    }),
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const drug = await db.getDrugById(input.id);
        if (!drug) throw new TRPCError({ code: "NOT_FOUND", message: "Drug not found" });
        return drug;
      }),
    alternatives: publicProcedure
      .input(z.object({ drugId: z.number() }))
      .query(async ({ input }) => {
        return db.getDrugAlternatives(input.drugId);
      }),
  }),

  // ============================================================
  // OFFERS
  // ============================================================
  offers: router({
    create: protectedProcedure
      .input(z.object({
        entityId: z.number(),
        drugId: z.number().optional(),
        isFreeText: z.boolean(),
        freeTextName: z.string().optional(),
        freeTextNameAr: z.string().optional(),
        quantity: z.number().min(1),
        unit: z.string().min(1),
        expiryDate: z.string().optional(),
        price: z.string().optional(),
        currency: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        // Verify entity belongs to user and is verified
        const entity = await db.getEntityById(input.entityId);
        if (!entity || entity.userId !== ctx.user!.id) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Entity not found or not yours" });
        }
        if (entity.status !== "verified") {
          throw new TRPCError({ code: "FORBIDDEN", message: "Entity must be verified" });
        }
        const result = await db.createOffer(input);
        // Trigger matching engine for this new offer
        try {
          await db.runMatching(result.id);
          // Create notifications for matched entities
          const matchResults = await db.getMatchesByOfferId(result.id);
          for (const match of matchResults) {
            // Notify on ANY drug name match (no minimum score threshold)
            if (match.matchScore) {
              const reqEntity = await db.getRequestById(match.requestId);
              const entity = reqEntity?.entityId ? await db.getEntityById(reqEntity.entityId) : null;
              const userId = entity?.userId ?? 0;
              if (userId) {
                const scorePercent = Math.round(parseFloat(match.matchScore) * 100);
                const locationBonus = match.locationMatchScore ? parseFloat(match.locationMatchScore) : 0;
                
                let notificationBody = 'Your request matched with a new offer';
                if (locationBonus > 0) {
                  notificationBody += ` in the same region (${scorePercent}% match)`;
                } else {
                  notificationBody += ` (${scorePercent}% match)`;
                }
                
                await db.createNotification({
                  userId,
                  type: 'match_found',
                  title: 'New Match Found',
                  body: notificationBody,
                  relatedEntityId: entity?.id ?? undefined,
                  relatedType: 'match',
                });
              }
            }
          }
        } catch (err) {
          console.error("[Matching] Post-creation trigger failed:", err);
        }
        return result;
      }),
    list: publicProcedure
      .input(z.object({
        entityId: z.number().optional(),
        drugId: z.number().optional(),
        status: z.enum(["active", "closed", "expired"]).optional(),
        limit: z.number().optional(),
        offset: z.number().optional(),
      }).optional())
      .query(async ({ input }) => {
        return db.getOffers(input);
      }),
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const offer = await db.getOfferById(input.id);
        if (!offer) throw new TRPCError({ code: "NOT_FOUND", message: "Offer not found" });
        return offer;
      }),
    close: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const offer = await db.getOfferById(input.id);
        if (!offer) throw new TRPCError({ code: "NOT_FOUND", message: "Offer not found" });
        const entity = await db.getEntityById(offer.entityId);
        if (!entity || entity.userId !== ctx.user!.id) {
          throw new TRPCError({ code: "FORBIDDEN" });
        }
        await db.closeOffer(input.id);
        return { success: true };
      }),
  }),

  // ============================================================
  // REQUESTS
  // ============================================================
  requests: router({
    create: protectedProcedure
      .input(z.object({
        entityId: z.number(),
        drugId: z.number().optional(),
        isFreeText: z.boolean(),
        freeTextName: z.string().optional(),
        freeTextNameAr: z.string().optional(),
        quantity: z.number().min(1),
        unit: z.string().min(1),
        urgency: z.enum(["low", "medium", "high", "critical"]),
        maxPrice: z.string().optional(),
        currency: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const entity = await db.getEntityById(input.entityId);
        if (!entity || entity.userId !== ctx.user!.id) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Entity not found or not yours" });
        }
        if (entity.status !== "verified") {
          throw new TRPCError({ code: "FORBIDDEN", message: "Entity must be verified" });
        }
        const result = await db.createRequest(input);
        // Trigger matching engine: find offers that match this request
        try {
          // Find all active offers and run matching for each
          const activeOffers = await db.getOffers({ status: 'active', limit: 200 });
          for (const offer of activeOffers) {
            await db.runMatching(offer.id);
          }
          // Create notifications for matched entities
          const matchResults = await db.getMatchesByRequestId(result.id);
          for (const match of matchResults) {
            // Notify on ANY drug name match (no minimum score threshold)
            if (match.matchScore) {
              const offer = await db.getOfferById(match.offerId);
              const offerEntity = offer?.entityId ? await db.getEntityById(offer.entityId) : null;
              const userId = offerEntity?.userId ?? 0;
              if (userId) {
                const scorePercent = Math.round(parseFloat(match.matchScore) * 100);
                const locationBonus = match.locationMatchScore ? parseFloat(match.locationMatchScore) : 0;
                
                let notificationBody = 'Your offer matched with a new request';
                if (locationBonus > 0) {
                  notificationBody += ` in the same region (${scorePercent}% match)`;
                } else {
                  notificationBody += ` (${scorePercent}% match)`;
                }
                
                await db.createNotification({
                  userId,
                  type: 'match_found',
                  title: 'New Match Found',
                  body: notificationBody,
                  relatedEntityId: offerEntity?.id ?? undefined,
                  relatedType: 'match',
                });
              }
            }
          }
        } catch (err) {
          console.error("[Matching] Post-request trigger failed:", err);
        }
        return result;
      }),
    list: publicProcedure
      .input(z.object({
        entityId: z.number().optional(),
        drugId: z.number().optional(),
        status: z.enum(["open", "closed", "expired"]).optional(),
        urgency: z.enum(["low", "medium", "high", "critical"]).optional(),
        limit: z.number().optional(),
        offset: z.number().optional(),
      }).optional())
      .query(async ({ input }) => {
        return db.getRequests(input);
      }),
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const req = await db.getRequestById(input.id);
        if (!req) throw new TRPCError({ code: "NOT_FOUND", message: "Request not found" });
        return req;
      }),
    close: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const req = await db.getRequestById(input.id);
        if (!req) throw new TRPCError({ code: "NOT_FOUND", message: "Request not found" });
        const entity = await db.getEntityById(req.entityId);
        if (!entity || entity.userId !== ctx.user!.id) {
          throw new TRPCError({ code: "FORBIDDEN" });
        }
        await db.closeRequest(input.id);
        return { success: true };
      }),
  }),

  // ============================================================
  // MATCHING
  // ============================================================
  matching: router({
    run: protectedProcedure
      .input(z.object({ offerId: z.number() }))
      .mutation(async ({ input }) => {
        return db.runMatching(input.offerId);
      }),
    byOffer: protectedProcedure
      .input(z.object({ offerId: z.number() }))
      .query(async ({ input }) => {
        return db.getMatchesByOfferId(input.offerId);
      }),
    byRequest: protectedProcedure
      .input(z.object({ requestId: z.number() }))
      .query(async ({ input }) => {
        return db.getMatchesByRequestId(input.requestId);
      }),
    accept: protectedProcedure
      .input(z.object({ matchId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const match = await db.getMatchById(input.matchId);
        if (!match) throw new TRPCError({ code: "NOT_FOUND" });
        const offer = await db.getOfferById(match.offerId);
        if (!offer) throw new TRPCError({ code: "NOT_FOUND" });
        const entity = await db.getEntityById(offer.entityId);
        if (!entity || entity.userId !== ctx.user!.id) {
          throw new TRPCError({ code: "FORBIDDEN" });
        }
        await db.updateMatchStatus(input.matchId, "accepted");
        return { success: true };
      }),
    reject: protectedProcedure
      .input(z.object({ matchId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const match = await db.getMatchById(input.matchId);
        if (!match) throw new TRPCError({ code: "NOT_FOUND" });
        const offer = await db.getOfferById(match.offerId);
        if (!offer) throw new TRPCError({ code: "NOT_FOUND" });
        const entity = await db.getEntityById(offer.entityId);
        if (!entity || entity.userId !== ctx.user!.id) {
          throw new TRPCError({ code: "FORBIDDEN" });
        }
        await db.updateMatchStatus(input.matchId, "rejected");
        return { success: true };
      }),
  }),

  // ============================================================
  // CONVERSATIONS & MESSAGES
  // ============================================================
  conversations: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      const entity = await db.getEntityByUserId(ctx.user!.id);
      if (!entity) return [];
      return db.getConversationsByEntityId(entity.id);
    }),
    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const conv = await db.getConversationById(input.id);
        if (!conv) throw new TRPCError({ code: "NOT_FOUND" });
        return conv;
      }),
    messages: protectedProcedure
      .input(z.object({ conversationId: z.number() }))
      .query(async ({ input }) => {
        return db.getMessagesByConversationId(input.conversationId);
      }),
    sendMessage: protectedProcedure
      .input(z.object({
        conversationId: z.number(),
        messageText: z.string().min(1),
      }))
      .mutation(async ({ ctx, input }) => {
        const entity = await db.getEntityByUserId(ctx.user!.id);
        if (!entity) throw new TRPCError({ code: "FORBIDDEN", message: "No entity registered" });
        const conv = await db.getConversationById(input.conversationId);
        if (!conv) throw new TRPCError({ code: "NOT_FOUND" });
        if (conv.offerEntityId !== entity.id && conv.requestEntityId !== entity.id) {
          throw new TRPCError({ code: "FORBIDDEN" });
        }
        const result = await db.createMessage({
          conversationId: input.conversationId,
          senderEntityId: entity.id,
          messageText: input.messageText,
        });
        return result;
      }),
    revealContact: protectedProcedure
      .input(z.object({ conversationId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const entity = await db.getEntityByUserId(ctx.user!.id);
        if (!entity) throw new TRPCError({ code: "FORBIDDEN" });
        await db.revealContact(entity.id, input.conversationId);
        const updated = await db.getConversationById(input.conversationId);
        return updated;
      }),
  }),

  // ============================================================
  // NOTIFICATIONS
  // ============================================================
  notifications: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return db.getNotificationsByUserId(ctx.user!.id);
    }),
    unreadCount: protectedProcedure.query(async ({ ctx }) => {
      return db.getUnreadCount(ctx.user!.id);
    }),
    markRead: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.markNotificationRead(input.id);
        return { success: true };
      }),
    markAllRead: protectedProcedure.mutation(async ({ ctx }) => {
      await db.markAllNotificationsRead(ctx.user!.id);
      return { success: true };
    }),
  }),

  // ============================================================
  // MARKET INTELLIGENCE
  // ============================================================
  intelligence: router({
    dashboard: adminProcedure.query(async () => {
      return db.getMarketIntelligenceDashboard();
    }),
    recordTherapeuticSearch: publicProcedure
      .input(z.object({
        category: z.enum(therapeuticSearchCategories),
        context: z.enum(therapeuticSearchContexts),
      }))
      .mutation(async ({ input }) => {
        return db.recordTherapeuticCategorySearch(input);
      }),
    signals: adminProcedure
      .input(z.object({
        signalType: z.enum(["shortage", "surplus", "invisible_inventory", "price_anomaly", "trend_shift"]).optional(),
        severity: z.enum(["low", "medium", "high", "critical"]).optional(),
        status: z.enum(["new", "acknowledged", "dismissed", "resolved"]).optional(),
        regionId: z.number().optional(),
        governorateId: z.number().optional(),
        limit: z.number().optional(),
      }).optional())
      .query(async ({ input }) => {
        return db.getMarketSignals(input);
      }),
    createSignal: adminProcedure
      .input(z.object({
        signalType: z.enum(["shortage", "surplus", "invisible_inventory", "price_anomaly", "trend_shift"]),
        drugId: z.number().optional(),
        regionId: z.number().optional(),
        governorateId: z.number().optional(),
        severity: z.enum(["low", "medium", "high", "critical"]).optional(),
        confidence: z.number().optional(),
        generatedFrom: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        return db.createMarketSignal(input);
      }),
    externalSources: adminProcedure.query(async () => {
      return db.getExternalMarketSources();
    }),
    addExternalSource: adminProcedure
      .input(z.object({
        name: z.string().min(2).max(200),
        platform: z.enum(["telegram", "facebook", "website", "other"]),
        sourceUrl: z.string().url().max(500),
        autoApproveSignals: z.boolean().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        return db.createExternalMarketSource({
          ...input,
          createdByUserId: ctx.user!.id,
        });
      }),
    updateExternalSource: adminProcedure
      .input(z.object({
        id: z.number(),
        isActive: z.boolean().optional(),
        autoApproveSignals: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await db.updateExternalMarketSource(id, data);
        return { success: true };
      }),
    externalSignals: adminProcedure
      .input(z.object({
        reviewStatus: z.enum(["pending", "approved", "rejected", "auto_approved"]).optional(),
        limit: z.number().min(1).max(100).optional(),
      }).optional())
      .query(async ({ input }) => {
        return db.getExternalMarketSignals(input);
      }),
    reviewExternalSignal: adminProcedure
      .input(z.object({
        id: z.number(),
        reviewStatus: z.enum(["approved", "rejected"]),
        reviewNote: z.string().max(1000).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.reviewExternalMarketSignal({
          ...input,
          reviewedByUserId: ctx.user!.id,
        });
        return { success: true };
      }),
  }),

  // ============================================================
  // ADMIN: DRUG ALTERNATIVES
  // ============================================================
  alternatives: router({
    link: adminProcedure
      .input(z.object({
        sourceDrugId: z.number(),
        alternativeDrugId: z.number(),
      }))
      .mutation(async ({ input }) => {
        const dbInstance = await db.getDb();
        if (!dbInstance) throw new Error("Database not available");
        const { drugAlternatives: altTable } = require("../drizzle/schema");
        const [result] = await dbInstance.insert(altTable).values(input);
        return { id: result.insertId };
      }),
  }),
});

export type AppRouter = typeof appRouter;
