/**
 * YouTube API Usage Tracking - Shared Project Quota
 *
 * Tracks YouTube API quota usage at the Google Cloud Project level (OAuthSetting).
 * All users and ownerships share a single 10,000 units/day quota pool.
 *
 * Key Features:
 * - Shared quota tracking across all ownerships
 * - Priority-based quota reservation system
 * - Automatic cleanup of expired reservations
 * - Usage breakdown by ownership for analytics
 */

import type { Session } from "neo4j-driver";

/**
 * YouTube API quota costs for different operations
 * Based on: https://developers.google.com/youtube/v3/determine_quota_cost
 */
export const YOUTUBE_API_COSTS = {
  // activities
  "activities.list": 1,

  // captions
  "captions.list": 50,
  "captions.insert": 400,
  "captions.update": 450,
  "captions.delete": 50,

  // channelBanners
  "channelBanners.insert": 50,

  // channels
  "channels.list": 1,
  "channels.update": 50,

  // channelSections
  "channelSections.list": 1,
  "channelSections.insert": 50,
  "channelSections.update": 50,
  "channelSections.delete": 50,

  // comments
  "comments.list": 1,
  "comments.insert": 50,
  "comments.update": 50,
  "comments.setModerationStatus": 50,
  "comments.delete": 50,

  // commentThreads
  "commentThreads.list": 1,
  "commentThreads.insert": 50,
  "commentThreads.update": 50,

  // guideCategories
  "guideCategories.list": 1,

  // i18nLanguages
  "i18nLanguages.list": 1,

  // i18nRegions
  "i18nRegions.list": 1,

  // members
  "members.list": 1,

  // membershipsLevels
  "membershipsLevels.list": 1,

  // playlistItems
  "playlistItems.list": 1,
  "playlistItems.insert": 50,
  "playlistItems.update": 50,
  "playlistItems.delete": 50,

  // playlists
  "playlists.list": 1,
  "playlists.insert": 50,
  "playlists.update": 50,
  "playlists.delete": 50,

  // search (expensive!)
  "search.list": 100,

  // subscriptions
  "subscriptions.list": 1,
  "subscriptions.insert": 50,
  "subscriptions.delete": 50,

  // thumbnails
  "thumbnails.set": 50,

  // videoAbuseReportReasons
  "videoAbuseReportReasons.list": 1,

  // videoCategories
  "videoCategories.list": 1,

  // videos
  "videos.list": 1,
  "videos.insert": 1600,
  "videos.update": 50,
  "videos.rate": 50,
  "videos.getRating": 1,
  "videos.reportAbuse": 50,
  "videos.delete": 50,

  // watermarks
  "watermarks.set": 50,
  "watermarks.unset": 50,

  // Default for unknown operations
  default: 1,
} as const;

/**
 * Daily quota limit per Google Cloud Project
 */
export const DAILY_QUOTA_LIMIT = 10000;

/**
 * Quota reservation expiration time (5 minutes)
 */
export const RESERVATION_EXPIRY_MS = 5 * 60 * 1000;

/**
 * Calculate the cost of a YouTube API operation
 */
export function calculateOperationCost(
  operation: string,
  additionalCost: number = 0,
): number {
  const baseCost =
    YOUTUBE_API_COSTS[operation as keyof typeof YOUTUBE_API_COSTS] ||
    YOUTUBE_API_COSTS.default;
  return baseCost + additionalCost;
}

/**
 * Log a YouTube API call for shared quota tracking
 *
 * @param ownershipId - YouTubeOwnership key/ID (for breakdown analytics)
 * @param operation - API operation name (e.g., 'channels.list')
 * @param cost - Quota cost of the operation
 * @param session - Neo4j session
 */
export async function logSharedAPIUsage(
  ownershipId: string,
  operation: string,
  cost: number,
  session: Session,
): Promise<void> {
  try {
    // Get today's date at midnight (UTC) for grouping daily usage
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const dateKey = today.toISOString().split("T")[0]; // YYYY-MM-DD

    // Track at Setting level (shared quota)
    await session.run(
      `
      MATCH (setting:Setting {type: 'oauth'})
      WHERE setting.googleEnabled = true
      WITH setting LIMIT 1

      // Create or update shared usage record for today
      MERGE (setting)-[:SettingAPIUsage]->(usage:YouTubeAPIUsage {date: $dateKey})
      ON CREATE SET
        usage.date = $dateKey,
        usage.totalCost = 0,
        usage.callCount = 0,
        usage.createdAt = datetime()
      SET
        usage.totalCost = usage.totalCost + $cost,
        usage.callCount = usage.callCount + 1,
        usage.lastOperation = $operation,
        usage.lastUpdated = datetime()

      // Track per-operation breakdown
      WITH usage
      MERGE (usage)-[:YouTubeAPIUsageOperation]->(op:YouTubeOperationUsage {operation: $operation})
      ON CREATE SET
        op.operation = $operation,
        op.count = 0,
        op.totalCost = 0,
        op.createdAt = datetime()
      SET
        op.count = op.count + 1,
        op.totalCost = op.totalCost + $cost,
        op.lastUsed = datetime()

      // Track per-ownership breakdown (for analytics)
      WITH usage
      MERGE (usage)-[:YouTubeAPIUsageByOwnership]->(ownershipUsage:YouTubeOwnershipUsage {ownershipId: $ownershipId})
      ON CREATE SET
        ownershipUsage.ownershipId = $ownershipId,
        ownershipUsage.totalCost = 0,
        ownershipUsage.callCount = 0,
        ownershipUsage.createdAt = datetime()
      SET
        ownershipUsage.totalCost = ownershipUsage.totalCost + $cost,
        ownershipUsage.callCount = ownershipUsage.callCount + 1,
        ownershipUsage.lastUpdated = datetime()

      RETURN usage
    `,
      {
        dateKey,
        cost,
        operation,
        ownershipId,
      },
    );
  } catch (error) {
    // Log error but don't throw - API tracking shouldn't break the main flow
    console.error("Error logging shared API usage:", error);
  }
}

/**
 * Get today's shared API usage across all ownerships
 *
 * @param session - Neo4j session
 */
export async function getTodaySharedAPIUsage(session: Session): Promise<{
  totalCost: number;
  callCount: number;
  operations: Record<string, number>;
  remainingQuota: number;
  quotaPercentUsed: number;
  activeReservations: number;
  effectiveRemaining: number;
}> {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const dateKey = today.toISOString().split("T")[0];

  const result = await session.run(
    `
    MATCH (setting:Setting {type: 'oauth'})
    WHERE setting.googleEnabled = true
    WITH setting LIMIT 1

    OPTIONAL MATCH (setting)-[:SettingAPIUsage]->(usage:YouTubeAPIUsage {date: $dateKey})
    OPTIONAL MATCH (usage)-[:YouTubeAPIUsageOperation]->(op:YouTubeOperationUsage)

    // Get active (non-expired) reservations
    OPTIONAL MATCH (setting)-[:SettingQuotaReservation]->(res:QuotaReservation)
    WHERE res.expiresAt > datetime()

    RETURN COALESCE(usage.totalCost, 0) as totalCost,
           COALESCE(usage.callCount, 0) as callCount,
           COLLECT(DISTINCT {operation: op.operation, count: op.count}) as operations,
           COALESCE(SUM(res.reservedAmount), 0) as activeReservations
  `,
    { dateKey },
  );

  if (result.records.length === 0) {
    return {
      totalCost: 0,
      callCount: 0,
      operations: {},
      remainingQuota: DAILY_QUOTA_LIMIT,
      quotaPercentUsed: 0,
      activeReservations: 0,
      effectiveRemaining: DAILY_QUOTA_LIMIT,
    };
  }

  const record = result.records[0];
  const totalCost = record.get("totalCost") || 0;
  const callCount = record.get("callCount") || 0;
  const operationsList = record.get("operations") || [];
  const activeReservations = record.get("activeReservations") || 0;

  // Convert operations list to map
  const operations: Record<string, number> = {};
  for (const op of operationsList) {
    if (op.operation) {
      operations[op.operation] = op.count || 0;
    }
  }

  const remainingQuota = Math.max(0, DAILY_QUOTA_LIMIT - totalCost);
  const effectiveRemaining = Math.max(0, remainingQuota - activeReservations);
  const quotaPercentUsed = Math.min(100, (totalCost / DAILY_QUOTA_LIMIT) * 100);

  return {
    totalCost,
    callCount,
    operations,
    remainingQuota,
    quotaPercentUsed,
    activeReservations,
    effectiveRemaining,
  };
}

/**
 * Get shared API usage breakdown by ownership
 *
 * @param session - Neo4j session
 * @param dateKey - Optional date key (defaults to today)
 */
export async function getSharedAPIUsageByOwnership(
  session: Session,
  dateKey?: string,
): Promise<
  Array<{
    ownershipId: string;
    channelName: string | null;
    customName: string | null;
    totalCost: number;
    callCount: number;
    percentOfTotal: number;
  }>
> {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const targetDate = dateKey || today.toISOString().split("T")[0];

  const result = await session.run(
    `
    MATCH (setting:Setting {type: 'oauth'})-[:SettingAPIUsage]->(usage:YouTubeAPIUsage {date: $dateKey})
    MATCH (usage)-[:YouTubeAPIUsageByOwnership]->(ownershipUsage:YouTubeOwnershipUsage)
    MATCH (o:YouTubeOwnership {key: ownershipUsage.ownershipId})

    RETURN ownershipUsage.ownershipId as ownershipId,
           o.channelName as channelName,
           o.customName as customName,
           ownershipUsage.totalCost as totalCost,
           ownershipUsage.callCount as callCount,
           usage.totalCost as grandTotal
    ORDER BY ownershipUsage.totalCost DESC
  `,
    { dateKey: targetDate },
  );

  return result.records.map((record) => {
    const totalCost = record.get("totalCost") || 0;
    const grandTotal = record.get("grandTotal") || 1; // Avoid division by zero
    const percentOfTotal = (totalCost / grandTotal) * 100;

    return {
      ownershipId: record.get("ownershipId"),
      channelName: record.get("channelName"),
      customName: record.get("customName"),
      totalCost,
      callCount: record.get("callCount") || 0,
      percentOfTotal,
    };
  });
}

/**
 * Reserve quota for an upcoming operation (priority-based allocation)
 *
 * @param ownershipId - YouTubeOwnership key/ID requesting quota
 * @param estimatedCost - Estimated quota cost
 * @param priority - Priority level (0=free, 1=premium, 2=admin)
 * @param operation - Operation description
 * @param session - Neo4j session
 * @returns Reservation ID if successful
 * @throws QuotaExhaustedError if quota unavailable
 */
export async function reserveQuota(
  ownershipId: string,
  estimatedCost: number,
  priority: number,
  operation: string,
  session: Session,
): Promise<string> {
  // Clean up expired reservations first
  await cleanupExpiredReservations(session);

  // Check available quota
  const usage = await getTodaySharedAPIUsage(session);

  if (usage.effectiveRemaining < estimatedCost) {
    // Check if we can bump lower priority reservations
    if (priority > 0) {
      const bumped = await tryBumpLowerPriorityReservations(
        estimatedCost,
        priority,
        session,
      );

      if (bumped < estimatedCost) {
        throw new QuotaExhaustedError(
          `Insufficient quota available. Need ${estimatedCost}, have ${usage.effectiveRemaining + bumped}`,
          usage.effectiveRemaining + bumped,
        );
      }
    } else {
      throw new QuotaExhaustedError(
        `Insufficient quota available. Need ${estimatedCost}, have ${usage.effectiveRemaining}`,
        usage.effectiveRemaining,
      );
    }
  }

  // Create reservation
  const reservationId = `res_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const expiresAt = new Date(Date.now() + RESERVATION_EXPIRY_MS);

  await session.run(
    `
    MATCH (setting:Setting {type: 'oauth'})
    WHERE setting.googleEnabled = true
    WITH setting LIMIT 1

    CREATE (res:QuotaReservation {
      id: $reservationId,
      ownershipId: $ownershipId,
      reservedAmount: $estimatedCost,
      priority: $priority,
      operation: $operation,
      createdAt: datetime(),
      expiresAt: datetime($expiresAt)
    })
    CREATE (setting)-[:SettingQuotaReservation]->(res)

    RETURN res.id as id
  `,
    {
      reservationId,
      ownershipId,
      estimatedCost,
      priority,
      operation,
      expiresAt: expiresAt.toISOString(),
    },
  );

  return reservationId;
}

/**
 * Release a quota reservation (when operation is cancelled or completed)
 *
 * @param reservationId - Reservation ID to release
 * @param session - Neo4j session
 */
export async function releaseQuota(
  reservationId: string,
  session: Session,
): Promise<void> {
  await session.run(
    `
    MATCH (res:QuotaReservation {id: $reservationId})
    DETACH DELETE res
  `,
    { reservationId },
  );
}

/**
 * Try to bump lower priority reservations to free up quota
 *
 * @param needed - Amount of quota needed
 * @param myPriority - Priority of the requesting operation
 * @param session - Neo4j session
 * @returns Amount of quota freed
 */
async function tryBumpLowerPriorityReservations(
  needed: number,
  myPriority: number,
  session: Session,
): Promise<number> {
  // Find lower priority reservations
  const result = await session.run(
    `
    MATCH (setting:Setting {type: 'oauth'})-[:SettingQuotaReservation]->(res:QuotaReservation)
    WHERE res.priority < $myPriority AND res.expiresAt > datetime()
    RETURN res.id as id, res.reservedAmount as amount, res.ownershipId as ownershipId
    ORDER BY res.priority ASC, res.createdAt ASC
  `,
    { myPriority },
  );

  let freed = 0;
  const bumpedIds: string[] = [];

  for (const record of result.records) {
    if (freed >= needed) break;

    const id = record.get("id");
    const amount = record.get("amount") || 0;

    bumpedIds.push(id);
    freed += amount;
  }

  // Delete the bumped reservations
  if (bumpedIds.length > 0) {
    await session.run(
      `
      MATCH (res:QuotaReservation)
      WHERE res.id IN $ids
      DETACH DELETE res
    `,
      { ids: bumpedIds },
    );
  }

  return freed;
}

/**
 * Clean up expired quota reservations
 *
 * @param session - Neo4j session
 */
export async function cleanupExpiredReservations(
  session: Session,
): Promise<number> {
  const result = await session.run(`
    MATCH (res:QuotaReservation)
    WHERE res.expiresAt <= datetime()
    DETACH DELETE res
    RETURN count(res) as deletedCount
  `);

  return result.records[0]?.get("deletedCount") || 0;
}

/**
 * Get API usage history for the last N days (shared)
 *
 * @param days - Number of days to retrieve
 * @param session - Neo4j session
 */
export async function getSharedAPIUsageHistory(
  days: number,
  session: Session,
): Promise<
  Array<{
    date: string;
    totalCost: number;
    callCount: number;
    operations: Record<string, number>;
  }>
> {
  const result = await session.run(
    `
    MATCH (setting:Setting {type: 'oauth'})-[:SettingAPIUsage]->(usage:YouTubeAPIUsage)
    WHERE usage.createdAt >= datetime() - duration({days: $days})
    OPTIONAL MATCH (usage)-[:YouTubeAPIUsageOperation]->(op:YouTubeOperationUsage)
    RETURN usage.date as date,
           usage.totalCost as totalCost,
           usage.callCount as callCount,
           COLLECT({operation: op.operation, count: op.count}) as operations
    ORDER BY usage.date DESC
  `,
    { days },
  );

  return result.records.map((record) => {
    const operationsList = record.get("operations") || [];
    const operations: Record<string, number> = {};
    for (const op of operationsList) {
      if (op.operation) {
        operations[op.operation] = op.count || 0;
      }
    }

    return {
      date: record.get("date"),
      totalCost: record.get("totalCost") || 0,
      callCount: record.get("callCount") || 0,
      operations,
    };
  });
}

/**
 * Check if shared quota is approaching limit
 *
 * @param session - Neo4j session
 * @param threshold - Warning threshold (default: 0.8 = 80%)
 */
export async function isApproachingQuotaLimit(
  session: Session,
  threshold: number = 0.8, // 80% threshold
): Promise<{
  isApproaching: boolean;
  percentUsed: number;
  remainingQuota: number;
  effectiveRemaining: number;
}> {
  const usage = await getTodaySharedAPIUsage(session);
  const isApproaching = usage.quotaPercentUsed >= threshold * 100;

  return {
    isApproaching,
    percentUsed: usage.quotaPercentUsed,
    remainingQuota: usage.remainingQuota,
    effectiveRemaining: usage.effectiveRemaining,
  };
}

/**
 * Clean up old API usage records (older than 30 days)
 */
export async function cleanupOldAPIUsage(session: Session): Promise<number> {
  const result = await session.run(`
    MATCH (usage:YouTubeAPIUsage)
    WHERE usage.createdAt < datetime() - duration({days: 30})
    DETACH DELETE usage
    RETURN count(usage) as deletedCount
  `);

  return result.records[0]?.get("deletedCount") || 0;
}

/**
 * Custom error for quota exhaustion
 */
export class QuotaExhaustedError extends Error {
  public readonly remainingQuota: number;

  constructor(message: string, remainingQuota: number) {
    super(message);
    this.name = "QuotaExhaustedError";
    this.remainingQuota = remainingQuota;
  }
}
