import type { Store } from "solid-js/store";

import { klona } from "klona";

import type { GraphInterface, TransactionDetail } from "../../graph";

import { getDefaultTxnValue } from "./getDefaultTxnValue";

export function getExistingOrDefaultTxnValue(
  txnId: number,
  graph: Store<GraphInterface>,
) {
  if (!txnId) {
    return getDefaultTxnValue();
  }
  const txnVertex = graph.vertexes[`txn${txnId}`];
  // klona is performance heavy
  return txnVertex
    ? (klona(txnVertex.P) as TransactionDetail)
    : getDefaultTxnValue();
}
