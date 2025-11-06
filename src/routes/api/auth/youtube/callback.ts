/**
 * YouTube OAuth Callback Endpoint
 *
 * Handles the callback from Google after user authorizes.
 * Exchanges authorization code for tokens and stores them securely.
 */

import { handleYouTubeCallback } from '~/lib/youtube/youtubeOAuth';
import { getDBSessionForSubdomain } from '~/cypher/session/getSessionForSubdomain';
import type {APIEvent} from "@solidjs/start/server";

export async function GET(event: APIEvent) {
  const { dbSession } = await getDBSessionForSubdomain(event.request);

  try {
    // Get query parameters
    const url = new URL(event.request.url);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state'); // This is the userId
    const error = url.searchParams.get('error');

    // Handle user denial
    if (error === 'access_denied') {
      return new Response(null, {
        status: 302,
        headers: {
          Location:
            '/settings?error=' +
            encodeURIComponent(
              'Authorization was cancelled. You need to authorize access to use YouTube features.'
            ),
        },
      });
    }

    // Validate required parameters
    if (!code || !state) {
      return new Response(null, {
        status: 302,
        headers: {
          Location:
            '/settings?error=' +
            encodeURIComponent('Invalid OAuth callback: missing parameters'),
        },
      });
    }

    const userId = state;

    // Exchange code for tokens
    const result = await handleYouTubeCallback(code, userId, dbSession, event.request);

    if (!result.success) {
      return new Response(null, {
        status: 302,
        headers: {
          Location:
            '/settings?error=' +
            encodeURIComponent(result.error || 'Failed to connect YouTube'),
        },
      });
    }

    // Success! Redirect to settings page
    return new Response(null, {
      status: 302,
      headers: {
        Location:
            '/settings?success=' +
          encodeURIComponent(
            'YouTube account connected successfully! You can now add channels and playlists.'
          ),
      },
    });
  } catch (error) {
    console.error('YouTube OAuth callback error:', error);

    return new Response(null, {
      status: 302,
      headers: {
        Location:
          '/settings?error=' +
          encodeURIComponent(
            error instanceof Error
              ? error.message
              : 'Failed to complete YouTube authorization'
          ),
      },
    });
  } finally {
    await dbSession.close();
  }
}
