// no transaction detail add
import type { StoreSetter as SetStoreFunction, Store } from "solid-js";
import { untrack } from "solid-js";
import { klona } from "klona";

import { broadcastToAllChannels } from "~/lib/graph/mutate/core/channel/broadcastToAllChannels";
import { produceGraph } from "~/lib/graph/mutate/core/produceGraph";
import type { Id } from "~/lib/graph/type/id";
import type { GraphInterface } from "~/lib/graph/context/GraphInterface";

export function updateEdgeId(
  oldEdgeId: Id,
  newEdgeId: Id,
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
  options?: { skipPostMessage?: string; skipTransactionDetail?: boolean },
) {
  return untrack(() => {
    if (!graph.edges[oldEdgeId]) {
      return { error: "ID is not valid" };
    }
    if (graph.edges[newEdgeId]) {
      return { error: "new Edge ID is not valid" };
    }
    const oldEdge = graph.edges[oldEdgeId];
    produceGraph(setGraph, (d) => {
      d.edges[newEdgeId] = {
        ...klona(d.edges[oldEdgeId]),
        id: newEdgeId,
      };
      const outIds = d.vertexes[oldEdge.S].OUT[oldEdge.T];
      d.vertexes[oldEdge.S].OUT[oldEdge.T] = [
        ...outIds.filter((id) => id !== oldEdgeId),
        newEdgeId,
      ];
      const inIds = d.vertexes[oldEdge.E].IN[oldEdge.T];
      d.vertexes[oldEdge.E].IN[oldEdge.T] = [
        ...inIds.filter((id) => id !== oldEdgeId),
        newEdgeId,
      ];
      delete d.edges[oldEdgeId];
    });
    broadcastToAllChannels(
      graph.broadcastChannels,
      options?.skipPostMessage ?? "",
      { updateEdgeId: { newEdgeId, oldEdgeId } },
    );
    return { error: "" };
  });
}
