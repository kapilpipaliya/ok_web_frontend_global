import type { SetStoreFunction, Store } from "solid-js/store";

import type { GraphInterface } from "../../graph";

import { undo } from "../history/undo";

export function revertTransactionUpToIndex(
  txnId: number,
  txnIndex: number,
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
) {
  undo(txnId, graph, setGraph, txnIndex, true);
}
