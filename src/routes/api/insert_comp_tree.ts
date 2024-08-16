
import type { APIEvent } from "@solidjs/start/dist/server";
import type { Session } from "neo4j-driver";

import { getSessionForSubdomain } from "~/cypher/get/getSessionForSubdomain";
import { getComponentTree } from "~/cypher/mutate/sync/component_tree/convertToJson";
import { insertComponentTree } from "~/cypher/mutate/sync/component_tree/insertComonentTree";

export async function GET({ request }: APIEvent) {
  let neo4jSession: Session | undefined;
  try {
    neo4jSession = await getSessionForSubdomain(request);

    const componentTree = getComponentTree();
    const response = await insertComponentTree(neo4jSession, componentTree);

    if (!response.success) {
      return new Response(
        JSON.stringify({
          error: "Failed to insert component tree",
        }),
        { status: 500 },
      );
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error: unknown) {
    return new Response(
      error instanceof Error ? error.message : "Unknown error",
      { status: 500 },
    );
  } finally {
    if (neo4jSession) {
      neo4jSession.close();
    }
  }
}
