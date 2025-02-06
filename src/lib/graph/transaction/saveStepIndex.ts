import type { SetStoreFunction, Store } from "solid-js/store";

import type { GraphInterface } from "../graph";

import { replaceVertexProperties } from "../mutate/vertex";
import { getExistingOrDefaultTxnValue } from "./getExistingOrDefaultTxnValue";
import { getLastTxnIndex } from "./getLastTxnIndex";

export function saveStepIndex(
  txnId: number,
  key: string,
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
) {
  if (!txnId) {
    return;
  }
  const txnValue = getExistingOrDefaultTxnValue(txnId, graph);
  txnValue.namedUndoStepIndexes[key] = getLastTxnIndex(txnId, graph);
  replaceVertexProperties(0, `txn${txnId}`, graph, setGraph, txnValue, {cloneProperties: false});
}
