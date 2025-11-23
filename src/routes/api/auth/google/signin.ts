import type { APIEvent } from "@solidjs/start/server";
import { google } from "googleapis";

import { getDBSessionForSubdomain } from "~/cypher/session/getSessionForSubdomain";
import { APIError, handleAPIError } from "~/lib/api/server/apiErrorHandler";
import { decryptClientSecret } from "~/lib/auth/tokenEncryption";

export async function GET({ request }: APIEvent) {
  const { dbSession } = await getDBSessionForSubdomain(request);

  try {
    // Fetch OAuth settings from database
    const result = await dbSession.run(
      "MATCH (o:Setting {type: 'oauth'}) WHERE o.googleEnabled = true RETURN o LIMIT 1",
    );

    if (result.records.length === 0) {
      throw new APIError("Google OAuth is not configured or enabled", 400);
    }

    const oauthSetting = result.records[0].get("o").properties;

    // Decrypt the client secret
    let clientSecret = "";
    if (oauthSetting.googleClientSecret) {
      try {
        clientSecret = decryptClientSecret(oauthSetting.googleClientSecret);
      } catch (e) {
        console.error("Failed to decrypt Google client secret:", e);
        throw new APIError("Failed to decrypt Google OAuth credentials", 500);
      }
    }

    const clientId = oauthSetting.googleClientId;

    if (!(clientId && clientSecret)) {
      throw new APIError(
        "Google OAuth credentials are not properly configured",
        400,
      );
    }

    // Get the origin from the request - always use HTTPS
    const url = new URL(request.url);
    const origin = `https://${url.hostname}`;
    const redirectUri = `${origin}/api/auth/google/callback`;

    // Create OAuth2 client
    const oauth2Client = new google.auth.OAuth2(
      clientId,
      clientSecret,
      redirectUri,
    );

    // Generate the authorization URL
    const authUrl = oauth2Client.generateAuthUrl({
      access_type: "offline",
      scope: [
        "https://www.googleapis.com/auth/userinfo.profile",
        "https://www.googleapis.com/auth/userinfo.email",
      ],
      // Add state parameter for CSRF protection
      state: Buffer.from(
        JSON.stringify({
          timestamp: Date.now(),
          origin,
        }),
      ).toString("base64"),
    });

    // Redirect to Google's OAuth consent screen
    return new Response(null, {
      headers: {
        Location: authUrl,
      },
      status: 302,
    });
  } catch (error) {
    return handleAPIError(error);
  } finally {
    await dbSession.close();
  }
}
