import type { SetStoreFunction, Store } from "solid-js/store";

import type { GraphInterface } from "~/lib/graph/GraphContext";

import { getExistingOrDefaultTxnValue } from "../value/getExistingOrDefaultTxnValue";
import { replaceVertexProperties } from "~/lib/graph/mutate/core/vertex/replaceVertexProperties";

export function setPreventUndoAtOrBeforeIndex(
  txnId: number,
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
) {
  if (!txnId) {
    return;
  }
  const txnValue = getExistingOrDefaultTxnValue(txnId, graph);
  txnValue.preventUndoBeforeIndex = txnValue.activeUndoIndex;
  replaceVertexProperties(0, `txn${txnId}`, graph, setGraph, txnValue, {
    cloneProperties: false,
  });
}
