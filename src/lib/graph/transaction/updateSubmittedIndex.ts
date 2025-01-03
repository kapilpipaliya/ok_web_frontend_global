import type { Store, SetStoreFunction } from "solid-js/store";

import type { GraphInterface } from "../graph";

import { getExistingOrDefaultTxnValue } from "./getExistingOrDefaultTxnValue";
import { replaceVertexProperties } from "../mutate/vertex";

export function updateSubmittedIndex(
  txnId: number,
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>
) {
  if (!txnId) {
    return;
  }
  const existingTxnValue = getExistingOrDefaultTxnValue(txnId, graph);
  existingTxnValue.submittedIndex = existingTxnValue.activeUndoIndex;
  existingTxnValue.revertSteps = [];
  replaceVertexProperties(0, `txn${txnId}`, graph, setGraph, existingTxnValue, false);
}
