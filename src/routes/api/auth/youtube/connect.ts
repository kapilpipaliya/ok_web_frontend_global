/**
 * YouTube OAuth Connection Endpoint - Multi-Ownership Support
 *
 * Initiates the OAuth flow by redirecting user to Google's authorization page.
 * User must be logged in to connect their YouTube account.
 * Supports adding multiple YouTube accounts per user.
 *
 * Query parameters:
 * - customName (optional): Custom display name for this ownership
 */

import { getYouTubeAuthUrl } from "~/lib/youtube/youtubeOAuth";
import { getUserFromSession } from "~/server/auth/session/getUserFromSession";
import { getDBSessionForSubdomain } from "~/cypher/session/getSessionForSubdomain";
import type { APIEvent } from "@solidjs/start/server";

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
          Location: "/auth/signin?redirect=/accounts",
        },
      });
    }

    // Get optional custom name from query parameters
    const url = new URL(event.request.url);
    const customName = url.searchParams.get("customName") || undefined;

    // Generate YouTube OAuth URL with optional custom name
    const authUrl = await getYouTubeAuthUrl(
      user.P.uuid,
      dbSession,
      event.request,
      customName,
    );

    // Redirect user to Google authorization page
    return new Response(null, {
      status: 302,
      headers: {
        Location: authUrl,
      },
    });
  } catch (error) {
    console.error("Error initiating YouTube OAuth:", error);

    // Redirect to accounts page with error
    const errorMessage = encodeURIComponent(
      error instanceof Error
        ? error.message
        : "Failed to connect YouTube account",
    );

    return new Response(null, {
      status: 302,
      headers: {
        Location: `/accounts?error=${errorMessage}`,
      },
    });
  } finally {
    await dbSession.close();
  }
}
