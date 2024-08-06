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
  const admin = neo4j.driver("bolt://localhost:1102", undefined, {
    disableLosslessIntegers: true,
  });
  const user = neo4j.driver(`bolt://localhost:${userport}`, undefined, {
    disableLosslessIntegers: true,
  });
  const sessionSource = admin.session();
  const sessionTarget = user.session();

  try {
    await transferNodeTypes(sessionSource, sessionTarget, nodesToTransfer);
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
    await sessionSource.close();
    await sessionTarget.close();
  }
}
