import type { Store } from "solid-js/store";

import type { GraphInterface } from "~/lib/graph/GraphContext";

import { commitTxn } from "../core/commitTxn";

export function isDisabledTxn(
  txnId: number,
  graph: Store<GraphInterface>,
): boolean {
  if (!txnId) {
    return true;
  }
  const txnVertex = graph.vertexes[`txn${txnId}`];
  if (!txnVertex) {
    return true;
  }
  return commitTxn(txnId, graph) === undefined;
}
