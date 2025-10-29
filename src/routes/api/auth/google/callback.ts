import type { APIEvent } from "@solidjs/start/server";
import { google } from "googleapis";
import { v7 as uuidv7 } from "uuid";

import { convertNodeToJson } from "~/cypher/conversion/convertNodeToJson";
import { createActivityLog } from "~/cypher/mutate/activity/createActivityLog";
import { getDBSessionForSubdomain } from "~/cypher/session/getSessionForSubdomain";
import { APIError, handleAPIError } from "~/lib/api/server/apiErrorHandler";
import { getGeneralSettings } from "~/routes/api/auth/(user)/functions/getGeneralSettings";
import { updateRedirectUrl } from "~/routes/api/auth/(user)/functions/updateRedirectUrl";
import { updateSession } from "~/server/auth/session/updateSession";

export async function GET({ request }: APIEvent) {
  const { dbSession, subDomain } = await getDBSessionForSubdomain(request);

  try {
    const url = new URL(request.url);
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");

    if (!code) {
      throw new APIError("Authorization code is missing", 400);
    }

    // Verify state parameter for CSRF protection
    if (state) {
      try {
        const stateData = JSON.parse(
          Buffer.from(state, "base64").toString("utf-8"),
        );
        // Check if timestamp is within 10 minutes
        if (Date.now() - stateData.timestamp > 600000) {
          throw new APIError("OAuth state expired", 400);
        }
      } catch (e) {
        throw new APIError("Invalid OAuth state", 400);
      }
    }

    // Fetch OAuth settings from database
    const settingsResult = await dbSession.run(
      "MATCH (o:OAuthSettings) WHERE o.googleEnabled = true RETURN o LIMIT 1",
    );

    if (settingsResult.records.length === 0) {
      throw new APIError("Google OAuth is not configured or enabled", 400);
    }

    const oauthSettings = settingsResult.records[0].get("o").properties;

    // Decrypt the client secret
    let clientSecret = "";
    if (oauthSettings.googleClientSecret) {
      try {
        clientSecret = Buffer.from(
          oauthSettings.googleClientSecret,
          "base64",
        ).toString("utf-8");
      } catch (e) {
        clientSecret = oauthSettings.googleClientSecret;
      }
    }

    const clientId = oauthSettings.googleClientId;

    if (!clientId || !clientSecret) {
      throw new APIError(
        "Google OAuth credentials are not properly configured",
        400,
      );
    }

    // Get the origin from the request
    const origin = url.origin;
    const redirectUri = `${origin}/api/auth/google/callback`;

    // Create OAuth2 client
    const oauth2Client = new google.auth.OAuth2(
      clientId,
      clientSecret,
      redirectUri,
    );

    // Exchange authorization code for tokens
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // Fetch user info from Google
    const oauth2 = google.oauth2({
      auth: oauth2Client,
      version: "v2",
    });

    const userInfoResponse = await oauth2.userinfo.get();
    const googleUser = userInfoResponse.data;

    if (!googleUser.email) {
      throw new APIError("Unable to retrieve email from Google", 400);
    }

    // Check if user exists with this email
    const userResult = await dbSession.run(
      "MATCH (u:User) WHERE u.email = $email RETURN u",
      { email: googleUser.email.toLowerCase() },
    );

    let user;

    if (userResult.records.length > 0) {
      // User exists, update with Google data
      user = convertNodeToJson(userResult.records[0].get("u"));

      // Check if the user's account is pending deletion
      if (user.P.pendingDeletion === true) {
        throw new APIError(
          "This account is scheduled for deletion and cannot be accessed. Please contact support if this is a mistake.",
          403,
        );
      }

      // Update user with Google information
      await dbSession.run(
        `MATCH (u:User) WHERE u.uuid = $uuid
         SET u.googleId = $googleId,
             u.googleEmail = $googleEmail,
             u.googleProfilePicture = $googleProfilePicture,
             u.authProvider = CASE
               WHEN u.password IS NOT NULL THEN 'both'
               ELSE 'google'
             END,
             u.emailConfirmed = true
         RETURN u`,
        {
          googleEmail: googleUser.email,
          googleId: googleUser.id,
          googleProfilePicture: googleUser.picture || "",
          uuid: user.P.uuid,
        },
      );

      // Refresh user data
      const updatedUserResult = await dbSession.run(
        "MATCH (u:User) WHERE u.uuid = $uuid RETURN u",
        { uuid: user.P.uuid },
      );
      user = convertNodeToJson(updatedUserResult.records[0].get("u"));

      await createActivityLog(
        dbSession,
        "google-signin",
        "User",
        user.P.uuid,
        user.P.email,
        "User logged in with Google",
      );
    } else {
      // Create new user with Google data
      const uuid = uuidv7();

      await dbSession.run(
        `CREATE (u:User {
          uuid: $uuid,
          email: $email,
          username: $username,
          name: $name,
          googleId: $googleId,
          googleEmail: $googleEmail,
          googleProfilePicture: $googleProfilePicture,
          authProvider: 'google',
          emailConfirmed: true,
          createdAt: datetime()
        })
        RETURN u`,
        {
          email: googleUser.email.toLowerCase(),
          googleEmail: googleUser.email,
          googleId: googleUser.id,
          googleProfilePicture: googleUser.picture || "",
          name: googleUser.name || "",
          username:
            googleUser.email.split("@")[0] + "_" + uuidv7().slice(0, 8),
          uuid,
        },
      );

      const newUserResult = await dbSession.run(
        "MATCH (u:User) WHERE u.uuid = $uuid RETURN u",
        { uuid },
      );
      user = convertNodeToJson(newUserResult.records[0].get("u"));

      await createActivityLog(
        dbSession,
        "google-signup",
        "User",
        user.P.uuid,
        user.P.email,
        "User signed up with Google",
      );
    }

    // Create session
    await updateSession(user);

    // Get redirect URL from settings
    const generalSettings = await getGeneralSettings(dbSession);
    const configuredRedirectUrl = generalSettings?.P?.redirectUrlAfterSignin;

    const redirectUrl = updateRedirectUrl(
      user,
      subDomain!,
      configuredRedirectUrl,
    );

    // Redirect to the application
    return new Response(null, {
      headers: {
        Location: redirectUrl || "/",
      },
      status: 302,
    });
  } catch (error) {
    console.error("Google OAuth callback error:", error);
    // Redirect to signin page with error
    return new Response(null, {
      headers: {
        Location: `/auth/signin?error=${encodeURIComponent(
          error instanceof Error ? error.message : "Google sign-in failed",
        )}`,
      },
      status: 302,
    });
  } finally {
    await dbSession.close();
  }
}
