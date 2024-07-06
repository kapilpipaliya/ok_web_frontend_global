import type { Store } from "solid-js/store";

import type { GraphInterface } from "../graph";

import { edgeOldIdToNewIdMap, vertexOldIdToNewIdMap } from "./TransactionType";
import { getTransactionData } from "./getTransactionData";

// Bug: if commitTxn is called many times it is sending event many times.
// TODO: currently we can only run this function once.
// we need to set seperate txnId once commited. Fix this.

export function commitTxn(txnId: number, graph: Store<GraphInterface>) {
  const existingTxnValue = getTransactionData(txnId, graph);
  const submittedStep = graph.transactions.get(txnId)?.submittedStep ?? 0;
  const startFromNextStep = submittedStep === 0 ? 0 : submittedStep + 1;
  const stepsToCommit = existingTxnValue.slice(startFromNextStep);
  if (stepsToCommit.length) {
    const data = {
      edgeIdMap: [...edgeOldIdToNewIdMap],
      transactions: stepsToCommit,
      txnId: txnId,
      vertexIdMap: [...vertexOldIdToNewIdMap],
    };
    return data;
  }
}
