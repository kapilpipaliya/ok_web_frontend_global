import type { SetStoreFunction } from "solid-js/store";

import { batch } from "solid-js";

import { deleteVertex } from "~/lib/graph/mutate/core/vertex/deleteVertex";
import { deleteEdge } from "~/lib/graph/mutate/core/edge/deleteEdge";
import { broadcastToAllChannels } from "~/lib/graph/mutate/core/channel/broadcastToAllChannels";
import { produceGraph } from "~/lib/graph/mutate/core/produceGraph";
import type { Id } from "~/lib/graph/type/id";
import type { Edge } from "~/lib/graph/type/edge";
import type { Vertex } from "~/lib/graph/type/vertex";
import type { GraphInterface } from "~/lib/graph/context/GraphInterface";
import type { GraphData } from "~/lib/types/GraphData";
import { restoreVertexAdjacencyFromEdges } from "~/lib/graph/transfer/restoreVertexAdjacencyFromEdges";

export interface UpdateOptions {
  skipExisting?: boolean;
  skipPostMessage?: string;
  skipTransactionDetail?: boolean;
}

export function setGraphData(
  graph: GraphInterface,
  setGraph: SetStoreFunction<GraphInterface>,
  graphData: GraphData,
  options: UpdateOptions = {},
) {
  if (graphData.vertexes) {
    if (graphData.edges && Object.keys(graphData.edges).length > 0) {
      restoreVertexAdjacencyFromEdges(graphData);
    } else {
      // Stripped wire payloads may omit IN/OUT even when there are no edges.
      for (const vertex of Object.values(graphData.vertexes)) {
        if (!vertex.IN) vertex.IN = {};
        if (!vertex.OUT) vertex.OUT = {};
      }
    }
  }

  batch(() => {
    for (const vertexId in graphData.vertexes) {
      updateVertex(
        vertexId,
        graphData.vertexes[vertexId],
        graph,
        setGraph,
        options,
      );
    }

    for (const edgeId in graphData.edges) {
      updateEdge(edgeId, graphData.edges[edgeId], graph, setGraph, options);
    }

    handleDeletions(
      graphData.deleted_edges,
      graphData.deleted_vertexes,
      graph,
      setGraph,
      options,
    );
  });
}

export function updateEdge(
  edgeId: string,
  edge: Edge,
  graph: GraphInterface,
  setGraph: SetStoreFunction<GraphInterface>,
  options: UpdateOptions = {},
) {
  const { skipExisting = false } = options;

  if (skipExisting && graph.edges[edgeId]) {
    return;
  }

  produceGraph(setGraph, (d) => {
    d.edges[edgeId] = edge;

    if (d.vertexes[edge.S]) {
      const outEdges = d.vertexes[edge.S].OUT[edge.T];
      d.vertexes[edge.S].OUT[edge.T] = Array.isArray(outEdges)
        ? [...new Set([edge.id, ...outEdges])]
        : [edge.id];
    }

    if (d.vertexes[edge.E]) {
      const inEdges = d.vertexes[edge.E].IN[edge.T];
      d.vertexes[edge.E].IN[edge.T] = Array.isArray(inEdges)
        ? [...new Set([edge.id, ...inEdges])]
        : [edge.id];
    }
  });

  broadcastToAllChannels(
    graph.broadcastChannels,
    options?.skipPostMessage ?? "",
    { updateEdge: { edge, edgeId, options } },
  );
}

export function updateVertex(
  vertexId: string,
  vertexData: Vertex,
  graph: GraphInterface,
  setGraph: SetStoreFunction<GraphInterface>,
  options: UpdateOptions = {},
) {
  const { skipExisting = false } = options;

  if (skipExisting && graph.vertexes[vertexId]) {
    return;
  }

  produceGraph(setGraph, (d) => {
    const prev = d.vertexes[vertexId];
    if (prev) {
      // Existing vertices may lack IN/OUT after strip-without-restore wire transfers.
      const prevIN = prev.IN || {};
      const prevOUT = prev.OUT || {};

      const IN: { [key: string]: Id[] } = { ...prevIN };
      if (vertexData.IN) {
        for (const key in vertexData.IN) {
          const prevIds = prevIN[key] || [];
          const newIds = vertexData.IN[key] || [];
          IN[key] = [...new Set([...newIds, ...prevIds])];
        }
      }

      const OUT: { [key: string]: Id[] } = { ...prevOUT };
      if (vertexData.OUT) {
        for (const key in vertexData.OUT) {
          const prevIds = prevOUT[key] || [];
          const newIds = vertexData.OUT[key] || [];
          OUT[key] = [...new Set([...newIds, ...prevIds])];
        }
      }

      d.vertexes[vertexId] = { ...vertexData, IN, OUT };
    } else {
      d.vertexes[vertexId] = {
        ...vertexData,
        IN: vertexData.IN || {},
        OUT: vertexData.OUT || {},
      };
    }

    for (const label of vertexData.L) {
      const vertexIds = d.vertexLabelIdMap[label];
      d.vertexLabelIdMap[label] = Array.isArray(vertexIds)
        ? [...new Set([vertexData.id, ...vertexIds])]
        : [vertexData.id];
    }
  });

  broadcastToAllChannels(
    graph.broadcastChannels,
    options?.skipPostMessage ?? "",
    { updateVertex: { options, vertexData, vertexId } },
  );
}

function handleDeletions(
  deletedEdges: string[] | undefined,
  deletedVertexes: string[] | undefined,
  graph: GraphInterface,
  setGraph: SetStoreFunction<GraphInterface>,
  options: UpdateOptions = {},
) {
  for (const edgeId of deletedEdges || []) {
    deleteEdge(0, edgeId, graph, setGraph, options);
  }

  for (const vertexId of deletedVertexes || []) {
    deleteVertex(0, vertexId, graph, setGraph, options);
  }
}
