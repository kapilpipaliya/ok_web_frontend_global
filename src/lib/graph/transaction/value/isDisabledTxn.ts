import type { Store } from "solid-js/store";

import type { GraphInterface } from "~/lib/graph/GraphContext";

import { getLastTxnIndex } from "./getLastTxnIndex";
import { getActiveUndoIndex } from "../steps/getActiveUndoIndex";

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
  const activeUndoIndex = getActiveUndoIndex(txnId, graph);
  return (
    txnVertex.P.steps.length === 0 ||
    activeUndoIndex === txnVertex.P.preventUndoBeforeIndex ||
    (txnVertex.P.submittedIndex > -1
      ? txnVertex.P.submittedIndex === activeUndoIndex
      : false)
  );
}
