import type { Store } from "solid-js/store";

import type { GraphInterface } from "../graph";

import { getDefaultTxnValue } from "./getDefaultTxnValue";

export function getExistingOrDefaultTxnValue(
  txnId: number,
  graph: Store<GraphInterface>,
) {
  return graph.transactions.has(txnId)
    ? { ...graph.transactions.get(txnId)! }
    : getDefaultTxnValue();
}
