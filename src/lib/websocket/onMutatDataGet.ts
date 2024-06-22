import { batch } from "solid-js";
import type { ServerEventsDispatcher } from "~/lib/websocket/ws_events_dispatcher";

import { isObject } from "~/lib/utils";
import { updateEdgeId } from "~/lib/graph/mutate/edge";
import type { GraphInterface } from "~/lib/graph/graph";
import {
  edgeOldIdToNewIdMap,
  isAllTxnProcessed,
  ProcessStatus,
  vertexOldIdToNewIdMap,
} from "../graph/transaction";
import { updateVertexId } from "~/lib/graph/mutate/vertex";
import type { SetStoreFunction } from "solid-js/store";
import { useToast } from "~/components/Toast";

export function onMutatDataGet(
  Ws: ServerEventsDispatcher,
  graph: GraphInterface,
  setGraph: SetStoreFunction<GraphInterface>,
  d: [
    number,
    {
      [key in
        | "insert"
        | "replace"
        | "deleteVertex"
        | "insertEdge"
        | "replaceEdge"
        | "replaceEdgeStart"
        | "replaceEdgeEnd"
        | "deleteEdge"]?: any;
    }[],
  ][],
) {
  const { showErrorToast } = useToast();

  if (isObject(d) && d.ack) {
    if (Array.isArray(d.txnIds)) {
      for (const txnId of d.txnIds as number[]) {
        // what if ack is not received?
        if (graph.transactions.has(txnId))
          graph.transactions.get(txnId)!.status = ProcessStatus.AckReceived;
      }
    }
  }
  batch(() => {
    if (Array.isArray(d)) {
      for (const [txnId, txnResult] of d) {
        if (graph.transactions.has(txnId))
          graph.transactions.get(txnId)!.status = ProcessStatus.Processed;
        for (const txnObject of txnResult) {
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
      }
    }

    if (isAllTxnProcessed()) {
      vertexOldIdToNewIdMap.clear();
      edgeOldIdToNewIdMap.clear();
    } else {
      // commitTransaction(Ws);
    }
  });
}
