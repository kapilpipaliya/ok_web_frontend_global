import { getDBSessionForSubdomain } from "~/cypher/get/getSessionForSubdomain";

import { getUserEmailFromSession } from "./getUserEmailFromSession";

export async function checkAdminRole(request: Request): Promise<boolean> {
  const { dbSession } = await getDBSessionForSubdomain(request);
  const email = await getUserEmailFromSession();

  try {
    if (!email) return false;

    const result = await dbSession.run(
      `MATCH (u:User {email: $email})-[:UserHasRole]->(r:Role)
       WHERE r.key = 'Admin'
       RETURN count(r) > 0 as isAdmin`,
      { email }
    );

    return result.records[0]?.get('isAdmin') || false;

  } finally {
    await dbSession.close();
  }
} 