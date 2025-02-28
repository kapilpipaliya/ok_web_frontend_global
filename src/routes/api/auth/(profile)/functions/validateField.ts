import type { Session } from "neo4j-driver";

import type { Vertex } from "~/lib/graph/graph";

import { convertNodeToJson } from "~/cypher/conversion/convertNodeToJson";

export async function validateUniqueFields(
  session: Session,
  uuid: string,
  oldUser: Vertex,
  email?: string,
  username?: string,
) {
  if (email && email !== oldUser.P.email) {
    const emailExists = await validateField(session, "email", email, uuid);
    if (emailExists) {
      throw new Error("Email address already exists");
    }
  }

  if (username && username !== oldUser.P.username) {
    const usernameExists = await validateField(
      session,
      "username",
      username,
      uuid,
    );
    if (usernameExists) {
      throw new Error("Username already exists");
    }
  }
}

export async function validateUser(dbSession: Session, uuid: string) {
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

async function validateField(
  session: Session,
  field: string,
  value: string,
  uuid: string,
) {
  const exists = await session.run(
    `MATCH (u:User {${field}: $value}) WHERE u.uuid <> $uuid RETURN u;`,
    { uuid, value },
  );
  return exists.records.length > 0;
}
