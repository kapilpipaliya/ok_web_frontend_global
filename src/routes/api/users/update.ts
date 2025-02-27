import type { APIEvent } from "@solidjs/start/server";

import { convertNodeToJson } from "~/cypher/convertNodeToJson";
import { getDBSessionForSubdomain } from "~/cypher/get/getSessionForSubdomain";
import { checkRole } from "~/cypher/permissions/checkPermission";
import { SYSTEM_ROLES } from "~/cypher/permissions/types";
import { APIError, handleAPIError } from "~/lib/api/apiErrorHandler";
import { sendEmailConfirmation } from "~/routes/api/auth/(profile)/functions/sendEmailConfirmation";
import { validateUniqueFields, validateUser } from "~/routes/api/auth/(profile)/functions/validateField";
import { getUserFromSession } from "~/server/auth/session/getUserFromSession";

export async function POST({ request }: APIEvent) {
  const { dbSession, subDomain } = await getDBSessionForSubdomain(request);

  try {
    const user = await getUserFromSession(request);

    if (!user) {
      throw new APIError("User not found", 404);
    }

    const isAdmin = await checkRole(request, SYSTEM_ROLES.ADMIN, dbSession, user);

    if (!isAdmin) {
      throw new APIError("Unauthorized. Admin access required.", 403);
    }

    const { email, name, roles, username, uuid } = await request.json();

    const userValidation = await validateUser(dbSession, uuid);
    if ("error" in userValidation) return userValidation;
  
    const oldUser = userValidation.user;

    await validateUniqueFields(dbSession, uuid, oldUser, email, username);

    // Store the pending email if changing
    const setEmail = email !== oldUser.P.email ? 'u.pendingEmail = $email,' : '';

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
    if (email !== oldUser.P.email) {
      await sendEmailConfirmation(request, oldUser, email, updatedUser, subDomain, dbSession);
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
}// Remember to:
// 1. Implement the email sending functions
// 2. Add proper email templates for both notification types
// 3. Consider adding email verification for the new email address before making it active
// 4. Add rate limiting to prevent abuse

// Create an "EmailChanged" template for notification to the old email
// Create an "EmailConfirmation" template for verification sent to new email
// 3. Create an "EmailChangeSuccessful" template for final confirmation after verification
