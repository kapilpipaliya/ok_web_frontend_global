import type { APIEvent } from "@solidjs/start/server";

import { getQuery } from "vinxi/http";

import { convertNodeToJson } from "~/cypher/conversion/convertNodeToJson";
import { ADMIN_DB_NAME } from "~/cypher/core/boltConstant";
import { getDriver } from "~/cypher/core/driver";
import { createActivityLog } from "~/cypher/mutate/activity/createActivityLog";
import { getDBSessionForSubdomain } from "~/cypher/session/getSessionForSubdomain";
import { getSubdomainsForAccount } from "~/cypher/session/getSubdomainsForAccount";
import { APIError, handleAPIError } from "~/lib/api/server/apiErrorHandler";
import { validateAndConsumeToken } from "~/lib/auth/secureToken";
import { decodeUserData } from "~/lib/auth/userDataEncoder";
import { sendNotificationEmail } from "~/lib/playwright/sendNotificationEmail";
import { EMAIL_TEMPLATES } from "~/pages/settings/constants";
import { updateSession } from "~/server/auth/session/updateSession";

export async function GET({ request }: APIEvent) {
  const { dbSession, subDomain } = await getDBSessionForSubdomain(request);

  try {
    const query = getQuery();
    const token = query.token as string;

    if (!token) {
      throw new APIError("Invalid or missing token", 400);
    }

    // Validate and consume the token
    const userData = await validateAndConsumeToken(token, dbSession);
    if (!userData) {
      return new Response(null, {
        headers: { Location: "/auth/signin?error=invalid_token" },
        status: 302,
      });
    }

    const { email, newEmail, uuid } = decodeUserData(userData);

    if (!(uuid && email && newEmail)) {
      return new Response(null, {
        headers: { Location: "/auth/signin?error=invalid_data" },
        status: 302,
      });
    }

    // Determine if we need to update across multiple databases
    if (subDomain === ADMIN_DB_NAME) {
      // Get all subdomains this user belongs to
      const subdomains = await getSubdomainsForAccount(dbSession, uuid);

      const driver = await getDriver();
      const updateSessions = subdomains.map((subdomain) =>
        driver.session({ database: subdomain }),
      );

      try {
        // Use write transaction for atomicity in system DB
        const systemResult = await dbSession.executeWrite(async (tx) => {
          // Update in system DB
          const result = await tx.run(
            `MATCH (u:User {uuid: $uuid, email: $email, pendingEmail: $newEmail})
             SET u.email = $newEmail,
                 u.pendingEmail = null,
                 u.updatedAt = datetime()
             RETURN u`,
            { email, newEmail, uuid },
          );

          if (result.records.length === 0) {
            throw new APIError("User not found", 404);
          }

          // Log the email change activity
          await createActivityLog(
            tx,
            "email_change",
            "User",
            uuid,
            newEmail,
            `Email changed from ${email} to ${newEmail}`,
          );

          return result;
        });

        if (systemResult.records.length === 0) {
          return new Response(null, {
            headers: { Location: "/auth/signin?error=user_not_found" },
            status: 302,
          });
        }

        // Update in all subdomains (these are separate databases, can't be in same transaction)
        const updatePromises = updateSessions.map((session) =>
          session.run(
            `MATCH (u:User {uuid: $uuid})
             SET u.email = $newEmail,
                 u.pendingEmail = null,
                 u.updatedAt = datetime()
             RETURN u`,
            { newEmail, uuid },
          ),
        );

        await Promise.all(updatePromises);

        const updatedUser = convertNodeToJson(systemResult.records[0].get("u"));

        // Update session with new email
        await updateSession(updatedUser);

        // Send success email
        sendNotificationEmail(
          EMAIL_TEMPLATES.EmailChangeSuccessful,
          {},
          "Email Change Successful",
          updatedUser,
          subDomain,
        );

        return new Response(null, {
          headers: { Location: "/auth/signin?message=email_confirmed" },
          status: 302,
        });
      } finally {
        await Promise.all(updateSessions.map((session) => session.close()));
      }
    } else {
      // Handle regular subdomain case - use write transaction for atomicity
      const result = await dbSession.executeWrite(async (tx) => {
        const updateResult = await tx.run(
          `MATCH (u:User {uuid: $uuid, email: $email, pendingEmail: $newEmail})
           SET u.email = $newEmail,
               u.pendingEmail = null,
               u.updatedAt = datetime()
           RETURN u`,
          { email, newEmail, uuid },
        );

        if (updateResult.records.length === 0) {
          throw new APIError("User not found", 404);
        }

        // Log the email change activity
        await createActivityLog(
          tx,
          "email_change",
          "User",
          uuid,
          newEmail,
          `Email changed from ${email} to ${newEmail}`,
        );

        return updateResult;
      });

      if (result.records.length === 0) {
        return new Response(null, {
          headers: { Location: "/auth/signin?error=user_not_found" },
          status: 302,
        });
      }

      const updatedUser = convertNodeToJson(result.records[0].get("u"));

      // Update session with new email
      await updateSession(updatedUser);

      // Send success email
      sendNotificationEmail(
        EMAIL_TEMPLATES.EmailChangeSuccessful,
        {},
        "Email Change Successful",
        updatedUser,
        subDomain,
      );

      return new Response(null, {
        headers: { Location: "/auth/signin?message=email_confirmed" },
        status: 302,
      });
    }
  } catch (error) {
    return handleAPIError(error);
  } finally {
    await dbSession.close();
  }
}
