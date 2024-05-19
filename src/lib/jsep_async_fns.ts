import { Edge, GraphInterface, IdAttr, Vertex } from "./graph/graph";
import { calculateFilter, getTextValue } from "./graph/get/sync/traverse";
import { getDriverWithPort, isIntegerId } from "~/cypher_api/server/driver";
import { Session } from "neo4j-driver";
import { SetStoreFunction, Store } from "solid-js/store";
import { convertNodeToJson, convertRelationshipToJson } from "./convertNodeToJson";
// ->
export async function evalGetChildren(vertexes: Vertex[], edgeType: string, {nodes, relationships}: {
  nodes?: {[key: string]: Vertex},
  relationships?: {[key: string]: Edge}
} = {}) {
  "use server";
  
  if (!vertexes || vertexes.length === 0) return;
  const session = (await getDriverWithPort(1102)).session();
  const type = edgeType.replace("$0", vertexes[0].L[0]);
  const query = `
    MATCH (parent)-[r:${type}]->(child)
    WHERE id(parent) IN $parentIds
    RETURN r, child
  `;
  try {
    const result = await session.run(query, { parentIds: vertexes.map(v => v.id) });
    return result.records.map(record => {
      const vertex = convertNodeToJson(record.get('child'));
      if (nodes) {
        nodes[vertex.id] = vertex;
      }
      if (relationships) {
        const relationship = convertRelationshipToJson(record.get('r'));
        relationships[relationship.id] = relationship;
      }
      return vertex;
    });
  } catch (error) {
    console.error(`Error fetching children for vertex ${vertexes.map(v => v.id).join(',')}:`, error);
    return;
  }
}


// <-
export async function evalGetParents(vertexes: Vertex[], edgeType: string, {nodes, relationships}: {
  nodes?: {[key: string]: Vertex},
  relationships?: {[key: string]: Edge}
} = {}) {
  "use server";
  if (!vertexes || vertexes.length === 0) return;
  const session = (await getDriverWithPort(1102)).session();
  const type = edgeType.replace("$0", vertexes[0].L[0]);

  // Cypher query to get parents
  const query = `
  MATCH (parent)-[r:${type}]->(child)
  WHERE id(child) IN $childIds
  RETURN r, parent
`;

  try {
    const result = await session.run(query, { childIds: vertexes.map(v => v.id) });
    return result.records.map(record => {
      const vertex = convertNodeToJson(record.get('parent'));
      if (nodes) {
        nodes[vertex.id] = vertex;
      }
      if (relationships) {
        const relationship = convertRelationshipToJson(record.get('r'));
        relationships[relationship.id] = relationship;
      }
      return vertex;
    });
  } catch (error) {
    console.error(`Error fetching parents for vertex ${vertexes.map(v => v.id).join(', ')}:`, error);
    return;
  }
}

async function findVertexsMGCall(session: Session, label: string, {nodes, relationships}: {
  nodes?: {[key: string]: Vertex},
  relationships?: {[key: string]: Edge}
} = {}) {
  const query = `MATCH (n:${label}) RETURN n`;
  const result = await session.run(query);
  return result.records.map((record) => {
    const vertex = convertNodeToJson(record.get('n'));
    if (nodes) {
      nodes[vertex.id] = vertex;
    }
    return vertex;
  });
}

export async function evalGlobalColl(edgeType: string, context: {
  nodes?: {[key: string]: Vertex},
  relationships?: {[key: string]: Edge}
} = {}) {
  const [type, filter, isMultiple] = calculateFilter(edgeType);
  const session = (await getDriverWithPort(1102)).session();

  try {
    if (filter) {
      const vertexes = await findVertexsMGCall(session, type, context);
      const filteredVertexes = vertexes.filter(vertex => vertex.P[IdAttr] === filter);
      return filteredVertexes;
    } else {
      return await findVertexsMGCall(session, edgeType, context);
    }
  } catch (error) {
    console.error('Error querying Memgraph:', error);
    return [];
  }
}