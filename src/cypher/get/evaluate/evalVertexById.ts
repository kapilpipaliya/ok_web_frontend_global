import type {Edge, Vertex} from "~/lib/graph/graph";
import type {Session} from "neo4j-driver";
import {getSessionForSubdomain} from "~/cypher/get/getSessionForSubdomain";
import {findVertexMGCallId} from "~/cypher/get/findVertexMGCallId";
import { ContextType } from "./ContextType";

export async function evalVertexById(
  id: string,
  context: ContextType = {},
) {
  "use server";
  const session = context.session || await getSessionForSubdomain();
  try {
    return await findVertexMGCallId(session, {id}, context);
  } catch (error: any) {
    throw new Error(error.message);
  } finally {
    if (!context.session) {
      await session.close();
    }
  }
}