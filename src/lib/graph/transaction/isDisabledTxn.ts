import type { Store } from "solid-js/store";

import type { GraphInterface } from "../graph";

import { getLastTxnIndex } from "./getLastTxnIndex";

export function isDisabledTxn(
  txnId: number,
  graph: Store<GraphInterface>,
): boolean {
  const txn = graph.transactions.get(txnId);
  if (!txn) { return true; }
  const lastIndex = getLastTxnIndex(txnId, graph);
  return (
    txn.steps.length === 0 ||
    txn.activeUndoIndex === txn.preventUndoBeforeIndex ||
    (txn.submittedIndex > 0
      ? txn.submittedIndex === lastIndex
      : false)
  );
}
