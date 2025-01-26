import {getDriver} from "~/cypher/driver";
import {createDatabase} from "~/cypher/mutate/signup/createDatabase";
import { createRootFolder } from "../signup/createRootFolder";
import { createSuperUser } from "../user/createSuperUser";
import { superUserData } from "../../../../tests/auth/data/signUpData";
import { insertComponents } from "../signup/insertComponents";

export async function setupSuperUser(): Promise<{ user?: any; error?: string; status: number }> {
  const driver = await getDriver();
  const dbSession = driver.session();
  try {
    const result = await dbSession.run("SHOW DATABASES");
    const superDatabase = result.records.find(record => record.get("name") === "super");
    if (!superDatabase) {
      await createDatabase("super");

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
    
      return { user, status: 200 };
    } else {
      return { user: null, error: "Super user already exists", status: 400 };
    }
  } catch (error) {
    console.error("Error setting up super user:", error);
    return { error: "Failed to setup super user", status: 500 };
  } finally {
    await dbSession.close();
  }
}
