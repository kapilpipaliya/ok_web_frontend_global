import type { SetStoreFunction, Store } from "solid-js/store";

import type { GraphInterface } from "../../graph";

import { deleteVertex } from "../../mutate/core/vertex";

export function deleteTxnId(
  txnId: number,
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
) {
  if (!txnId) {
    return;
  }
  const txnVertex = graph.vertexes[`txn${txnId}`];
  if (!txnVertex) {
    return;
  }
  deleteVertex(0, `txn${txnId}`, graph, setGraph);
}
