import { Vertex } from "./graph/graph";
import { calculateFilter, getTextValue } from "./graph/get/sync/traverse";
import { findVertexIdsByLabelMGCall } from "~/cypher_api/lib/graph/get/async/findVertex";
import { getDriverWithPort } from "~/cypher_api/server/driver";
// ->
export async function evalGetChildren(vertexes: any, edgeType: string, context: object) {
    if (!vertexes) return;
    const stepVertexes = new Map<number, Vertex>();
  
    for (const currentVertex of vertexes) {
      const type = edgeType.replace("$0", currentVertex.L[0]);


      // (currentVertex)->[r:Type]->(m)
  
      const edgeIds = currentVertex.OUT[type] || [];
      if (edgeIds.length == 0) {
        const strict = true;
        // we only return error if its in middle of path
        if (strict && path.length > 1) {
          return;
        } else {
          continue;
        }
      }
      for (const edgeId of edgeIds) {
        const edge = context.graph.edges[edgeId];
        if (edge) {
          const newVertex = context.graph.vertexes[edge.E];
          if (newVertex) {
            stepVertexes.set(newVertex.id, newVertex);
          } else {
            return;
          }
        } else {
          return;
        }
      }
    }
    return Array.from(stepVertexes.values());
  }

export async function evalGetChildrenMGCall(vertexes: Vertex[], edgeType: string) {
  "use server";
  if (!vertexes) return;

  const stepVertexes = new Map<number, Vertex>();

  const session = (await getDriverWithPort(1102)).session();

  for (const currentVertex of vertexes) {
    const type = edgeType.replace("$0", currentVertex.L[0]);

    const query = `
      MATCH (parent)-[:${type}]->(child)
      WHERE ID(parent) = $parentId
      RETURN child
    `;

    try {
      const result = await session.run(query, { parentId: currentVertex.id });

      for (const record of result.records) {
        const childNode = record.get('child');
        const newVertex = {
          id: childNode.identity.toInt(),
          L: childNode.labels,
          ...childNode.properties,
        };
        stepVertexes.set(newVertex.id, newVertex);
      }
    } catch (error) {
      console.error(`Error fetching children for vertex ${currentVertex.id}:`, error);
      return;
    }
  }

  return Array.from(stepVertexes.values());
}


  // <-
  export async function evalGetParents(vertexes: any, edgeType: string, context: object) {
    if (!vertexes) return;
    const stepVertexes = new Map<number, Vertex>();
  
    for (const currentVertex of vertexes) {
      const [type, filter, isMultiple] = calculateFilter(
        edgeType.replace("$0", currentVertex.L[0]),
      );
  
      // // (p)<-[r:type]-(m)
      const edgeIds = currentVertex.IN[type];
      if (!edgeIds) {
        continue;
      }
  
      for (const edgeId of edgeIds) {
        const edge = context.graph.edges[edgeId];
        if (edge) {
          const newVertex = context.graph.vertexes[edge.S];
          if (newVertex) {
            stepVertexes.set(newVertex.id, newVertex);
          } else {
            return;
          }
        } else {
          return;
        }
      }
    }
    return Array.from(stepVertexes.values());
  }

export async function evalGetParentsMGCall(vertexes: Vertex[], edgeType: string) {
  "use server";
  if (!vertexes) return;

  const stepVertexes = new Map<number, Vertex>();
  const session = (await getDriverWithPort(1102)).session();

  for (const currentVertex of vertexes) {
    const type = edgeType.replace("$0", currentVertex.L[0]);

    // Cypher query to get parents
    const query = `
      MATCH (parent)-[:${type}]->(child)
      WHERE ID(child) = $childId
      RETURN parent
    `;

    try {
      const result = await session.run(query, { childId: currentVertex.id });

      for (const record of result.records) {
        const parentNode = record.get('parent');
        const newVertex = {
          id: parentNode.identity.toInt(),
          L: parentNode.labels,
          ...parentNode.properties,
        };
        stepVertexes.set(newVertex.id, newVertex);
      }
    } catch (error) {
      console.error(`Error fetching parents for vertex ${currentVertex.id}:`, error);
      return;
    }
  }

  return Array.from(stepVertexes.values());
}

export async function evalGlobalColl(edgeType: string, context: object) {
    const [type, filter, isMultiple] = calculateFilter(edgeType);
    if (filter) {
      const vertexIds = findVertexIdsByLabelMGCall(context.graph, type);
      const filteredVertexes = [];
      for (const vertexId of vertexIds) {
        if (context.graph.vertexes[vertexId].P[IdAttr] === filter) {
          filteredVertexes.push(context.graph.vertexes[vertexId]);
        }
      }
      return filteredVertexes;
    } else {
      return findVertexIdsByLabelMGCall(context.graph, edgeType).map(
        (id) => context.graph.vertexes[id],
      );
    }
  }