import neo4j, { Session } from "neo4j-driver";
import {stopDockerContainer} from "../src/server/docker/stopDockerContainer";
import {removeDockerContainer} from "../src/server/docker/removeDockerContainer";

// Main function to initiate the migration process.
export async function deleteUser(args: any) {
  "use server";

  // Creating Neo4j driver instances for admin and user sessions.
  const admin = neo4j.driver("bolt://localhost:1102", undefined, {
    disableLosslessIntegers: true,
  });

  console.log("Starting migration process...");
  const sessionSource = admin.session();

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
