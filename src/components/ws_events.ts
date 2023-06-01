import { batch, useContext } from "solid-js";
import { WsContext } from "./ws_events_dispatcher";
import { G } from "@mobily/ts-belt";
import {
 commitTransaction,
 Edge,
 edgeOldIdToNewIdMap,
 ProcessStatus,
 setGraph,
 transactions,
 Vertex,
 vertexOldIdToNewIdMap
} from "../lib/graph";
import {
 addNewVertex, addNewVertexUnSafe,
 deleteVertex,
 newVertex,
 updateVertexId
} from "../lib/Vertex";
import {
 addNewEdge,
 addNewEdgeUnSafe,
 deleteEdge,
 newEdge,
 updateEdgeId
} from "../lib/Edge";

export const syncEvent = () => {
 const { Ws } = useContext(WsContext);
 Ws.bind(
  ["post", "mutate", 0],
  (
   d: [
    number,
    {
     [key in | "insert"
     | "replace"
     | "deleteVertex"
     | "insertEdge"
     | "replaceEdge"
     | "replaceEdgeStart"
     | "replaceEdgeEnd"
     | "deleteEdge"]?: any;
    }[],
   ][]
  ) => {
   if (G.isObject(d) && d.ack) {
    if (Array.isArray(d.txnIds)) {
     for (const txnId of d.txnIds as number[]) {
      // what if ack is not received?
      if (transactions.has(txnId)) transactions.get(txnId)!.status = ProcessStatus.AckReceived;
     }
    }
   }
   if (Array.isArray(d)) {
    for (const [txnId, txnResult] of d) {
     if (transactions.has(txnId)) transactions.get(txnId)!.status = ProcessStatus.Processed;
     for (const txnObject of txnResult) {
      if (txnObject.insert) {
       vertexOldIdToNewIdMap.set(txnObject.insert[0], txnObject.insert[1]);
       updateVertexId(txnObject.insert[0], txnObject.insert[1]);
      }
      if (txnObject.insertEdge) {
       edgeOldIdToNewIdMap.set(txnObject.insertEdge[0], txnObject.insertEdge[1]);
       updateEdgeId(txnObject.insertEdge[0], txnObject.insertEdge[1]);
      }
      if (txnObject.replace) {
       // TODO: handle on backend
       // replaceVertexProperties(0, txnObject.insert[0], txnObject.insert[1]);
      }
      if (txnObject.deleteVertex) {
       if (txnObject.deleteVertex.error) {
        alert(txnObject.deleteVertex.message);
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
   let allTxnProcessed = true;
   for (const [_txnId, value] of transactions.entries()) {
    if (value.status !== ProcessStatus.Processed) {
     allTxnProcessed = false;
     break;
    }
   }
   if (allTxnProcessed) {
    vertexOldIdToNewIdMap.clear();
    edgeOldIdToNewIdMap.clear();
   } else commitTransaction(Ws);
  }
 );

 const setGraphData = (args: {
  timestamp: number;
  vertexes: Vertex[];
  edges: Edge[];
  deleted_vertexes: string[];
  deleted_edges: string[];
 }) => {
  batch(() => {
   if (args.timestamp) setGraph("lastSyncedTime", args.timestamp);
   for (const v of args.vertexes || []) {
    addNewVertexUnSafe(v);
   }
   for (const e of args.edges || []) {
    addNewEdgeUnSafe(e);
   }
   for (const edgeId of args.deleted_edges || []) {
    deleteEdge(0, parseInt(edgeId));
   }
   for (const vertexId of args.deleted_vertexes || []) {
    deleteVertex(0, parseInt(vertexId));
   }
   setGraph("initialSynced", true);
  });
 };
 Ws.bind(["get", "sync", 0], setGraphData);
};