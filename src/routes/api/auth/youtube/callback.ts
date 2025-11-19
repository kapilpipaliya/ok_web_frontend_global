/**
 * YouTube OAuth Callback Endpoint - Multi-Ownership Support
 *
 * Handles the callback from Google after user authorizes.
 * Exchanges authorization code for tokens, stores them securely,
 * and triggers auto-fetch of all channels owned by the YouTube account.
 */

import { handleYouTubeCallback } from "~/lib/youtube/youtubeOAuth";
import { getDBSessionForSubdomain } from "~/cypher/session/getSessionForSubdomain";
import { executeNamedServerFunction } from "~/cypher/get/executeNamedServerFunction";
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
    if (!code || !state) {
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
      if (!stateData.userId || !stateData.ownershipId) {
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

    // Trigger auto-fetch of all channels for this ownership
    const ownershipId = result.ownership?.id || stateData.ownershipId;
    const channelName = result.ownership?.channelName || "YouTube account";

    // Fetch channels in the background
    try {
      const fetchResult = await executeNamedServerFunction(
        {
          functionName: "autoFetchOwnershipChannels",
          contextData: { ownershipId },
        },
        {
          request: event.request,
          dbSession,
        },
      );

      if (fetchResult.result?.success) {
        console.log(
          `Auto-fetched ${fetchResult.result.channelCount} channels for ${channelName}`,
        );
      } else {
        console.error(
          `Failed to auto-fetch channels for ${channelName}:`,
          fetchResult.result?.error,
        );
      }
    } catch (error) {
      console.error(`Error during auto-fetch for ${channelName}:`, error);
    }

    // Determine success message based on whether it's an update or new connection
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
