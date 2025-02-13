import type { Session } from "neo4j-driver";

import { SYSTEM_DB_NAME } from "~/cypher/boltConstant";
import { convertNodeToJson } from "~/cypher/convertNodeToJson";
import { hashPassword } from "~/lib/auth/password";

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

    // Hash password before saving
    const { hashedPassword, salt } = await hashPassword(password);

    const query = `
      CREATE (u:User {
        email: $email,
        password: $hashedPassword,
        salt: $salt,
        username: $username,
        uuid: randomUUID()
      })
      CREATE (s:SubDomain {
        key: $systemDbName
      })
      CREATE (u)-[:UserSubDomain]->(s)
      RETURN u, s
    `;
    const result = await superDbSession.run(query, {
      email,
      hashedPassword,
      salt,
      systemDbName: SYSTEM_DB_NAME,
      username,
    });

    if (result.records.length === 0) {
      return { error: `Failed to create ${SYSTEM_DB_NAME} user.` };
    }

    const user = convertNodeToJson(result.records[0].get("u"));
    return user;
  } catch (error) {
    console.error(`Error creating ${SYSTEM_DB_NAME} user:`, error);
    throw error;
  }
}
