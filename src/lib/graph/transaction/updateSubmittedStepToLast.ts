import type { Store } from "solid-js/store";

import type { GraphInterface } from "../graph";

import { getExistingOrDefaultTxnValue } from "./getExistingOrDefaultTxnValue";


export function updateSubmittedStepToLast(txnId: number, graph: Store<GraphInterface>) {
  if (!txnId || !graph.transactions.has(txnId)) return;
  const existingTxnValue = getExistingOrDefaultTxnValue(txnId, graph);
  existingTxnValue.submittedStep = existingTxnValue.steps.length - 1;
  graph.transactions.set(txnId, existingTxnValue);
}
