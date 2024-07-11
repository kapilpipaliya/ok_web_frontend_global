import type { Store } from "solid-js/store";

import type { GraphInterface } from "../graph";

import { ProcessStatus } from "./TransactionType";

export function isAllTxnProcessed(graph: Store<GraphInterface>) {
  let allTxnProcessed = true;
  for (const [_txnId, value] of graph.transactions.entries()) {
    if (
      value.status !== ProcessStatus.Processed &&
      value.status !== ProcessStatus.Unset
    ) {
      allTxnProcessed = false;
      break;
    }
  }
  return allTxnProcessed;
}
