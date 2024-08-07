import type { SetStoreFunction, Store } from "solid-js/store";

import { batch } from "solid-js";

import type { GraphInterface, Vertex } from "~/lib/graph/graph";

import { deleteEdge } from "~/lib/graph/mutate/edge";
import { deleteVertex } from "~/lib/graph/mutate/vertex";

import { commitTxn } from "../transaction/commitTxn";

export function deleteRow(
  vertex: Vertex,
  isRealTime: boolean,
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
  txnId: number,
) {
  batch(() => {
    if (isRealTime) {
      txnId = graph.newTxnId;
    }
    // delete all vertex in edges
    const inEdges = vertex.IN;
    for (const type in inEdges) {
      for (const edgeId of inEdges[type]) {
        const deleteEdgeResult = deleteEdge(txnId, edgeId, graph, setGraph);
        if (deleteEdgeResult?.error) {
          alert(deleteEdgeResult.error.toString());
        }
      }
    }
    // delete all outEdges of vertex
    const outEdge = vertex.OUT;
    for (const type in outEdge) {
      for (const edgeId of outEdge[type]) {
        const deleteEdgeResult = deleteEdge(
          type === "AttrInst" ? 0 : txnId,
          edgeId,
          graph,
          setGraph,
        );
        if (deleteEdgeResult?.error) {
          alert(deleteEdgeResult.error.toString());
        }
      }
    }

    // delete vertex:
    const deleteResult = deleteVertex(txnId, vertex.id, graph, setGraph);
    if (deleteResult.error) {
      alert(deleteResult.error.toString());
    }
    if (isRealTime) {
      commitTxn(txnId, graph);
    }
  });
}
