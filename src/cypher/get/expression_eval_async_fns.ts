import type {Edge, Vertex} from "~/lib/graph/graph";
import {calculateFilter} from "~/lib/graph/get/sync/traverse";
import {int, type Session} from "neo4j-driver";
import {convertNodeToJson, convertRelationshipToJson,} from "~/lib/convertNodeToJson";
import {getSessionForSubdomain} from "~/cypher/get/getSessionForSubdomain";
import {findVertexMGCallId} from "~/cypher/get/findVertexMGCallId";

// ->
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
    params = { parentIds: vertexes.map((v) => int(v.id)) };
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

// <-
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
    params = { childIds: vertexes.map((v) => int(v.id)) };
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

export async function evalGlobalColl(
  edgeType: string,
  context: {
    nodes?: { [key: string]: Vertex };
    relationships?: { [key: string]: Edge };
    session?: Session;
  } = {},
) {
  "use server";
  const session = context.session  ||= await getSessionForSubdomain();
  const { type, filter, isMultiple, skip, limit } = calculateFilter(edgeType);

  try {
    return await findVertexMGCallId(
      session,
      {label: type ?? edgeType, skip, limit, name: filter},
      context,
    );
  } catch (error: any) {
    throw new Error(error.message);
  } finally {
    await context.session?.close();
  }
}

export async function evalVertexById(
  id: string,
  context: {
    nodes?: { [key: string]: Vertex };
    relationships?: { [key: string]: Edge };
    session?: Session
  } = {},
) {
  "use server";
  const session = context.session ||= await getSessionForSubdomain();
  try {
    return await findVertexMGCallId(session, { id }, context);
  } catch (error: any) {
    throw new Error(error.message);
  } finally {
    await context.session?.close();
  }
}

// evalVertexById
// evalGetParents

