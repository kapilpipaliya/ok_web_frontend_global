// update vertex id when we receive new id from api response
import type { StoreSetter as SetStoreFunction, Store } from "solid-js";
import { untrack } from "solid-js";

import { broadcastToAllChannels } from "~/lib/graph/mutate/core/channel/broadcastToAllChannels";
import { produceGraph } from "~/lib/graph/mutate/core/produceGraph";
import type { Id } from "~/lib/graph/type/id";
import type { GraphInterface } from "~/lib/graph/context/GraphInterface";

export function updateVertexId(
  oldVertexId: Id,
  newVertexId: Id,
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
  options?: { skipPostMessage?: string; skipTransactionDetail?: boolean },
) {
  return untrack(() => {
    if (!graph.vertexes[oldVertexId]) {
      return { error: "Vertex ID is not valid" };
    }
    if (graph.vertexes[newVertexId]) {
      return { error: "new Vertex ID is not valid" };
    }
    produceGraph(setGraph, (d) => {
      d.vertexes[newVertexId] = d.vertexes[oldVertexId];
      d.vertexes[newVertexId].id = newVertexId;
      for (const label of d.vertexes[newVertexId].L) {
        const ids = d.vertexLabelIdMap[label];
        d.vertexLabelIdMap[label] = Array.isArray(ids)
          ? [...ids.filter((id) => id !== oldVertexId), newVertexId]
          : [newVertexId];
      }
      for (const [_edgeType, edgeIds] of Object.entries(
        d.vertexes[newVertexId].OUT,
      )) {
        for (const edgeId of edgeIds) {
          d.edges[edgeId].S = newVertexId;
        }
      }
      for (const [_edgeType, edgeIds] of Object.entries(
        d.vertexes[newVertexId].IN,
      )) {
        for (const edgeId of edgeIds) {
          d.edges[edgeId].E = newVertexId;
        }
      }
      delete d.vertexes[oldVertexId];
    });
    broadcastToAllChannels(
      graph.broadcastChannels,
      options?.skipPostMessage ?? "",
      { updateVertexId: { newVertexId, oldVertexId } },
    );
    return { error: "" };
  });
}
