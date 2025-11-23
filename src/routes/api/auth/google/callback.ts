import type { APIEvent } from "@solidjs/start/server";
import { google } from "googleapis";
import { v7 as uuidv7 } from "uuid";

import { convertNodeToJson } from "~/cypher/conversion/convertNodeToJson";
import { createActivityLog } from "~/cypher/mutate/activity/createActivityLog";
import { getDBSessionForSubdomain } from "~/cypher/session/getSessionForSubdomain";
import { APIError } from "~/lib/api/server/apiErrorHandler";
import { createRedirectResponse } from "~/lib/api/server/capacitorRedirect";
import { decryptClientSecret } from "~/lib/auth/tokenEncryption";
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
      "MATCH (o:Setting {type: 'oauth'}) WHERE o.googleEnabled = true RETURN o LIMIT 1",
    );

    if (settingsResult.records.length === 0) {
      throw new APIError("Google OAuth is not configured or enabled", 400);
    }

    const oauthSetting = settingsResult.records[0].get("o").properties;

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
    const origin = `https://${url.hostname}`;
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

    // Use write transaction for atomicity - prevents race conditions
    const user = await dbSession.executeWrite(async (tx) => {
      // Check if user exists with this email
      const userResult = await tx.run(
        "MATCH (u:User) WHERE u.email = $email RETURN u",
        { email: googleUser.email!.toLowerCase() },
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
        await tx.run(
          `MATCH (u:User {uuid: $uuid})
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
        const updatedUserResult = await tx.run(
          "MATCH (u:User {uuid: $uuid}) RETURN u",
          { uuid: user.P.uuid },
        );
        user = convertNodeToJson(updatedUserResult.records[0].get("u"));

        await createActivityLog(
          tx,
          "google-signin",
          "User",
          user.P.uuid,
          user.P.email,
          "User logged in with Google",
        );
      } else {
        // Create new user with Google data
        const uuid = uuidv7();
        const baseUsername = googleUser.email!.split("@")[0];

        // Check if username is already taken
        const usernameCheckResult = await tx.run(
          "MATCH (u:User) WHERE u.username = $username RETURN u",
          { username: baseUsername },
        );

        const username =
          usernameCheckResult.records.length > 0
            ? `${baseUsername}_${uuidv7().slice(0, 8)}`
            : baseUsername;

        await tx.run(
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
            email: googleUser.email!.toLowerCase(),
            googleEmail: googleUser.email,
            googleId: googleUser.id,
            googleProfilePicture: googleUser.picture || "",
            name: googleUser.name || "",
            username,
            uuid,
          },
        );

        const newUserResult = await tx.run(
          "MATCH (u:User {uuid: $uuid}) RETURN u",
          { uuid },
        );
        user = convertNodeToJson(newUserResult.records[0].get("u"));

        await createActivityLog(
          tx,
          "google-signup",
          "User",
          user.P.uuid,
          user.P.email,
          "User signed up with Google",
        );
      }

      return user;
    });

    // Create session
    await updateSession(user);

    // Fetch the configured redirect URL from general settings
    const generalSettings = await getGeneralSettings(dbSession);
    const configuredRedirectUrl = generalSettings?.P?.redirectUrlAfterSignin;

    updateRedirectUrl(user, subDomain!, configuredRedirectUrl);

    // Redirect to the application
    const redirectUrl = user.P.redirectUrl || "/";
    return createRedirectResponse(request, redirectUrl);
  } catch (error) {
    console.error("Google OAuth callback error:", error);
    const errorUrl = `/auth/signin?error=${encodeURIComponent(
      error instanceof Error ? error.message : "Google sign-in failed",
    )}`;
    return createRedirectResponse(request, errorUrl);
  } finally {
    await dbSession.close();
  }
}
