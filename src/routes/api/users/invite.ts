import type { APIEvent } from "@solidjs/start/server";

import { v7 as uuidv7 } from "uuid";

import { getDBSessionForSubdomain } from "~/cypher/get/getSessionForSubdomain";
import { checkRole } from "~/cypher/permissions/checkPermission";
import { SYSTEM_ROLES } from "~/cypher/permissions/types";
import { APIError, handleAPIError } from "~/lib/api/apiErrorHandler";
import { getUserFromSession } from "~/server/auth/session/getUserFromSession";

export async function POST({ request }: APIEvent) {
  const { dbSession } = await getDBSessionForSubdomain(request);

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

    const { email, name, roles, username } = await request.json();

    // Check if user already exists with email
    const existingUserEmail = await dbSession.run(
      "MATCH (u:User {email: $email}) RETURN u",
      { email },
    );

    if (existingUserEmail.records.length > 0) {
      throw new APIError("User with this email already exists", 400);
    }

    // Check if username already exists
    const existingUsername = await dbSession.run(
      "MATCH (u:User {username: $username}) RETURN u",
      { username },
    );

    if (existingUsername.records.length > 0) {
      throw new APIError("Username already taken", 400);
    }

    // Create new user
    const _result = await dbSession.run(
      `
      CREATE (u:User {
        uuid: $uuid,
        email: $email,
        username: $username,
        name: $name,
        status: "invited",
        createdAt: datetime()
      })
      WITH u
      UNWIND $roles as roleId
      MATCH (r:Role)
      WHERE elementId(r) = roleId
      CREATE (u)-[:UserRole]->(r)
      RETURN u
    `,
      {
        email,
        name,
        roles,
        username,
        uuid: uuidv7(),
      },
    );

    // TODO: Send invitation email

    return {
      graph: {
        edges: {},
        vertexes: { [user.id]: user },
      },
      result: user,
    };
  } catch (error) {
    return handleAPIError(error);
  } finally {
    await dbSession.close();
  }
}
