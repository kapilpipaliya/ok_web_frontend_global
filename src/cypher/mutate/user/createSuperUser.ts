import type { Session } from "neo4j-driver";

import { convertNodeToJson } from "~/cypher/convertNodeToJson";

export async function createSuperUser(
  email: string,
  username: string,
  password: string,
  superDbSession: Session,
) {
  try {
    // Check if a user with the same username already exists
    const checkUserQuery = `
      MATCH (u:User { username: $username })
      RETURN u
    `;
    const checkUserResult = await superDbSession.run(checkUserQuery, {
      username,
    });

    if (checkUserResult.records.length > 0) {
      return { error: "User with the same username already exists." };
    }
    const query = `
      CREATE (u:User {
        email: $email,
        password: $password,
        username: $username,
        uuid: randomUUID()
      })
      CREATE (s:SubDomain {
        key: "super",
        driverPort: 1102,
        labPort: 1104,
        logsPort: 1103
      })
      CREATE (u)-[:UserSubDomain]->(s)
      RETURN u, s
    `;
    const result = await superDbSession.run(query, {
      email,
      password,
      username,
    });

    if (result.records.length === 0) {
      return { error: "Failed to create super user." };
    }

    const user = convertNodeToJson(result.records[0].get("u"));
    return user;
  } catch (error) {
    console.error("Error creating super user:", error);
    throw error;
  }
}
