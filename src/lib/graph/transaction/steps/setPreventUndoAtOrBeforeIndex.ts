import type { SetStoreFunction, Store } from "solid-js/store";

import type { GraphInterface } from "../../graph";

import { replaceVertexProperties } from "../../mutate/core/vertex";
import { getExistingOrDefaultTxnValue } from "../value/getExistingOrDefaultTxnValue";

export function setPreventUndoAtOrBeforeIndex(
  txnId: number,
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
) {
  if (!txnId) {
    return;
  }
  const txnValue = getExistingOrDefaultTxnValue(txnId, graph);
  txnValue.preventUndoBeforeIndex = txnValue.steps.length - 1;
  replaceVertexProperties(0, `txn${txnId}`, graph, setGraph, txnValue, {
    cloneProperties: false,
  });
}
