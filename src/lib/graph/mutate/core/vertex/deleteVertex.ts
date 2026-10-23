// delete a vertex
import type { StoreSetter as SetStoreFunction, Store } from "solid-js";
import { untrack } from "solid-js";
import { getVertexOldIdToNewIdMap } from "~/lib/graph/get/sync/store/getGlobalStore";
import { klona } from "klona";
import { transactionDetailAdd } from "~/lib/graph/transaction/core/transactionDetailAdd";
import { getLastTxnIndex } from "~/lib/graph/transaction/value/getLastTxnIndex";
import { broadcastToAllChannels } from "~/lib/graph/mutate/core/channel/broadcastToAllChannels";
import { produceGraph } from "~/lib/graph/mutate/core/produceGraph";
import type { Id } from "~/lib/graph/type/id";
import type { GraphInterface } from "~/lib/graph/context/GraphInterface";

export function deleteVertex(
  txnId: number,
  vertexId: Id,
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
  options?: { skipPostMessage?: string; skipTransactionDetail?: boolean },
): {
  error: boolean | string;
  txnDetailIndex?: number;
} {
  return untrack(() => {
    const actualVertexId =
      getVertexOldIdToNewIdMap(graph)[vertexId] || vertexId;

    if (!graph.vertexes[actualVertexId]) {
      return { error: "Vertex ID is not valid" };
    }
    // TODO:
    //  this must check
    //  if the in and out edges are empty else not allow to delete.

    const vertex = graph.vertexes[actualVertexId];

    if (Object.keys(vertex.OUT).length > 0) {
      alert(
        `there are multiple children exist when deleting ${vertex.L[0]} (${actualVertexId})`,
      );
      return { error: "Vertex Children Exist When deleting vertex" };
    }

    if (Object.keys(vertex.IN).length > 0) {
      const parentInfo = Object.entries(vertex.IN)
        .map(([edgeType, edgeIds]) => {
          const parents = edgeIds.map(
            (id) => graph.vertexes[graph.edges[id].S],
          );
          return `${edgeType}: ${parents.map((p) => JSON.stringify(p)).join(", ")}`;
        })
        .join(", ");

      console.error(
        `Multiple parents exist when deleting ${vertex.L[0]} (${actualVertexId}):`,
        "\nVertex:",
        vertex,
        "\nParents:",
        parentInfo,
      );
      return { error: "Vertex Children Exist When deleting vertex" };
    }

    const data = klona(vertex);
    produceGraph(setGraph, (d) => {
      for (const label of d.vertexes[actualVertexId].L) {
        const vertexIds = d.vertexLabelIdMap[label];
        if (Array.isArray(vertexIds) && vertexIds.includes(actualVertexId)) {
          const filteredIds = vertexIds.filter((vId) => vId !== actualVertexId);
          if (filteredIds.length) {
            d.vertexLabelIdMap[label] = filteredIds;
          } else {
            delete d.vertexLabelIdMap[label];
          }
        }
      }
      delete d.vertexes[actualVertexId];
    });

    if (!options?.skipTransactionDetail) {
      transactionDetailAdd(
        txnId,
        {
          data,
          deleteVertex: "deleteVertexFn",
          id: actualVertexId,
          originalData: klona(vertex),
        },
        graph,
        setGraph,
        options,
      );
    }
    broadcastToAllChannels(
      graph.broadcastChannels,
      options?.skipPostMessage ?? "",
      { deleteVertex: { txnId, vertexId } },
    );
    return {
      error: false,
      txnDetailIndex: getLastTxnIndex(txnId, graph),
    };
  });
}
