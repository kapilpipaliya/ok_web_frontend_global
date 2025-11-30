/**
 * YouTube OAuth Callback Endpoint - Multi-Ownership Support
 *
 * Handles the callback from Google after user authorizes.
 * Exchanges authorization code for tokens and stores them securely.
 */

import { handleYouTubeCallback } from "~/lib/youtube/youtubeOAuth";
import { getDBSessionForSubdomain } from "~/cypher/session/getSessionForSubdomain";
import { createRedirectResponse } from "~/lib/api/server/capacitorRedirect";
import type { APIEvent } from "@solidjs/start/server";

export async function GET(event: APIEvent) {
  const { dbSession } = await getDBSessionForSubdomain(event.request);

  try {
    // Get query parameters
    const url = new URL(event.request.url);
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");
    const error = url.searchParams.get("error");

    // Handle user denial
    if (error === "access_denied") {
      return createRedirectResponse(
        event.request,
        "/accounts?error=" +
          encodeURIComponent(
            "Authorization was cancelled. You need to authorize access to use YouTube features.",
          ),
      );
    }

    // Validate required parameters
    if (!(code && state)) {
      return createRedirectResponse(
        event.request,
        "/accounts?error=" +
          encodeURIComponent("Invalid OAuth callback: missing parameters"),
      );
    }

    // Parse state (now contains userId, ownershipId, customName)
    let stateData: {
      userId: string;
      ownershipId: string;
      customName?: string | null;
    };
    try {
      stateData = JSON.parse(state);
      if (!(stateData.userId && stateData.ownershipId)) {
        throw new Error("Invalid state structure");
      }
    } catch (parseError) {
      console.error("Failed to parse OAuth state:", parseError);
      return createRedirectResponse(
        event.request,
        "/accounts?error=" +
          encodeURIComponent("Invalid OAuth state parameter"),
      );
    }

    // Exchange code for tokens and create ownership
    const result = await handleYouTubeCallback(
      code,
      stateData,
      dbSession,
      event.request,
    );

    if (!result.success) {
      return createRedirectResponse(
        event.request,
        "/accounts?error=" +
          encodeURIComponent(result.error || "Failed to connect YouTube"),
      );
    }

    // Determine success message based on whether it's an update or new connection
    const channelName = result.ownership?.channelName || "YouTube account";
    let successMessage: string;
    if (result.isUpdate && result.wasRevoked) {
      successMessage = `${channelName} reconnected successfully!`;
    } else if (result.isUpdate) {
      successMessage = `${channelName} token updated successfully!`;
    } else {
      successMessage = `${channelName} connected successfully!`;
    }

    // Success! Redirect to accounts page
    return createRedirectResponse(
      event.request,
      "/accounts?success=" + encodeURIComponent(successMessage),
    );
  } catch (error) {
    console.error("YouTube OAuth callback error:", error);
    return createRedirectResponse(
      event.request,
      "/accounts?error=" +
        encodeURIComponent(
          error instanceof Error
            ? error.message
            : "Failed to complete YouTube authorization",
        ),
    );
  } finally {
    await dbSession.close();
  }
}
