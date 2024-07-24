import type { Store } from "solid-js/store";

import type { GraphInterface } from "../graph";

import { getExistingOrDefaultTxnValue } from "./getExistingOrDefaultTxnValue";


export function setPreventUndoAtOrBeforeIndex(txnId: number, graph: Store<GraphInterface>) {
  const txnValue = getExistingOrDefaultTxnValue(txnId, graph);
  txnValue.preventUndoBeforeIndex = txnValue.steps.length - 1;
  graph.transactions.set(txnId, txnValue);
}
