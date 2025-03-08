import { getDBSessionForSubdomain } from "~/cypher/session/getSessionForSubdomain";

export async function validateSuperUser(request: Request): Promise<boolean> {
  return true;
  const { dbSession } = await getDBSessionForSubdomain(request);

  try {
    // Get the user from the session token
    const result = await dbSession.run(
      `
      MATCH (u:User)
      WHERE u.uuid = $uuid AND u.isSystemUser = true
      RETURN u
    `,
      {
        uuid: request.headers.get("user-uuid"), // Assuming user-id is passed in headers
      },
    );

    return result.records.length > 0;
  } finally {
    await dbSession.close();
  }
}
