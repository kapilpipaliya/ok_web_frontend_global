import type { Store } from "solid-js/store";

import type { GraphInterface } from "../graph";

export function deleteTxnId(txnId: number, graph: Store<GraphInterface>) {
  if (!txnId || !graph.transactions.has(txnId)) return;
  graph.transactions.delete(txnId);
}
