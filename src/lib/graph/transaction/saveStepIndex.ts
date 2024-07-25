import type { Store } from "solid-js/store";

import type { GraphInterface } from "../graph";

import { getLastTxnIndex } from "./getLastTxnIndex";

export function saveStepIndex(txnId: number, name: string, graph: Store<GraphInterface>) {
  if (!txnId || !graph.transactions.has(txnId)) return;
  const transaction = graph.transactions.get(txnId);
  if (transaction) {
    transaction.namedUndoStepIndexes[name] = getLastTxnIndex(txnId, graph);
  }
}
