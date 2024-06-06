import { type Edge, IdAttr, type Vertex } from "../../../lib/graph/graph";
import { calculateFilter } from "../../../lib/graph/get/sync/traverse";
import { getDriver } from "~/cypher_api/server/driver";
import { type Session, int } from "neo4j-driver";
import {
  convertNodeToJson,
  convertRelationshipToJson,
} from "../../../lib/convertNodeToJson";
import { getSubDomain } from "../../server/domain_utils";
import { getRequestURL } from "vinxi/http";
// ->
export async function evalGetChildren(
  vertexes: Vertex[],
  edgeType: string,
  {
    nodes,
    relationships,
  }: {
    nodes?: { [key: string]: Vertex };
    relationships?: { [key: string]: Edge };
  } = {},
) {
  "use server";
  const host = getRequestURL().hostname;
  const subDomain = await getSubDomain(host);
  if (!vertexes || vertexes.length === 0) return;
  const session = (await getDriver(subDomain)).session();
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
      if (nodes) {
        nodes[vertex.id] = vertex;
      }
      if (relationships) {
        const relationship = convertRelationshipToJson(record.get("r"));
        relationships[relationship.id] = relationship;
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
  }
}

// <-
export async function evalGetParents(
  vertexes: Vertex[],
  edgeType: string,
  {
    nodes,
    relationships,
  }: {
    nodes?: { [key: string]: Vertex };
    relationships?: { [key: string]: Edge };
  } = {},
) {
  "use server";
  const host = getRequestURL().hostname;
  const subDomain = await getSubDomain(host);
  if (!vertexes || vertexes.length === 0) return;
  const session = (await getDriver(subDomain)).session();
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
      if (nodes) {
        nodes[vertex.id] = vertex;
      }
      if (relationships) {
        const relationship = convertRelationshipToJson(record.get("r"));
        relationships[relationship.id] = relationship;
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
  }
}

async function findVertexsMGCallId(
  session: Session,
  {
    id,
    label,
    skip,
    limit,
    name
  }: { id?: string; label?: string; skip?: number; limit?: number, name?: string },
  {
    nodes,
    relationships,
  }: {
    nodes?: { [key: string]: Vertex };
    relationships?: { [key: string]: Edge };
  } = {},
) {
  let query: string | undefined;
  let params = {} as {name?: string, id: any};

  if (id) {
    query = "MATCH (n) WHERE id(n) = $id RETURN n";
    params.id = parseInt(id, 10);
  } else if (label) {
    if (name) {
      query = `MATCH (n:${label}) WHERE n.name = $name RETURN n`;
      params.name = name;
    }else{
      query = `MATCH (n:${label}) RETURN n`;
    }
  }
  
  if (name || skip || limit) {

    if (skip) {
      query += ` SKIP ${skip}`;
    }

    if (limit) {
      query += ` LIMIT ${limit}`;
    }
  }
  if (!query) {
    throw new Error("Either 'id' or 'label' must be provided.");
  }
  
  const result = await session.run(query, params);
  const vertexes = result.records.map((record) => {
    const vertex = convertNodeToJson(record.get("n"));
    if (nodes) {
      nodes[vertex.id] = vertex;
    }
    return vertex;
  })
  return vertexes;
}

export async function evalGlobalColl(
  edgeType: string,
  context: {
    nodes?: { [key: string]: Vertex };
    relationships?: { [key: string]: Edge };
  } = {},
) {
  "use server";
  const host = getRequestURL().hostname;
  const subDomain = await getSubDomain(host);

  const { type, filter, isMultiple, skip, limit } = calculateFilter(edgeType);

  const session = (await getDriver(subDomain)).session();

  try {
    const result = await findVertexsMGCallId(
      session,
      { label: type ?? edgeType, skip, limit, name: filter },
      context,
    );
    
    return result
  } catch (error: any) {
    throw new Error(error.message);
  } finally {
    await session.close();
  }
}

export async function evalVertexById(
  id: string,
  context: {
    nodes?: { [key: string]: Vertex };
    relationships?: { [key: string]: Edge };
  } = {},
) {
  "use server";
  const host = getRequestURL().hostname;
  const subDomain = await getSubDomain(host);
  const session = (await getDriver(subDomain)).session();
  try {
    return await findVertexsMGCallId(session, { id }, context);
  } catch (error: any) {
    throw new Error(error.message);
  } finally {
    await session.close();
  }
}

// evalVertexById
// evalGetParents

export const checkIfNameExistsMGCall = async (
  label: string,
  name: string,
  id?: string,
) => {
  "use server";
  const host = getRequestURL().hostname;
  const subDomain = await getSubDomain(host);
  const session = (await getDriver(subDomain)).session();
  
  try {
    const checkQuery = id
      ? `MATCH (v${label}) WHERE v.name = \$name AND v.elementId != \$id RETURN v`
      : `MATCH (v:${label}) WHERE v.name = \$name RETURN v`;

    const params = id ? { name, id } : { name };
    const checkResult = await session.run(checkQuery, params);
    if (checkResult.records.length > 0) {
      return {
        error: true,
        message: "Provided name already exists",
      };
    }
    return {
      error: false,
    };
  } catch (error: any) {
    return {
      error: true,
      message: error.message,
    };
  } finally {
    await session.close();
  }
}