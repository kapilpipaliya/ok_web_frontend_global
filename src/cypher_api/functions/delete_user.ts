import neo4j, { Session } from "neo4j-driver";
import {
  removeDockerContainer,
  stopDockerContainer,
} from "../server/docker_functions";
import { getRequestURL } from "vinxi/http";
import admin from "~/routes/admin";
import { getSubDomain } from "../server/domain_utils";
import { getDriver } from "../server/driver";

// Main function to initiate the migration process.
export async function deleteUser(args: any) {
  "use server";
  const host = getRequestURL().hostname;
  const subDomain = await getSubDomain(host);

  console.log("Starting migration process...");
  const sessionSource = (await getDriver(subDomain)).session();

  try {
    const stopDockerRes = await stopDockerContainer(`user`);
    if (!stopDockerRes.error) {
      const removeDockerRes = await removeDockerContainer(`user`);
      if (!removeDockerRes.error) {
        return {
          error: false,
          message: "Docker Removed successfully",
        };
      }
    }

    return {
      error: false,
      message: "Migration completed successfully",
    };
  } catch (error) {
    console.error("Error migrating nodes:", error);
    return {
      error: true,
      message: "Error migrating nodes",
    };
  } finally {
    console.log("Closing database sessions...");
    await sessionSource.close();
    console.log("Database sessions closed.");
  }
}

deleteUser({ nodesToTransfer: "kano" });
