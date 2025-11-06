/**
 * YouTube API Usage Statistics Endpoint
 *
 * Returns YouTube API quota usage statistics for the logged-in user.
 */

import { getUserFromSession } from '~/server/auth/session/getUserFromSession';
import { getDBSessionForSubdomain } from '~/cypher/session/getSessionForSubdomain';
import { getTodayAPIUsage, getAPIUsageHistory } from '~/lib/youtube/apiUsageTracking';
import type {APIEvent} from "@solidjs/start/server";

export async function GET(event: APIEvent) {
  const { dbSession } = await getDBSessionForSubdomain(event.request);

  try {
    // Get current logged-in user
    const user = await getUserFromSession(event.request);

    if (!user) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Not authenticated',
        }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Get today's usage
    const todayUsage = await getTodayAPIUsage(user.P.uuid, dbSession);

    // Get last 7 days history
    const history = await getAPIUsageHistory(user.P.uuid, 7, dbSession);

    // Determine status based on quota usage
    let status = 'good';
    let statusMessage = 'Your API usage is within normal limits';

    if (todayUsage.quotaPercentUsed >= 90) {
      status = 'critical';
      statusMessage = 'You are approaching your daily quota limit! (10,000 units/day)';
    } else if (todayUsage.quotaPercentUsed >= 70) {
      status = 'warning';
      statusMessage = 'You are using a significant portion of your daily quota';
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          today: {
            totalCost: todayUsage.totalCost,
            callCount: todayUsage.callCount,
            operations: todayUsage.operations,
            remainingQuota: todayUsage.remainingQuota,
            quotaPercentUsed: Math.round(todayUsage.quotaPercentUsed * 10) / 10,
            dailyLimit: 10000,
          },
          history: history.map(day => ({
            date: day.date,
            totalCost: day.totalCost,
            callCount: day.callCount,
            percentUsed: Math.round((day.totalCost / 10000) * 1000) / 10,
          })),
          status,
          statusMessage,
        },
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error getting YouTube API usage:', error);

    return new Response(
      JSON.stringify({
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to get YouTube API usage',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } finally {
    await dbSession.close();
  }
}
