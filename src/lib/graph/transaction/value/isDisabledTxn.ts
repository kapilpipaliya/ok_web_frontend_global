import type { Store } from "solid-js/store";

import type { GraphInterface } from "../../graph";

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
    (txnVertex.P.submittedIndex > 0
      ? txnVertex.P.submittedIndex === lastIndex
      : false)
  );
}
