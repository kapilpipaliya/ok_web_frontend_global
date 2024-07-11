import type { SetStoreFunction } from "solid-js/store";

import { batch } from "solid-js";

import type { EdgeMap, GraphInterface, Id, VertexMap } from "~/lib/graph/graph";

import { deleteEdge } from "~/lib/graph/mutate/edge";
import { deleteVertex } from "~/lib/graph/mutate/vertex";

export function setGraphData(
  graph: GraphInterface,
  setGraph: SetStoreFunction<GraphInterface>,
  args: {
    deleted_edges?: string[];
    deleted_vertexes?: string[];
    edges: EdgeMap;
    timestamp?: number;
    vertexLabelIdMap?: { [key: string]: Id[] };
    vertexes: VertexMap;
  },
  skipExisting = false,
) {
  batch(() => {
    for (const vertexId in args.vertexes) {
      if (skipExisting && graph.vertexes[vertexId]) {
        continue;
      }
      setGraph("vertexes", vertexId, (prev) => {
        if (prev) {
          const IN = { ...prev.IN, ...args.vertexes[vertexId].IN };
          const OUT = { ...prev.OUT, ...args.vertexes[vertexId].OUT };
          return { ...args.vertexes[vertexId], IN, OUT };
        }
        return args.vertexes[vertexId];
      });

      for (const label of args.vertexes[vertexId].L) {
        setGraph("vertexLabelIdMap", label, (vertexIds) => {
          return Array.isArray(vertexIds)
            ? [...new Set([...vertexIds, args.vertexes[vertexId].id])]
            : [args.vertexes[vertexId].id];
        });
      }
    }

    for (const edgeId in args.edges) {
      if (skipExisting && graph.edges[edgeId]) {
        continue;
      }
      setGraph("edges", edgeId, args.edges[edgeId]);
    }

    for (const edgeId in args.edges) {
      const edge = args.edges[edgeId];

      if (graph.vertexes[edge.S]) {
        setGraph("vertexes", edge.S, "OUT", edge.T, (out_edges) =>
          Array.isArray(out_edges)
            ? [...new Set([...out_edges, edge.id])]
            : [edge.id],
        );
      }

      if (graph.vertexes[edge.E]) {
        setGraph("vertexes", edge.E, "IN", edge.T, (in_edges) =>
          Array.isArray(in_edges)
            ? [...new Set([...in_edges, edge.id])]
            : [edge.id],
        );
      }
    }
    // timeTaken = Date.now() - start;
    // console.log("Total time taken : " + timeTaken + " milliseconds");
    for (const edgeId of args.deleted_edges || []) {
      deleteEdge(0, edgeId, graph, setGraph);
    }
    for (const vertexId of args.deleted_vertexes || []) {
      deleteVertex(0, vertexId, graph, setGraph);
    }
  });
}
