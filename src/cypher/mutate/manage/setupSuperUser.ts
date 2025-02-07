import {getDriver} from "~/cypher/driver";
import {createDatabase} from "~/cypher/mutate/signup/createDatabase";

import { superUserData } from "../../../../tests/auth/data/signUpData";
import { createRootFolder } from "../signup/createRootFolder";
import { insertComponents } from "../signup/insertComponents";
import { createSuperUser } from "../user/createSuperUser";

export async function setupSuperUser(): Promise<{ error?: string; status: number; user?: any; }> {
  const driver = await getDriver();
  const dbSession = driver.session();
  try {
    const result = await dbSession.run("SHOW DATABASES");
    const superDatabase = result.records.find(record => record.get("name") === "super");
    if (superDatabase) {
      return { error: "Super user already exists", status: 400, user: null };
    } else {
      await createDatabase("super");

      const driver = await getDriver();
      const dbSession = driver.session({database: "super"});
      try {
        const user = await createSuperUser(
          superUserData.email,
          superUserData.username,
          superUserData.password,
          dbSession,
        );
    
        if ("error" in user) {
          return { error: user.error, status: 400 };
        }
      
        await createRootFolder(dbSession, user.P.uuid);

        const response = await insertComponents(dbSession);
        if (!response.success) {
          return { error: "Failed to insert component tree", status: 500 };
        }
    
        return { status: 200, user };
      } catch (error) {
        console.error("Error creating super user:", error);
        return { error: "Failed to create super user", status: 500 };
      } finally {
        await dbSession.close();
      }
    }
  } catch (error) {
    console.error("Error setting up super user:", error);
    return { error: "Failed to setup super user", status: 500 };
  } finally {
    await dbSession.close();
  }
}
