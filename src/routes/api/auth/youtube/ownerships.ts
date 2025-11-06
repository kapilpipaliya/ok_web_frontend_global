/**
 * YouTube Ownerships List Endpoint
 *
 * Returns a list of all YouTube ownerships for the logged-in user.
 * Used for populating ownership selectors and displaying connected accounts.
 */

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

    // Get all ownerships for the user with active tokens
    const result = await dbSession.run(
      `
      MATCH (u:User {uuid: $userId})-[:UserYouTubeOwnership]->(o:YouTubeOwnership)
            -[:YouTubeOwnershipToken]->(token:YouTubeToken)
      WHERE token.isRevoked = false
      RETURN o.key as ownershipId,
             o.channelName as channelName,
             o.customName as customName,
             o.channelId as channelId,
             o.isPrimary as isPrimary,
             o.lastSelected as lastSelected,
             o.createdAt as createdAt
      ORDER BY o.isPrimary DESC, o.lastSelected DESC
      `,
      { userId: user.P.uuid }
    );

    const ownerships = result.records.map((record) => ({
      ownershipId: record.get('ownershipId'),
      channelName: record.get('channelName'),
      customName: record.get('customName'),
      channelId: record.get('channelId'),
      isPrimary: record.get('isPrimary'),
      lastSelected: record.get('lastSelected'),
      createdAt: record.get('createdAt'),
    }));

    return new Response(
      JSON.stringify({
        success: true,
        data: ownerships,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error getting YouTube ownerships:', error);

    return new Response(
      JSON.stringify({
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to get YouTube ownerships',
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
