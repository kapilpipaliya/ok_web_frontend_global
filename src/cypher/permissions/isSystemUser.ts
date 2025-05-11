import type { Session } from "neo4j-driver";

import { convertNodeToJson } from "~/cypher/conversion/convertNodeToJson";
import type { Vertex } from "~/lib/graph/type/vertex";

export async function isSystemUser(
  dbSession: Session,
  uuid: string,
): Promise<{ isSystemUser: boolean; user?: Vertex }> {
  const userExists = await dbSession.run(
    "MATCH (u:User) WHERE u.uuid = $uuid RETURN u;",
    { uuid },
  );
  if (userExists.records.length === 0) {
    return { isSystemUser: false };
  }

  const user = convertNodeToJson(userExists.records[0].get("u"));
  return {
    isSystemUser: user.P.isSystemUser === true,
    user,
  };

  // TODO: also check if same url is in super then also its not allowed.
}
