/**
 * YouTube Connection Status Endpoint
 *
 * Returns the current YouTube connection status for the logged-in user.
 */

import { getYouTubeConnectionStatus } from '~/lib/youtube/youtubeOAuth';
import { getUserFromSession } from '~/server/auth/session/getUserFromSession';
import { getDBSessionForSubdomain } from '~/cypher/session/getSessionForSubdomain';
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

    // Get connection status
    const status = await getYouTubeConnectionStatus(user.P.uuid, dbSession);

    return new Response(
      JSON.stringify({
        success: true,
        data: status,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error getting YouTube status:', error);

    return new Response(
      JSON.stringify({
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to get YouTube status',
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
