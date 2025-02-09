import type { SetStoreFunction } from "solid-js/store";

import type { GraphInterface } from "../graph";

import { addNewVertex } from "../mutate/vertex";
import { mergeVertexProperties } from "../mutate/vertex";
import { getDefaultTxnValue } from "./getDefaultTxnValue";

export function generateNewTxnId(
  graph: GraphInterface,
  setGraph: SetStoreFunction<GraphInterface>,
): number {
  const globalStoreId = "globalStoreId";
  const txnId = graph.vertexes[globalStoreId].P.txnId_ + 1;

  mergeVertexProperties(0, globalStoreId, graph, setGraph, { txnId_: txnId });

  addNewVertex(
    0,
    {
      id: `txn${txnId}`,
      IN: {},
      L: ["Transaction"],
      OUT: {},
      P: {
        ...getDefaultTxnValue(),
        undoStepIndexes: [0],
      },
    },
    graph,
    setGraph,
  );

  return txnId;
}
