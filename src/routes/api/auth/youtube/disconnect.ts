/**
 * YouTube Disconnect Endpoint
 *
 * Allows users to disconnect their YouTube account.
 * Revokes tokens and schedules data deletion per privacy policy.
 */

import { disconnectYouTube } from '~/lib/youtube/youtubeOAuth';
import { getUserFromSession } from '~/server/auth/session/getUserFromSession';
import { getDBSessionForSubdomain } from '~/cypher/session/getSessionForSubdomain';
import type {APIEvent} from "@solidjs/start/server";

export async function POST(event: APIEvent) {
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

    // Disconnect YouTube
    const result = await disconnectYouTube(user.P.uuid, dbSession);

    return new Response(JSON.stringify(result), {
      status: result.success ? 200 : 500,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error disconnecting YouTube:', error);

    return new Response(
      JSON.stringify({
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to disconnect YouTube',
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
