import { createStore, SetStoreFunction } from "solid-js/store";
import type { GraphInterface } from "../graph";
import { addNewVertex } from "../mutate/vertex";
import { getDefaultTxnValue } from "./getDefaultTxnValue";

export function generateNewTxnId(graph: GraphInterface, setGraph: SetStoreFunction<GraphInterface>): number {
  setGraph("txnId_", (txnId: number) => txnId + 1);
  addNewVertex(0, {
    id: `txn${graph.txnId_}`,
    L: ["Transaction"],
    P: {
      ...getDefaultTxnValue(),
      undoStepIndexes: [0]
    },
    IN: {},
    OUT: {}
  }, graph, setGraph);
  return graph.txnId_ as number;
}
