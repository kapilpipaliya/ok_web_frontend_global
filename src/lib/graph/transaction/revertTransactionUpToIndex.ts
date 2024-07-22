import type { Store } from "solid-js/store";

import type { GraphInterface } from "../graph";

import { undo } from "./undo";

export function revertTransactionUpToIndex(
  txnId: number,
  txnIndex: number,
  graph: Store<GraphInterface>,
) {
  undo(txnId, graph, txnIndex, true);
}
