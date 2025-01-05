import { createStore, SetStoreFunction } from "solid-js/store";
import type { GraphInterface } from "../graph";
import { addNewVertex } from "../mutate/vertex";
import { getDefaultTxnValue } from "./getDefaultTxnValue";
import { mergeVertexProperties } from "../mutate/vertex";

export function generateNewTxnId(graph: GraphInterface, setGraph: SetStoreFunction<GraphInterface>): number {
  const globalStoreId = "globalStoreId";
  const txnId = graph.vertexes[globalStoreId].P.txnId_ + 1;

  mergeVertexProperties(0, globalStoreId, graph, setGraph, { txnId_: txnId });

  addNewVertex(0, {
    id: `txn${txnId}`,
    L: ["Transaction"],
    P: {
      ...getDefaultTxnValue(),
      undoStepIndexes: [0]
    },
    IN: {},
    OUT: {}
  }, graph, setGraph);

  return txnId;
}
