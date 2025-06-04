import type { SetStoreFunction } from "solid-js/store";

import { generateNewVertexId } from "~/lib/graph/mutate/core/generateNewVertexId";
import { addNewVertex } from "~/lib/graph/mutate/core/vertex/addNewVertex";
import { addNewEdge } from "~/lib/graph/mutate/core/edge/addNewEdge";
import { generateNewTxnId } from "~/lib/graph/transaction/core/generateNewTxnId";
import type { GraphInterface } from "~/lib/graph/context/GraphInterface";
import type {
  ExportedEdge,
  ExportedVertex,
} from "~/routes/api/schema/ExportedSchema";

export interface ImportGraphData {
  vertexes: Record<string, ExportedVertex> | ExportedVertex[];
  edges: Record<string, ExportedEdge> | ExportedEdge[];
}

/**
 * Imports a graph structure, creating new vertices and edges with new IDs.
 * Returns the transaction ID, map of old-to-new vertex IDs, and root vertex IDs.
 */
export function importGraphStructure(
  graphData: ImportGraphData,
  graph: GraphInterface,
  setGraph: SetStoreFunction<GraphInterface>,
): {
  metaTxnId: number;
  vertexIdMap: Map<string, string>;
  rootVertexIds: string[];
} {
  // Create a new transaction ID
  const metaTxnId = generateNewTxnId(graph, setGraph);

  // Store vertex old ids with new ids
  const vertexIdMap = new Map<string, string>();

  const vertexesToProcess = Array.isArray(graphData.vertexes)
    ? graphData.vertexes
    : Object.values(graphData.vertexes);

  // Add all vertices with new IDs
  for (const vertex of vertexesToProcess) {
    const oldId = vertex.id;
    const newId = generateNewVertexId(graph, setGraph);
    vertexIdMap.set(oldId, newId);

    const newVertex = {
      id: newId,
      IN: {},
      L: Array.isArray(vertex.L) ? vertex.L : [vertex.L],
      OUT: {},
      P: { ...vertex.P },
    };

    addNewVertex(metaTxnId, newVertex, graph, setGraph);
  }

  const edgesToProcess = Array.isArray(graphData.edges)
    ? graphData.edges
    : Object.values(graphData.edges);

  // Add all edges with new IDs, using the new vertex IDs
  for (const edge of edgesToProcess) {
    const newId = generateNewVertexId(graph, setGraph);

    // Check if this edge references existing database IDs
    const isExistingSourceId = edge.P?._existingSourceId === true;
    const isExistingEndId = edge.P?._existingEndId === true;

    // Get the start and end IDs - use existing database IDs or mapped IDs
    const startId = isExistingSourceId ? edge.S : vertexIdMap.get(edge.S);
    const endId = isExistingEndId ? edge.E : vertexIdMap.get(edge.E);

    // Skip if we can't find the mapped IDs (but not for existing database IDs)
    if (!startId || !endId) {
      console.warn(
        `Skipping edge ${edge.id}: missing vertex mapping for S:${edge.S} or E:${edge.E}`,
      );
      continue;
    }

    // Remove the temporary markers from edge properties
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { _existingSourceId, _existingEndId, ...cleanProps } = edge.P || {};

    const newEdge = {
      E: endId,
      id: newId,
      P: cleanProps,
      S: startId,
      T: edge.T,
    };

    addNewEdge(metaTxnId, newEdge, graph, setGraph);
  }

  // Find root vertices (those with no parents)
  const parentMap = new Map<string, boolean>();

  for (const edge of edgesToProcess) {
    parentMap.set(vertexIdMap.get(edge.E) || "", true);
  }

  const rootVertexIds = Array.from(vertexIdMap.values()).filter(
    (id) => !parentMap.has(id),
  );

  return {
    metaTxnId,
    vertexIdMap,
    rootVertexIds,
  };
}
