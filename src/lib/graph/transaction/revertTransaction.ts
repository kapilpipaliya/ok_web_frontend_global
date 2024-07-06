import type { Store } from "solid-js/store";

import { batch } from "solid-js";

import type { GraphInterface } from "../graph";


export function revertTransaction(txnId: number, graph: Store<GraphInterface>) {
  if (!txnId || !graph.transactions.has(txnId)) return;
  const existingTxnValue = [...(graph.transactions.get(txnId)?.steps || [])];
  batch(() => {
    existingTxnValue.reverse().forEach((txn) => txn.revert());
  });
  graph.transactions.delete(txnId);
}
