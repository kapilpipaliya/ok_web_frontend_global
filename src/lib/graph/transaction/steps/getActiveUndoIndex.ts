import type { Store } from "solid-js/store";

import type { GraphInterface } from "../../GraphContext";

export function getActiveUndoIndex(
  txnId: number,
  graph: Store<GraphInterface>,
) {
  const txnVertex = graph.vertexes[`txn${txnId}`];

  if (!txnVertex) {
    return -1;
  }
  return txnVertex.P.activeUndoIndex ?? -1;
}
