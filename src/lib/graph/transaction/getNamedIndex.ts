import type { Store } from "solid-js/store";

import type { GraphInterface } from "../graph";

export function getNamedIndex(
  txnId: number,
  key: string,
  graph: Store<GraphInterface>,
): number | undefined {
  if (!txnId) {
    return;
  }
  const txnVertex = graph.vertexes[`txn${txnId}`];
  if (!txnVertex) {
    return;
  }
  return txnVertex.P.namedUndoStepIndexes?.[key];
}
