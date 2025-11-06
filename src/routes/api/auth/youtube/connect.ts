/**
 * YouTube OAuth Connection Endpoint
 *
 * Initiates the OAuth flow by redirecting user to Google's authorization page.
 * User must be logged in to connect their YouTube account.
 */

import { getYouTubeAuthUrl } from '~/lib/youtube/youtubeOAuth';
import { getUserFromSession } from '~/server/auth/session/getUserFromSession';
import { getDBSessionForSubdomain } from '~/cypher/session/getSessionForSubdomain';
import type {APIEvent} from "@solidjs/start/server";

export async function GET(event: APIEvent) {
  const { dbSession } = await getDBSessionForSubdomain(event.request);

  try {
    // Get current logged-in user
    const user = await getUserFromSession(event.request);

    if (!user) {
      // User not logged in - redirect to sign in page
      return new Response(null, {
        status: 302,
        headers: {
          Location: '/auth/signin?redirect=/settings',
        },
      });
    }

    // Generate YouTube OAuth URL
    const authUrl = await getYouTubeAuthUrl(user.P.uuid, dbSession, event.request);

    // Redirect user to Google authorization page
    return new Response(null, {
      status: 302,
      headers: {
        Location: authUrl,
      },
    });
  } catch (error) {
    console.error('Error initiating YouTube OAuth:', error);

    // Redirect to settings with error
    const errorMessage = encodeURIComponent(
      error instanceof Error
        ? error.message
        : 'Failed to connect YouTube account'
    );

    return new Response(null, {
      status: 302,
      headers: {
        Location: `/settings?error=${errorMessage}`,
      },
    });
  } finally {
    await dbSession.close();
  }
}
