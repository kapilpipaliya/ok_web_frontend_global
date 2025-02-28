import type { Session } from "neo4j-driver";

import { v7 as uuidv7 } from "uuid";

import type { Vertex } from "~/lib/graph/graph";

import { SYSTEM_DB_NAME } from "~/cypher/boltConstant";
import { convertNodeToJson } from "~/cypher/convertNodeToJson";
import { getDriver } from "~/cypher/driver";
import { createDatabase } from "~/cypher/mutate/signup/createDatabase";
import { hashPassword } from "~/lib/auth/password";
import { saveAllEmailTemplates } from "~/cypher/mutate/email/saveEmailTemplates";

import { createRootFolder } from "../signup/createRootFolder";
import { insertComponents } from "../signup/insertComponents";

export const superUserData = {
  email: "superuser@easyformforge.com",
  password: "kK11235813@",
  subDomain: SYSTEM_DB_NAME,
  username: "superuser",
};

export async function setupSuperUser(): Promise<{
  error?: string;
  status: number;
  user?: null | Vertex;
}> {
  const driver = await getDriver();
  const systemDbSession = driver.session();
  try {
    const result = await systemDbSession.run("SHOW DATABASES");
    const superDatabase = result.records.find(
      (record) => record.get("name") === SYSTEM_DB_NAME,
    );
    if (superDatabase) {
      return { error: "Super user already exists", status: 400, user: null };
    }
    await createDatabase(SYSTEM_DB_NAME);

    const driver = await getDriver();
    const dbSession = driver.session({ database: SYSTEM_DB_NAME });
    try {
      // Check if a user with the same username already exists
      const checkUserQuery = `
        MATCH (u:User { username: $username })
        RETURN u
      `;
      const checkUserResult = await dbSession.run(checkUserQuery, {
        username: superUserData.username,
      });

      if (checkUserResult.records.length > 0) {
        return {
          error: "User with the same username already exists.",
          status: 400,
          user: null,
        };
      }

      // Hash password before saving
      const { hashedPassword, salt } = await hashPassword(
        superUserData.password,
      );

      const createUserQuery = `
        CREATE (u:User {
          email: $email,
          password: $hashedPassword,
          salt: $salt,
          username: $username,
          uuid: randomUUID(),
          emailConfirmed: true
        })
        RETURN u
      `;

      const createUserResult = await dbSession.run(createUserQuery, {
        email: superUserData.email,
        hashedPassword,
        salt,
        username: superUserData.username,
      });

      if (createUserResult.records.length === 0) {
        return {
          error: `Failed to create ${SYSTEM_DB_NAME} user.`,
          status: 500,
          user: null,
        };
      }

      const user = convertNodeToJson(createUserResult.records[0].get("u"));

      // Create Account and link with User
      const accountId = await createSuperAccount(dbSession, user.P.uuid);

      // Create SubDomain and link with Account
      await createSystemSubdomain(dbSession, accountId);

      await createRootFolder(dbSession, user.P.uuid);

      const response = await insertComponents(dbSession);
      if (!response.success) {
        return {
          error: "Failed to insert component tree",
          status: 500,
          user: null,
        };
      }

      try {
        await saveAllEmailTemplates(dbSession);
      } catch (error) {
        console.error("Failed to save email templates:", error);
        // Continue even if email template creation fails
      }

      return { status: 200, user };
    } catch (error) {
      console.error(`Error creating ${SYSTEM_DB_NAME} user:`, error);
      return {
        error: `Failed to create ${SYSTEM_DB_NAME} user`,
        status: 500,
        user: null,
      };
    } finally {
      await dbSession.close();
    }
  } catch (error) {
    console.error(`Error setting up ${SYSTEM_DB_NAME} user:`, error);
    return {
      error: `Failed to setup ${SYSTEM_DB_NAME} user: ${(error as Error).message}`,
      status: 500,
      user: null,
    };
  } finally {
    await systemDbSession.close();
  }
}

async function createSuperAccount(dbSession: Session, userUuid: string) {
  const accountId = uuidv7();
  const query = `
    CREATE (a:Account {
      id: $accountId,
      name: $username,
      createdAt: datetime(),
      lastModified: datetime()
    })
    WITH a
    MATCH (u:User {uuid: $userUuid})
    CREATE (a)-[:AccountUser]->(u)
    RETURN a
  `;

  await dbSession.run(query, {
    accountId,
    username: superUserData.username,
    userUuid,
  });
  return accountId;
}

async function createSystemSubdomain(dbSession: Session, accountId: string) {
  const query = `
    CREATE (s:SubDomain {
      key: $systemDbName,
      createdAt: datetime(),
      lastModified: datetime()
    })
    WITH s
    MATCH (a:Account {id: $accountId})
    CREATE (a)-[:AccountSubdomain]->(s)
    RETURN s
  `;

  return await dbSession.run(query, {
    accountId,
    systemDbName: SYSTEM_DB_NAME,
  });
}
