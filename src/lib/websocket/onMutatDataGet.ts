import type { SetStoreFunction } from "solid-js/store";

import { batch } from "solid-js";

import type { GraphInterface } from "~/lib/graph/graph";

import { useToast } from "~/components/Toast";
import { updateEdgeId } from "~/lib/graph/mutate/edge";
import { updateVertexId } from "~/lib/graph/mutate/vertex";

import {
  ProcessStatus,
  edgeOldIdToNewIdMap,
  isAllTxnProcessed,
  vertexOldIdToNewIdMap,
} from "../graph/transaction";

export function onMutatDataGet(
  graph: GraphInterface,
  setGraph: SetStoreFunction<GraphInterface>,
  d: {
    data: {
      [key in
      | "deleteEdge"
      | "deleteVertex"
      | "insert"
      | "insertEdge"
      | "replace"
      | "replaceEdge"
      | "replaceEdgeEnd"
      | "replaceEdgeStart"]?: any;
    }[],
    txnId: number;
  },
) {
  const { showErrorToast } = useToast();
  batch(() => {
    if (graph.transactions.has(d.txnId))
      graph.transactions.get(d.txnId)!.status = ProcessStatus.Processed;
    for (const txnObject of d.data) {
      // Vertexes and edges are interlinked.
      // It's complicated to insert replace without error.
      // When saving Form with Select field, table is giving error.
      if (txnObject.insert) {
        vertexOldIdToNewIdMap.set(txnObject.insert[0], txnObject.insert[1]);
        updateVertexId(
          txnObject.insert[0],
          txnObject.insert[1],
          graph,
          setGraph,
        );
      }
      if (txnObject.insertEdge) {
        edgeOldIdToNewIdMap.set(
          txnObject.insertEdge[0],
          txnObject.insertEdge[1],
        );
        updateEdgeId(
          txnObject.insertEdge[0],
          txnObject.insertEdge[1],
          graph,
          setGraph,
        );
      }
      if (txnObject.replace) {
        // TODO: handle on backend
        // replaceVertexProperties(0, txnObject.insert[0], txnObject.insert[1]);
      }
      if (txnObject.deleteVertex) {
        if (txnObject.deleteVertex.error) {
          showErrorToast(txnObject.deleteVertex.message);
        }
        // TODO: handle on backend
        // deleteVertex(0, txnObject.insert[0]);
      }
      if (txnObject.replaceEdge) {
        // TODO: handle on backend
        // replaceEdgeProperties(0, txnObject.insert[0], txnObject.insert[1]);
      }
      // if(txnObject.replaceEdgeStart){
      //  replaceEdgeStart(0, txnObject.insert[0], txnObject.insert[1]);
      // }
      // if(txnObject.replaceEdgeEnd){
      //  replaceEdgeEnd(0, txnObject.insert[0], txnObject.insert[1]);
      // }
      if (txnObject.deleteEdge) {
        // TODO: handle on backend
        // deleteEdge(0, txnObject.insert[0]);
      }
    }

    if (isAllTxnProcessed(graph)) {
      vertexOldIdToNewIdMap.clear();
      edgeOldIdToNewIdMap.clear();
    } else {
      // commitTxn(txnId, graph);
    }
  });
}
