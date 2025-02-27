import { getDBSessionForSubdomain } from "~/cypher/get/getSessionForSubdomain";

export async function validateSuperUser(request: Request): Promise<boolean> {
  return true;
  const { dbSession } = await getDBSessionForSubdomain(request);

  try {
    // Get the user from the session token
    const result = await dbSession.run(
      `
      MATCH (u:User)
      WHERE u.id = $userId AND u.isSuperUser = true
      RETURN u
    `,
      {
        userId: request.headers.get("user-id"), // Assuming user-id is passed in headers
      },
    );

    return result.records.length > 0;
  } finally {
    await dbSession.close();
  }
}
