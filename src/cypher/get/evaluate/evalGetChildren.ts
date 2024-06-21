// ->
import type {Edge, Vertex} from "~/lib/graph/graph";
import {int, type Session} from "neo4j-driver";
import {getSessionForSubdomain} from "~/cypher/get/getSessionForSubdomain";
import { ContextType } from "./ContextType";
import { processResult } from "./processResult";

export async function evalGetChildren(
  vertexes: Vertex[],
  edgeType: string,
  context: ContextType = {},
) {
  "use server";
  if (!vertexes || vertexes.length === 0) return;

  const session = context.session || await getSessionForSubdomain();
  let type;
  if (edgeType.includes("$0")) {
    type = edgeType.replaceAll("$0", vertexes[0].L[0]);
  } else {
    type = edgeType;
  }
  
  let query;
  let params;
  if (type.includes("|")) {
    query = `
  MATCH (parent)-[r]->(child)
  WHERE id(parent) IN $parentIds AND type(r) IN $types
  RETURN r, child
`;
    params = {
      parentIds: vertexes.map((v) => int(v.id)),
      types: type.split("|"),
    };
  } else {
    query = `
  MATCH (parent)-[r:${type}]->(child)
  WHERE id(parent) IN $parentIds
  RETURN r, child
`;
    params = {parentIds: vertexes.map((v) => int(v.id))};
  }

  try {
    const result = await session.run(query, params);
    return processResult(result.records, context, "child", "r", false);
  } catch (error) {
    console.error(
      `Error fetching children for vertex ${vertexes
        .map((v) => v.id)
        .join(",")}:`,
      error,
    );
    return;
  } finally {
    if (!context.session) {
      await session.close();
    }
  }
}