import type { APIEvent } from "@solidjs/start/server";

import { getDBSessionForSubdomain } from "~/cypher/get/getSessionForSubdomain";
import { APIError, handleAPIError } from "~/lib/api/apiErrorHandler";
import { getUserFromSession } from "~/server/auth/session/getUserFromSession";

export async function POST({ request }: APIEvent) {
  const { dbSession } = await getDBSessionForSubdomain(request);

  try {
    const currentUser = await getUserFromSession(request);
    if (!currentUser) {
      throw new APIError("Unauthorized", 401);
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

    // Update user and roles
    const _result = await dbSession.run(
      `
      MATCH (u:User {uuid: $uuid})
      SET u.email = $email,
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

    // If email was changed, send confirmation emails
    if (email !== oldEmail) {
      // TODO: Send confirmation email to old address
      await sendEmailChangeNotification(oldEmail, email);

      // TODO: Send confirmation email to new address
      await sendEmailConfirmation(email);
    }

    return { success: true };
  } catch (error) {
    return handleAPIError(error);
  } finally {
    await dbSession.close();
  }
}

// Helper functions for sending emails
async function sendEmailChangeNotification(
  _oldEmail: string,
  _newEmail: string,
) {}

async function sendEmailConfirmation(_email: string) {}
// Remember to:
// 1. Implement the email sending functions
// 2. Add proper email templates for both notification types
// 3. Consider adding email verification for the new email address before making it active
// 4. Add rate limiting to prevent abuse
