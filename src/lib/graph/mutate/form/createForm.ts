import type { SetStoreFunction, Store } from "solid-js/store";

import type { GraphInterface, Vertex } from "~/lib/graph/graph";

import { addNewVertex, newVertex } from "~/lib/graph/mutate/core/vertex";

import { commitTxn } from "../../transaction/core/commitTxn";
import { generateNewTxnId } from "../../transaction/core/generateNewTxnId";
import { generateNewVertexId } from "../../transaction/core/generateNewVertexId";

export function createFormVertex(
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
  txnId: number,
  label: string,
  properties?: {
    [key: string]: any;
  },
): {
  error: string;
  vertex?: Vertex;
} {
  if (!label) {
    return { error: "Label not found" };
  }

  const isRealTime = false;
  if (isRealTime) {
    txnId = generateNewTxnId(graph, setGraph);
  }
  const newVertexObj = newVertex(
    generateNewVertexId(graph, setGraph),
    [label],
    properties || {},
  );
  // TODO: Do Create Transformation for the vertex
  const addNewVertexResult = addNewVertex(txnId, newVertexObj, graph, setGraph);
  if (addNewVertexResult.error) {
    return addNewVertexResult;
  }
  if (isRealTime) {
    commitTxn(txnId, graph);
  }
  const vertex = graph.vertexes[newVertexObj.id];
  return {
    error: "",
    vertex: vertex,
  };
}
