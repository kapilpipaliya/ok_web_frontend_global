/**
 * YouTube API Usage Tracking
 *
 * Tracks YouTube API quota usage per user.
 * Each user has 10,000 units/day with per-user OAuth.
 */

import type { Session } from 'neo4j-driver';

/**
 * YouTube API quota costs for different operations
 * Based on: https://developers.google.com/youtube/v3/determine_quota_cost
 */
export const YOUTUBE_API_COSTS = {
  // Read operations
  'channels.list': 1,
  'playlists.list': 1,
  'playlistItems.list': 1,
  'videos.list': 1,
  'search.list': 100,  // Search is expensive!

  // Default for unknown operations
  'default': 1,
} as const;

/**
 * Calculate the cost of a YouTube API operation
 */
export function calculateOperationCost(operation: string, additionalCost: number = 0): number {
  const baseCost = YOUTUBE_API_COSTS[operation as keyof typeof YOUTUBE_API_COSTS]
    || YOUTUBE_API_COSTS.default;
  return baseCost + additionalCost;
}

/**
 * Log a YouTube API call for quota tracking
 */
export async function logAPIUsage(
  userUuid: string,
  operation: string,
  cost: number,
  session: Session
): Promise<void> {
  try {
    // Get today's date at midnight (UTC) for grouping daily usage
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const dateKey = today.toISOString().split('T')[0]; // YYYY-MM-DD

    // Create or update usage record for today AND per-operation tracking
    await session.run(`
      MATCH (u:User {uuid: $userUuid})
      MERGE (u)-[:UserYouTubeAPIUsage]->(usage:YouTubeAPIUsage {date: $dateKey})
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
      WITH usage
      MERGE (usage)-[:OperationUsage]->(op:YouTubeOperationUsage {operation: $operation})
      ON CREATE SET
        op.operation = $operation,
        op.count = 0,
        op.totalCost = 0,
        op.createdAt = datetime()
      SET
        op.count = op.count + 1,
        op.totalCost = op.totalCost + $cost,
        op.lastUsed = datetime()
      RETURN usage, op
    `, {
      userUuid,
      dateKey,
      cost,
      operation
    });
  } catch (error) {
    // Log error but don't throw - API tracking shouldn't break the main flow
    console.error('Error logging API usage:', error);
  }
}

/**
 * Get today's API usage for a user
 */
export async function getTodayAPIUsage(
  userUuid: string,
  session: Session
): Promise<{
  totalCost: number;
  callCount: number;
  operations: Record<string, number>;
  remainingQuota: number;
  quotaPercentUsed: number;
}> {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const dateKey = today.toISOString().split('T')[0];

  const result = await session.run(`
    MATCH (u:User {uuid: $userUuid})-[:UserYouTubeAPIUsage]->(usage:YouTubeAPIUsage {date: $dateKey})
    OPTIONAL MATCH (usage)-[:OperationUsage]->(op:YouTubeOperationUsage)
    RETURN usage.totalCost as totalCost,
           usage.callCount as callCount,
           COLLECT({operation: op.operation, count: op.count}) as operations
  `, { userUuid, dateKey });

  if (result.records.length === 0) {
    return {
      totalCost: 0,
      callCount: 0,
      operations: {},
      remainingQuota: 10000,
      quotaPercentUsed: 0
    };
  }

  const record = result.records[0];
  const totalCost = record.get('totalCost') || 0;
  const callCount = record.get('callCount') || 0;
  const operationsList = record.get('operations') || [];

  // Convert operations list to map
  const operations: Record<string, number> = {};
  for (const op of operationsList) {
    if (op.operation) {
      operations[op.operation] = op.count || 0;
    }
  }

  const dailyQuota = 10000;
  const remainingQuota = Math.max(0, dailyQuota - totalCost);
  const quotaPercentUsed = Math.min(100, (totalCost / dailyQuota) * 100);

  return {
    totalCost,
    callCount,
    operations,
    remainingQuota,
    quotaPercentUsed
  };
}

/**
 * Get API usage history for the last N days
 */
export async function getAPIUsageHistory(
  userUuid: string,
  days: number,
  session: Session
): Promise<Array<{
  date: string;
  totalCost: number;
  callCount: number;
  operations: Record<string, number>;
}>> {
  const result = await session.run(`
    MATCH (u:User {uuid: $userUuid})-[:UserYouTubeAPIUsage]->(usage:YouTubeAPIUsage)
    WHERE usage.createdAt >= datetime() - duration({days: $days})
    OPTIONAL MATCH (usage)-[:OperationUsage]->(op:YouTubeOperationUsage)
    RETURN usage.date as date,
           usage.totalCost as totalCost,
           usage.callCount as callCount,
           COLLECT({operation: op.operation, count: op.count}) as operations
    ORDER BY usage.date DESC
  `, { userUuid, days });

  return result.records.map(record => {
    const operationsList = record.get('operations') || [];
    const operations: Record<string, number> = {};
    for (const op of operationsList) {
      if (op.operation) {
        operations[op.operation] = op.count || 0;
      }
    }

    return {
      date: record.get('date'),
      totalCost: record.get('totalCost') || 0,
      callCount: record.get('callCount') || 0,
      operations
    };
  });
}

/**
 * Check if user is approaching quota limit
 */
export async function isApproachingQuotaLimit(
  userUuid: string,
  session: Session,
  threshold: number = 0.8  // 80% threshold
): Promise<{
  isApproaching: boolean;
  percentUsed: number;
  remainingQuota: number;
}> {
  const usage = await getTodayAPIUsage(userUuid, session);
  const isApproaching = usage.quotaPercentUsed >= (threshold * 100);

  return {
    isApproaching,
    percentUsed: usage.quotaPercentUsed,
    remainingQuota: usage.remainingQuota
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

  return result.records[0]?.get('deletedCount') || 0;
}
