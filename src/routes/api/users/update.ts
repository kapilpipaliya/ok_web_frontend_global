import type { APIEvent } from "@solidjs/start/server";

import { convertNodeToJson } from "~/cypher/convertNodeToJson";
import { getDBSessionForSubdomain } from "~/cypher/get/getSessionForSubdomain";
import { checkRole } from "~/cypher/permissions/checkPermission";
import { SYSTEM_ROLES } from "~/cypher/permissions/types";
import { APIError, handleAPIError } from "~/lib/api/apiErrorHandler";
import { generateSecureToken } from "~/lib/auth/secureToken";
import { encodeUserData } from "~/lib/auth/userDataEncoder";
import { sendNotificationEmail } from "~/lib/playwright/sendNotificationEmail";
import { EMAIL_TEMPLATES } from "~/pages/settings/constants";
import { getUserFromSession } from "~/server/auth/session/getUserFromSession";

export async function POST({ request }: APIEvent) {
  const { dbSession, subDomain } = await getDBSessionForSubdomain(request);

  try {
    const user = await getUserFromSession(request);

    if (!user) {
      throw new APIError("User not found", 404);
    }

    const isAdmin = await checkRole(
      request,
      SYSTEM_ROLES.ADMIN,
      dbSession,
      user,
    );

    if (!isAdmin) {
      throw new APIError("Unauthorized. Admin access required.", 403);
    }

    const { email, name, roles, username, uuid } = await request.json();

    // Get existing user data to check for email change
    const existingUser = await dbSession.run(
      "MATCH (u:User {uuid: $uuid}) RETURN u",
      { uuid },
    );

    if (existingUser.records.length === 0) {
      throw new APIError("User not found", 404);
    }

    const oldEmail = existingUser.records[0].get("u").properties.email;
    const oldUsername = existingUser.records[0].get("u").properties.username;

    // If email is being changed, check if new email already exists
    if (email !== oldEmail) {
      const existingEmailCheck = await dbSession.run(
        "MATCH (u:User {email: $email}) WHERE u.uuid <> $uuid RETURN u",
        { email, uuid },
      );

      if (existingEmailCheck.records.length > 0) {
        throw new APIError("Email already in use", 400);
      }
    }

    // Check if username is taken (if being changed)
    if (username !== oldUsername) {
      const existingUsernameCheck = await dbSession.run(
        "MATCH (u:User {username: $username}) WHERE u.uuid <> $uuid RETURN u",
        { username, uuid },
      );

      if (existingUsernameCheck.records.length > 0) {
        throw new APIError("Username already taken", 400);
      }
    }

    // Store the pending email if changing
    const setEmail = email !== oldEmail 
      ? 'u.pendingEmail = $email,' 
      : '';

    // Update user and roles
    const result = await dbSession.run(
      `
      MATCH (u:User {uuid: $uuid})
      SET ${setEmail}
          u.username = $username,
          u.name = $name,
          u.updatedAt = datetime()
      WITH u
      // Get existing roles
      OPTIONAL MATCH (u)-[r:UserRole]->(existingRole:Role)
      WITH u, collect(elementId(existingRole)) as existingRoleIds
      // Delete relationships for removed roles
      OPTIONAL MATCH (u)-[r:UserRole]->(roleToDelete:Role)
      WHERE NOT elementId(roleToDelete) IN $roles
      DELETE r
      WITH u, existingRoleIds
      // Create new role relationships only for new roles
      UNWIND $roles as roleId
      MATCH (r:Role)
      WHERE elementId(r) = roleId AND NOT roleId IN existingRoleIds
      CREATE (u)-[:UserRole]->(r)
      RETURN u
      `,
      {
        email,
        name,
        roles,
        username,
        uuid,
      },
    );

    const updatedUser = convertNodeToJson(result.records[0].get("u"));

    // If email was changed, send confirmation emails
    if (email !== oldEmail) {
      // Send notification to old email about the pending change
      sendNotificationEmail(EMAIL_TEMPLATES.EmailChanged, { email: oldEmail }, "Email Change Notification", user, subDomain);

      // Generate confirmation token with original and new email data
      const userData = encodeUserData({
        email: oldEmail,
        newEmail: email,
        uuid: uuid
      });
      
      const confirmToken = await generateSecureToken(userData, dbSession);
      
      // Generate confirmation URL
      const protocol = request.url.startsWith('https') ? 'https' : 'http';
      const host = request.headers.get("host") || "";
      const url = `${protocol}://${host}/api/auth/confirmEmailChange?token=${confirmToken}`;
      
      // Send confirmation to new email for verification
      sendNotificationEmail(EMAIL_TEMPLATES.EmailConfirmation, { email, url }, "Confirm Your New Email Address", user, subDomain);
    }

    return {
      graph: {
        edges: {},
        vertexes: { [updatedUser.id]: updatedUser },
      },
      result: updatedUser,
    };
  } catch (error) {
    return handleAPIError(error);
  } finally {
    await dbSession.close();
  }
}
// Remember to:
// 1. Implement the email sending functions
// 2. Add proper email templates for both notification types
// 3. Consider adding email verification for the new email address before making it active
// 4. Add rate limiting to prevent abuse

// Create an "EmailChanged" template for notification to the old email
// Create an "EmailConfirmation" template for verification sent to new email
// 3. Create an "EmailChangeSuccessful" template for final confirmation after verification