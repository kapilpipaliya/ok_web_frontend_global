import type { Store } from "solid-js/store";

import type { GraphInterface } from "../graph";

export function getNamedIndex(
  txnId: number,
  key: string,
  graph: Store<GraphInterface>,
): number | undefined {
  if (!(txnId && graph.transactions.has(txnId))) {
    return;
  }
  const txn = graph.transactions.get(txnId)!;
  return txn.namedUndoStepIndexes[key];
}
