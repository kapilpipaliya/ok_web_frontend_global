import type { Vertex } from "~/lib/graph/graph";

import { SYSTEM_DB_NAME } from "~/cypher/core/boltConstant";
import { getDriver } from "~/cypher/core/driver";
import { createDatabase } from "~/cypher/mutate/signup/database/createDatabase";
import { createDatabaseConstraints } from "~/cypher/mutate/signup/seed/createDatabaseConstraints";

import { signupAdmin } from "../signup/signupAdmin";
import { getAllDatabases } from "./getAllDatabases";

export const superUserData = {
  email: `admin@${process.env.DOMAIN || "decodeui.io"}`,
  password: process.env.SUPER_USER_PASSWORD || "",
  subDomain: SYSTEM_DB_NAME,
  username: "admin",
};

export async function setupSuperUser(): Promise<{
  error?: string;
  status: number;
  user?: null | Vertex;
}> {
  const driver = await getDriver();
  const systemDbSession = driver.session();
  try {
    const databases = await getAllDatabases();
    const superDatabaseExists = databases.includes(SYSTEM_DB_NAME);

    if (superDatabaseExists) {
      return { error: "Super user already exists", status: 400, user: null };
    }
    await createDatabase(SYSTEM_DB_NAME);

    const driver = await getDriver();
    const dbSession = driver.session({ database: SYSTEM_DB_NAME });
    await createDatabaseConstraints(dbSession);
    const tx = dbSession.beginTransaction();
    try {
      // Check if a user with the same username already exists
      const checkUserQuery = `
        MATCH (u:User { username: $username })
        RETURN u
      `;
      const checkUserResult = await tx.run(checkUserQuery, {
        username: superUserData.username,
      });

      if (checkUserResult.records.length > 0) {
        return {
          error: "User with the same username already exists.",
          status: 400,
          user: null,
        };
      }

      const result = await signupAdmin(tx, superUserData, true);

      await tx.commit();
      return { status: 200, user: result.user };
    } catch (error) {
      await tx.rollback();
      console.error(`Error creating ${SYSTEM_DB_NAME} user:`, error);
      return {
        error: `Failed to create ${SYSTEM_DB_NAME} user`,
        status: 500,
        user: null,
      };
    } finally {
      await tx.close();
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
