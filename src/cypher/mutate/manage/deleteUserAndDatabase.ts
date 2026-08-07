import { getRequestEvent } from "solid-js/web";

import { getDriver } from "~/cypher/core/driver";
import { getSubDomain } from "~/cypher/session/getSubDomain";

// unused function, To be used in the future
// WIP
export async function deleteUserAndDatabase(_userName: string) {
  "use server";
  const event = getRequestEvent();
  const host = event?.request ? new URL(event.request.url).hostname : undefined;
  if (!host) {
    throw new Error("Request URL is missing");
  }
  const subDomain = await getSubDomain(host);

  const dbSessionSource = (await getDriver()).session({ database: subDomain });
  try {
    // Delete the Neo4j database named subDomain
    await dbSessionSource.run(`DROP DATABASE ${subDomain}`);

    // TODO: delete user from system user database too
    // TODO: delete user directory from server
    return {
      error: false,
      message: "User and database deleted successfully",
    };
  } catch (error) {
    console.error("Error deleting user and database:", error);
    return {
      error: "Error deleting user and database",
    };
  } finally {
    await dbSessionSource.close();
  }
}
