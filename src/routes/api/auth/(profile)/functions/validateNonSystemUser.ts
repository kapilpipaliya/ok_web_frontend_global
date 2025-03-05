import type { Session } from "neo4j-driver";

import { convertNodeToJson } from "~/cypher/conversion/convertNodeToJson";

export async function validateNonSystemUser(dbSession: Session, uuid: string) {
  const userExists = await dbSession.run(
    "MATCH (u:User) WHERE u.uuid = $uuid RETURN u;",
    { uuid },
  );
  if (userExists.records.length === 0) {
    return { error: "User not exists", status: 404 };
  }

  const user = convertNodeToJson(userExists.records[0].get("u"));
  if (user.P.isSystemUser) {
    return {
      error: "Super Admin cannot update profile in subdomain",
      status: 404,
    };
  }

  // TODO: also check if same url is in super then also its not allowed.

  return { user };
}
