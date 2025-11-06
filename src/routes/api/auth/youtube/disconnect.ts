/**
 * YouTube Disconnect Endpoint - Multi-Ownership Support
 *
 * Allows users to disconnect a specific YouTube ownership.
 * Revokes tokens and schedules data deletion per privacy policy.
 *
 * Request body:
 * - ownershipId: The ownership ID to disconnect
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

    // Parse request body
    const body = await event.request.json();
    const { ownershipId } = body;

    if (!ownershipId) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'ownershipId is required',
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Verify ownership belongs to user
    const ownershipCheck = await dbSession.run(
      `
      MATCH (u:User {uuid: $userId})-[:UserYouTubeOwnership]->(o:YouTubeOwnership {key: $ownershipId})
      RETURN count(o) > 0 as exists
      `,
      { userId: user.P.uuid, ownershipId }
    );

    if (!ownershipCheck.records[0]?.get('exists')) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Ownership not found or does not belong to you',
        }),
        {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Disconnect YouTube ownership
    const result = await disconnectYouTube(ownershipId, dbSession);

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
