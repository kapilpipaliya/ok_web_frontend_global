// <-
import type {Edge, Vertex} from "~/lib/graph/graph";
import {int, Session} from "neo4j-driver";
import {getSessionForSubdomain} from "~/cypher/get/getSessionForSubdomain";
import {convertNodeToJson, convertRelationshipToJson} from "~/lib/convertNodeToJson";

export async function evalGetParents(
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
    const result = await session.run(query, params);
    return result.records.map((record) => {
      const vertex = convertNodeToJson(record.get("parent"));
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
      `Error fetching parents for vertex ${vertexes
        .map((v) => v.id)
        .join(", ")}:`,
      error,
    );
    return;
  } finally {
    await context.session?.close();
  }
}