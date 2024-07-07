import type { Store } from "solid-js/store";

import type { GraphInterface } from "../graph";

import { getExistingOrDefaultTxnValue } from "./getExistingOrDefaultTxnValue";


export function updateSubmittedIndex(txnId: number, graph: Store<GraphInterface>) {
  if (!txnId || !graph.transactions.has(txnId)) return;
  const existingTxnValue = getExistingOrDefaultTxnValue(txnId, graph);
  existingTxnValue.submittedIndex = existingTxnValue.activeUndoIndex;
  existingTxnValue.revertSteps = [];
  graph.transactions.set(txnId, existingTxnValue);
}
