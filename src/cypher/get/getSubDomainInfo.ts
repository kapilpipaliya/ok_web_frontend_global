import type { Session } from "neo4j-driver";

import { convertNodeToJson } from "~/cypher/convertNodeToJson";

export async function getSubDomainInfo(subDomain: string, session: Session) {
  try {
    const query = "MATCH (u:User {subDomain: $subDomain}) RETURN u;";
    const result = await session.run(query, { subDomain });

    if (result.records.length === 0) {
      return { error: "Subdomain is not valid" };
    }

    const user = convertNodeToJson(result.records[0].get("u"));
    delete user.P.properties;
    return user;
  } catch (error) {
    console.error("Failed to execute query:", error);
    throw error;
  } finally {
    await session.close();
  }
}
