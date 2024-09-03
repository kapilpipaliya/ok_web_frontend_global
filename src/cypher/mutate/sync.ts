import neo4j from "neo4j-driver";

import { transferNodeTypes } from "~/cypher/mutate/sync/transferNodeTypes";

// Main function to initiate the migration process.
export async function syncNodesMGCall(args: {
  nodesToTransfer: string[];
  userport: string;
}) {
  "use server";

  const nodesToTransfer = args.nodesToTransfer;
  const userport = args.userport;
  // Creating Neo4j driver instances for admin and user sessions.
  const adminDriver = neo4j.driver("bolt://localhost:1102", undefined, {
    disableLosslessIntegers: true,
  });
  const userDriver = neo4j.driver(`bolt://localhost:${userport}`, undefined, {
    disableLosslessIntegers: true,
  });
  const dbSessionSource = adminDriver.session();
  const dbSessionTarget = userDriver.session();

  try {
    await transferNodeTypes(dbSessionSource, dbSessionTarget, nodesToTransfer);
    return {
      error: false,
      message: "Migration completed successfully.",
    };
  } catch (error) {
    console.error("Error migrating nodes:", error);
    return {
      error: "Error migrating nodes.",
    };
  } finally {
    await dbSessionSource.close();
    await dbSessionTarget.close();
  }
}
