import type { Store } from "solid-js/store";

import type { GraphInterface } from "../graph";

export function isDisabledTxn(txnId: number, graph: Store<GraphInterface>): boolean {
  const txn = graph.transactions.get(txnId);
  if (!txn) return true;
  return txn.steps.length === 0 || txn.submittedStep === txn.steps.length - 1;
}
