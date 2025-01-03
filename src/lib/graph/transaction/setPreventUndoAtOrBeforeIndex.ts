import type { SetStoreFunction, Store } from "solid-js/store";

import type { GraphInterface } from "../graph";

import { getExistingOrDefaultTxnValue } from "./getExistingOrDefaultTxnValue";
import { replaceVertexProperties } from "../mutate/vertex";

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
  replaceVertexProperties(0, `txn${txnId}`, graph, setGraph, txnValue, false);
}
