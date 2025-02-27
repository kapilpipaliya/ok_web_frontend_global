// Helper function to check if a user is a system user
import type {Session} from "neo4j-driver";

import {SYSTEM_DB_NAME} from "~/cypher/core/boltConstant";

export async function checkIsSystemUser(
  session: Session,
  uuid: string,
  subDomain: string,
) {
  return subDomain === SYSTEM_DB_NAME;
  const result = await session.run(
    `MATCH (u:User {uuid: $uuid}) 
     RETURN EXISTS(u.isSuper) as isSystemUser`,
    {uuid},
  );

  return result.records.length > 0 && result.records[0].get("isSystemUser");
}