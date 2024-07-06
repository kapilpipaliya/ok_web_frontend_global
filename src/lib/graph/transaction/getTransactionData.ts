import type { Store } from "solid-js/store";

import type { GraphInterface } from "../graph";


export function getTransactionData(txnId: number, graph: Store<GraphInterface>) {
  if (!graph.transactions.has(txnId)) return [];
  const existingTxnValue = [...(graph.transactions.get(txnId)?.steps || [])].map(
    (txnDetail) => {
      const txnData = {
        deleteEdge: txnDetail.deleteEdge?.(),
        deleteVertex: txnDetail.deleteVertex?.(),
        insert: txnDetail.insert?.(),
        insertEdge: txnDetail.insertEdge?.(),
        merge: txnDetail.merge?.(),
        replace: txnDetail.replace?.(),
        replaceEdge: txnDetail.replaceEdge?.(),
        replaceEdgeEnd: txnDetail.replaceEdgeEnd?.(),
        replaceEdgeStart: txnDetail.replaceEdgeStart?.(),
      };
      return Object.keys(txnData).reduce((acc, key) => {
        // @ts-ignore
        if (txnData[key] !== undefined) {
          // @ts-ignore
          acc[key] = txnData[key];
        }
        return acc;
      }, {});
    }
  );
  return existingTxnValue;
}
