import type { Session } from "neo4j-driver";

import type { Vertex } from "~/lib/graph/graph";

import { SYSTEM_DB_NAME } from "~/cypher/boltConstant";
import { convertNodeToJson } from "~/cypher/convertNodeToJson";
import { getDriver } from "~/cypher/driver";
import { ServerResult } from "~/cypher/types/ServerResult";
import { updateSession } from "~/server/auth/session/updateSession";

type ProfilePayload = {
  email?: string;
  username?: string;
  uuid: string;
};

export async function updateProfile(
  currentUser: Vertex,
  payload: ProfilePayload,
  dbSession: Session,
  subDomain: string,
): Promise<ServerResult | { error: string; status: number }> {
  const { email, username } = payload;

  const userValidation = await validateUser(dbSession, currentUser.P.uuid);
  if ("error" in userValidation) {
    return userValidation;
  }
  const oldUser = userValidation.user;

  const basicQuery = await buildUpdateQuery(email, username);

  if (subDomain === SYSTEM_DB_NAME) {
    // Get subdomains through Account relationship
    const subdomains = await getSubdomainsForAccount(
      dbSession,
      currentUser.P.uuid,
    );

    const driver = await getDriver();
    const validationSessions = subdomains.map((subdomain) =>
      driver.session({ database: subdomain }),
    );

    try {
      // Validate in super DB
      if (email && email !== oldUser.properties.email) {
        const emailExists = await validateField(
          dbSession,
          "email",
          email,
          currentUser.P.uuid,
        );
        if (emailExists) {
          throw new Error("Email address already exists in super database");
        }
      }

      if (username && username !== oldUser.properties.username) {
        const usernameExists = await validateField(
          dbSession,
          "username",
          username,
          currentUser.P.uuid,
        );
        if (usernameExists) {
          throw new Error("Username already exists in super database");
        }
      }

      // Validate in all subdomains
      for (const session of validationSessions) {
        if (email && email !== oldUser.properties.email) {
          const emailExists = await validateField(
            session,
            "email",
            email,
            currentUser.P.uuid,
          );
          if (emailExists) {
            throw new Error("Email address already exists in subdomain");
          }
        }

        if (username && username !== oldUser.properties.username) {
          const usernameExists = await validateField(
            session,
            "username",
            username,
            currentUser.P.uuid,
          );
          if (usernameExists) {
            throw new Error("Username already exists in subdomain");
          }
        }
      }

      // Perform updates
      const updatePromises = [
        dbSession.run(basicQuery, {
          email,
          username,
          uuid: currentUser.P.uuid,
        }),
        ...validationSessions.map((session) =>
          session.run(basicQuery, {
            email,
            username,
            uuid: currentUser.P.uuid,
          }),
        ),
      ];

      const results = await Promise.all(updatePromises);
      const mainResult = results[0];

      if (mainResult.records.length === 0) {
        throw new Error("Failed to update profile");
      }

      const userNew = convertNodeToJson(mainResult.records[0].get("u"));

      if (email) {
        await updateSession(userNew);
      }

      return {
        graph: {
          edges: {},
          vertexes: { [userNew.id]: userNew },
        },
        result: userNew,
      };
    } catch (err) {
      return {
        error: err instanceof Error ? err.message : "Failed to update profile",
        status: 500,
      };
    } finally {
      await Promise.all(validationSessions.map((session) => session.close()));
    }
  } else {
    // Single subdomain update
    if (email && email !== oldUser.properties.email) {
      const emailExists = await validateField(
        dbSession,
        "email",
        email,
        currentUser.P.uuid,
      );
      if (emailExists) {
        return { error: "Email address already exists", status: 500 };
      }
    }

    if (username && username !== oldUser.properties.username) {
      const usernameExists = await validateField(
        dbSession,
        "username",
        username,
        currentUser.P.uuid,
      );
      if (usernameExists) {
        return { error: "Username already exists", status: 500 };
      }
    }

    const basicResult = await dbSession.run(basicQuery, {
      email,
      username,
      uuid: currentUser.P.uuid,
    });

    if (basicResult.records.length === 0) {
      return { error: "Failed to update profile", status: 500 };
    }

    const userNew = convertNodeToJson(basicResult.records[0].get("u"));

    if (email) {
      await updateSession(userNew);
    }

    return {
      graph: {
        edges: {},
        vertexes: { [userNew.id]: userNew },
      },
      result: userNew,
    };
  }
}

async function buildUpdateQuery(email?: string, username?: string) {
  let basicQuery = "MATCH (u:User) WHERE u.uuid = $uuid ";
  const updates = [];
  if (email) {
    updates.push("u.email = $email");
  }
  if (username) {
    updates.push("u.username = $username");
  }

  if (updates.length > 0) {
    basicQuery += `SET ${updates.join(", ")}, u.updatedAt = localDateTime() RETURN u`;
  } else {
    basicQuery += "RETURN u";
  }
  return basicQuery;
}

async function getSubdomainsForAccount(dbSession: Session, uuid: string) {
  const subDomainsResult = await dbSession.run(
    `MATCH (u:User {uuid: $uuid})<-[:AccountUser]-(a:Account)-[:AccountSubdomain]->(s:SubDomain)
     RETURN s.key as subdomain`,
    { uuid },
  );

  return subDomainsResult.records.map((record) => record.get("subdomain"));
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

async function validateUser(dbSession: Session, uuid: string) {
  const userExists = await dbSession.run(
    "MATCH (u:User) WHERE u.uuid = $uuid RETURN u;",
    { uuid },
  );
  if (userExists.records.length === 0) {
    return { error: "User not exists", status: 404 };
  }

  const user = userExists.records[0].get("u");
  if (user.properties.isSuper) {
    return {
      error: "Super Admin cannot update profile in subdomain",
      status: 404,
    };
  }

  return { user };
}
