import { getDBSessionForSubdomain } from "~/cypher/get/getSessionForSubdomain";

import { getUserFromSession } from "./getUserFromSession";

export async function checkAdminRole(request: Request): Promise<boolean> {
  const { dbSession } = await getDBSessionForSubdomain(request);
  const user = await getUserFromSession(request);

  try {
    if (!user?.id) {
      return false;
    }

    const result = await dbSession.run(
      `MATCH (u:User)-[:UserRole]->(r:Role)
       WHERE elementId(u) = $userId AND r.key = 'Admin'
       RETURN count(r) > 0 as isAdmin`,
      { userId: user.id },
    );

    return result.records[0]?.get("isAdmin");
  } finally {
    await dbSession.close();
  }
}
