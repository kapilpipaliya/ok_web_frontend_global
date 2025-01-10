import type { SetStoreFunction } from "solid-js/store";

import { batch } from "solid-js";

import type {
  Edge,
  EdgeMap,
  GraphInterface,
  Id,
  Vertex,
  VertexMap,
} from "~/lib/graph/graph";

import { deleteEdge } from "~/lib/graph/mutate/edge";
import { deleteVertex } from "~/lib/graph/mutate/vertex";
import { broadcastToAllChannels } from "~/components/page_designer/layout/channel";

interface UpdateOptions {
  skipExisting?: boolean;
  skipPostMessage?: string;
}

export function updateVertex(
  vertexId: string,
  vertexData: Vertex,
  graph: GraphInterface,
  setGraph: SetStoreFunction<GraphInterface>,
  options: UpdateOptions = {},
) {
  const { skipExisting = false, skipPostMessage = false } = options;

  if (skipExisting && graph.vertexes[vertexId]) {
    return;
  }

  setGraph("vertexes", vertexId, (prev) => {
    if (prev) {
      const IN = { ...prev.IN, ...vertexData.IN };
      const OUT = { ...prev.OUT, ...vertexData.OUT };
      return { ...vertexData, IN, OUT };
    }
    return vertexData;
  });

  for (const label of vertexData.L) {
    setGraph("vertexLabelIdMap", label, (vertexIds) => {
      return Array.isArray(vertexIds)
        ? [...new Set([vertexData.id, ...vertexIds])]
        : [vertexData.id];
    });
  }
  broadcastToAllChannels(graph.broadcastChannels, options?.skipPostMessage ?? "", { updateVertex: { vertexId, vertexData, options } });
}

export function updateEdge(
  edgeId: string,
  edge: Edge,
  graph: GraphInterface,
  setGraph: SetStoreFunction<GraphInterface>,
  options: UpdateOptions = {},
) {
  const { skipExisting = false, skipPostMessage = "" } = options;

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
  broadcastToAllChannels(graph.broadcastChannels, options?.skipPostMessage ?? "", { updateEdge: { edgeId, edge, options } });
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
      updateVertex(
        vertexId,
        args.vertexes[vertexId],
        graph,
        setGraph,
        options,
      );
    }

    for (const edgeId in args.edges) {
      updateEdge(edgeId, args.edges[edgeId], graph, setGraph, options);
    }

    handleDeletions(args.deleted_edges, args.deleted_vertexes, graph, setGraph, options);
  });
}
