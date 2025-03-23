import type { Store } from "solid-js/store";

import type { GraphInterface } from "~/lib/graph/GraphContext";

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
    (activeUndoIndex !== -1 &&
      txnVertex.P.preventUndoBeforeIndex !== -1 &&
      activeUndoIndex === txnVertex.P.preventUndoBeforeIndex) ||
    false
  );
}
