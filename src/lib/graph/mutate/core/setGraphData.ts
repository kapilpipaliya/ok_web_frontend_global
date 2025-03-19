import type { SetStoreFunction } from "solid-js/store";

import { batch } from "solid-js";

import type { Edge, EdgeMap, Id, Vertex, VertexMap } from "~/lib/graph/graph";
import type { GraphInterface } from "~/lib/graph/GraphContext";

import { broadcastToAllChannels } from "~/lib/graph/mutate/core/channel";
import { deleteEdge } from "~/lib/graph/mutate/core/edge";
import { deleteVertex } from "~/lib/graph/mutate/core/vertex";

export interface UpdateOptions {
  skipExisting?: boolean;
  skipPostMessage?: string;
}

export function setGraphData(
  graph: GraphInterface,
  setGraph: SetStoreFunction<GraphInterface>,
  args: {
    deleted_edges?: string[];
    deleted_vertexes?: string[];
    edges: EdgeMap;
    timestamp?: number;
    vertexes: VertexMap;
    vertexLabelIdMap?: { [key: string]: Id[] };
  },
  options: UpdateOptions = {},
) {
  batch(() => {
    for (const vertexId in args.vertexes) {
      updateVertex(vertexId, args.vertexes[vertexId], graph, setGraph, options);
    }

    for (const edgeId in args.edges) {
      updateEdge(edgeId, args.edges[edgeId], graph, setGraph, options);
    }

    handleDeletions(
      args.deleted_edges,
      args.deleted_vertexes,
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

  setGraph("edges", edgeId, edge);

  if (graph.vertexes[edge.S]) {
    setGraph("vertexes", edge.S, "OUT", edge.T, (out_edges) =>
      Array.isArray(out_edges)
        ? [...new Set([edge.id, ...out_edges])]
        : [edge.id],
    );
  }

  if (graph.vertexes[edge.E]) {
    setGraph("vertexes", edge.E, "IN", edge.T, (in_edges) =>
      Array.isArray(in_edges)
        ? [...new Set([edge.id, ...in_edges])]
        : [edge.id],
    );
  }
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

  setGraph("vertexes", vertexId, (prev) => {
    if (prev) {
      // Create deep merged IN object
      const IN: { [key: string]: Id[] } = { ...prev.IN };
      if (vertexData.IN) {
        for (const key in vertexData.IN) {
          const prevIds = prev.IN[key] || [];
          const newIds = vertexData.IN[key] || [];
          IN[key] = [...new Set([...newIds, ...prevIds])];
        }
      }

      // Create deep merged OUT object
      const OUT: { [key: string]: Id[] } = { ...prev.OUT };
      if (vertexData.OUT) {
        for (const key in vertexData.OUT) {
          const prevIds = prev.OUT[key] || [];
          const newIds = vertexData.OUT[key] || [];
          OUT[key] = [...new Set([...newIds, ...prevIds])];
        }
      }

      return { ...vertexData, IN, OUT };
    }
    return vertexData;
  });

  for (const label of vertexData.L) {
    setGraph("vertexLabelIdMap", label, (vertexIds: Id[]) => {
      return Array.isArray(vertexIds)
        ? [...new Set([vertexData.id, ...vertexIds])]
        : [vertexData.id];
    });
  }
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
