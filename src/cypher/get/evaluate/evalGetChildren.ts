// ->
import type {Edge, Vertex} from "~/lib/graph/graph";
import {int, Session} from "neo4j-driver";
import {getSessionForSubdomain} from "~/cypher/get/getSessionForSubdomain";
import {convertNodeToJson, convertRelationshipToJson} from "~/lib/convertNodeToJson";

export async function evalGetChildren(
  vertexes: Vertex[],
  edgeType: string,
  context: {
    nodes?: { [key: string]: Vertex };
    relationships?: { [key: string]: Edge };
    session?: Session
  } = {},
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
    return result.records.map((record) => {
      const vertex = convertNodeToJson(record.get("child"));
      if (context.nodes) {
        context.nodes[vertex.id] = vertex;
      }
      if (context.relationships) {
        const relationship = convertRelationshipToJson(record.get("r"));
        context.relationships[relationship.id] = relationship;
      }
      return vertex;
    });
  } catch (error) {
    console.error(
      `Error fetching children for vertex ${vertexes
        .map((v) => v.id)
        .join(",")}:`,
      error,
    );
    return;
  } finally {
    await context.session?.close();
  }
}