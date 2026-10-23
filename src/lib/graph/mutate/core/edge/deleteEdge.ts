import type { StoreSetter as SetStoreFunction, Store } from "solid-js";
import { untrack } from "solid-js";
import { getEdgeOldIdToNewIdMap } from "~/lib/graph/get/sync/store/getGlobalStore";
import { klona } from "klona";
import { transactionDetailAdd } from "~/lib/graph/transaction/core/transactionDetailAdd";
import { getLastTxnIndex } from "~/lib/graph/transaction/value/getLastTxnIndex";

import { updateEdgeIdsToNew } from "~/lib/graph/mutate/core/edge/updateEdgeIdsToNew";
import { broadcastToAllChannels } from "~/lib/graph/mutate/core/channel/broadcastToAllChannels";
import { produceGraph } from "~/lib/graph/mutate/core/produceGraph";
import type { Id } from "~/lib/graph/type/id";
import type { GraphInterface } from "~/lib/graph/context/GraphInterface";

export function deleteEdge(
  txnId: number,
  edgeId: Id,
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
  options?: { skipPostMessage?: string; skipTransactionDetail?: boolean },
): {
  error: boolean | string;
  txnDetailIndex?: number;
} {
  return untrack(() => {
    const actualEdgeId = getEdgeOldIdToNewIdMap(graph)[edgeId] || edgeId;

    if (!graph.edges[actualEdgeId]) {
      return { error: "Edge ID is not valid" };
    }
    const edge = updateEdgeIdsToNew(graph.edges[actualEdgeId], graph);
    const type = edge.T;
    const startId = graph.edges[actualEdgeId].S;
    const endId = graph.edges[actualEdgeId].E;

    produceGraph(setGraph, (d) => {
      const outIds = d.vertexes[startId]?.OUT?.[type];
      if (Array.isArray(outIds)) {
        const filtered = outIds.filter((id_) => id_ !== actualEdgeId);
        if (filtered.length) {
          d.vertexes[startId].OUT[type] = filtered;
        } else {
          delete d.vertexes[startId].OUT[type];
        }
      }
      const inIds = d.vertexes[endId]?.IN?.[type];
      if (Array.isArray(inIds)) {
        const filtered = inIds.filter((id_) => id_ !== actualEdgeId);
        if (filtered.length) {
          d.vertexes[endId].IN[type] = filtered;
        } else {
          delete d.vertexes[endId].IN[type];
        }
      }
      delete d.edges[actualEdgeId];
    });

    const data = klona(edge);

    if (!options?.skipTransactionDetail) {
      transactionDetailAdd(
        txnId,
        {
          data,
          deleteEdge: "deleteEdgeFn",
          id: actualEdgeId,
          originalData: klona(edge),
        },
        graph,
        setGraph,
        options,
      );
    }
    broadcastToAllChannels(
      graph.broadcastChannels,
      options?.skipPostMessage ?? "",
      { deleteEdge: { edgeId, txnId } },
    );
    return {
      error: false,
      txnDetailIndex: getLastTxnIndex(txnId, graph),
    };
  });
}
