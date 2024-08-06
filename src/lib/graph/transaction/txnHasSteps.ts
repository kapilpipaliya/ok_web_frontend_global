import type { Store } from "solid-js/store";

import type { GraphInterface } from "../graph";

export function txnHasSteps(txnId: number, graph: Store<GraphInterface>) {
  if (!(txnId && graph.transactions.has(txnId))) { return false; }
  const existingTxnValue = graph.transactions.get(txnId)?.steps || [];
  return existingTxnValue.length > 0;
}
