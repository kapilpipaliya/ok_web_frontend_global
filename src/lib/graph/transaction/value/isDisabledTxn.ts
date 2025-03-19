import type { Store } from "solid-js/store";

import type { GraphInterface } from "~/lib/graph/GraphContext";

import { getLastTxnIndex } from "./getLastTxnIndex";

export function isDisabledTxn(
  txnId: number,
  graph: Store<GraphInterface>,
): boolean {
  if (!txnId) {
    return true;
  }
  const txnVertex = graph.vertexes[`txn${txnId}`];
  if (!txnVertex) {
    return true;
  }
  const lastIndex = getLastTxnIndex(txnId, graph);
  return (
    txnVertex.P.steps.length === 0 ||
    txnVertex.P.activeUndoIndex === txnVertex.P.preventUndoBeforeIndex ||
    (txnVertex.P.submittedIndex > -1
      ? txnVertex.P.submittedIndex === lastIndex
      : false)
  );
}
