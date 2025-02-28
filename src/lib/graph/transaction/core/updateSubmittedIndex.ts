import type { SetStoreFunction, Store } from "solid-js/store";

import type { GraphInterface } from "../../graph";

import { replaceVertexProperties } from "../../mutate/core/vertex";
import { getExistingOrDefaultTxnValue } from "../value/getExistingOrDefaultTxnValue";

export function updateSubmittedIndex(
  txnId: number,
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
) {
  if (!txnId) {
    return;
  }
  const existingTxnValue = getExistingOrDefaultTxnValue(txnId, graph);
  existingTxnValue.submittedIndex = existingTxnValue.activeUndoIndex;
  existingTxnValue.revertSteps = [];
  replaceVertexProperties(0, `txn${txnId}`, graph, setGraph, existingTxnValue, {
    cloneProperties: false,
  });
}
