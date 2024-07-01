// <-
import {int, } from "neo4j-driver";

import type {Vertex} from "~/lib/graph/graph";

import {getSessionForSubdomain} from "~/cypher/get/getSessionForSubdomain";

import type { ContextType } from "./ContextType";

import { processResult } from "./processResult";

export async function evalGetParents(
  vertexes: Vertex[],
  edgeType: string,
  context: ContextType = {},
) {
  "use server";
  if (!vertexes || vertexes.length === 0) return;
  const session = context.tx ? null : (context.session || await getSessionForSubdomain());
  const type = edgeType.replaceAll("$0", vertexes[0].L[0]);
  let query;
  let params;
  if (type.includes("|")) {
    // Cypher query to get parents
    query = `
  MATCH (parent)-[r]->(child)
  WHERE id(child) IN $childIds AND type(r) IN $types
  RETURN r, parent
`;
    params = {
      childIds: vertexes.map((v) => int(v.id)),
      types: type.split("|"),
    };
  } else {
    query = `
  MATCH (parent)-[r:${type}]->(child)
  WHERE id(child) IN $childIds
  RETURN r, parent
`;
    params = {childIds: vertexes.map((v) => int(v.id))};
  }

  try {
    const result = await (context.tx ? context.tx!.run(query, params) : session!.run(query, params));
    return processResult(result.records, context, "parent", "r", true);
  } catch (error) {
    console.error(
      `Error fetching parents for vertex ${vertexes
        .map((v) => v.id)
        .join(", ")}:`,
      error,
    );
    throw error;
  } finally {
    if (!context.session && session) {
      await session.close();
    }
  }
}