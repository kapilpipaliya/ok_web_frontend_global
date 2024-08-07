import type { GraphInterface } from "../graph";

export function getLastTxnIndex(txnId: number, graph: GraphInterface): number {
  const txnValue = graph.transactions.get(txnId);
  return txnValue?.steps && txnValue.steps.length > 0
    ? txnValue.steps.length - 1
    : 0;
}
