import type { SetStoreFunction, Store } from "solid-js/store";

import type { GraphInterface, Vertex } from "~/lib/graph/graph";

import { addNewVertex, newVertex } from "~/lib/graph/mutate/vertex";

import { commitTxn } from "../../transaction/commitTxn";

export function createForm(
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
  txnId: number,
  label: string,
  properties?: {
    [key: string]: any;
  },
): {
  error: boolean | string;
  vertex?: Vertex;
} {
  if (!label) {
    return { error: "Label not found" };
  }

  const isRealTime = false;
  if (isRealTime) {
    txnId = graph.newTxnId;
  }
  const newVertexObj = newVertex(graph.newVertexId, [label], properties || {});
  // TODO: Do Create Transformation for the vertex
  const addNewVertexResult = addNewVertex(txnId, newVertexObj, graph, setGraph);
  if (addNewVertexResult.error) {
    return addNewVertexResult;
  }
  if (isRealTime) { commitTxn(txnId, graph); }
  const vertex = graph.vertexes[newVertexObj.id];
  return {
    error: false,
    vertex: vertex,
  };
}
