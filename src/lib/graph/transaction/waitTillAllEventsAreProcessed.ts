import type { Store } from "solid-js/store";

import type { GraphInterface } from "../graph";

import { edgeOldIdToNewIdMap, vertexOldIdToNewIdMap } from "./TransactionType";
import { isAllTxnProcessed } from "./isAllTxnProcessed";


export async function waitTillAllEventsAreProcessed(graph: Store<GraphInterface>) {
  if (isAllTxnProcessed(graph)) return true;
  return await new Promise((resolve, reject) => {
    const checkAllTxnCompleted = () => {
      const checkTxnCompletedTimeout = setTimeout(() => {
        if (isAllTxnProcessed(graph)) {
          vertexOldIdToNewIdMap.clear();
          edgeOldIdToNewIdMap.clear();
          resolve(true);
        } else {
          checkAllTxnCompleted();
        }
        clearTimeout(checkTxnCompletedTimeout);
      }, 120);
    };
    checkAllTxnCompleted();
  });
}
