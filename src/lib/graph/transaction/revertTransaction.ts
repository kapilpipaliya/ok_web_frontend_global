import type { Store } from "solid-js/store";

import type { GraphInterface } from "../graph";

import { undo } from "./undo";

export function revertTransaction(txnId: number, graph: Store<GraphInterface>) {
  if (!txnId || !graph.transactions.has(txnId)) return;
  undo(txnId, graph, -1, true);
  graph.transactions.delete(txnId);
}

