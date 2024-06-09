import { batch } from "solid-js";
import type { ServerEventsDispatcher } from "~/lib/websocket/ws_events_dispatcher";

import { isObject } from "~/lib/utils";
import { deleteEdge, updateEdgeId } from "~/lib/graph/mutate/edge";
import type { EdgeMap, GraphInterface, Id, VertexMap } from "~/lib/graph/graph";
import {
  edgeOldIdToNewIdMap,
  isAllTxnProcessed,
  ProcessStatus,
  transactions,
  vertexOldIdToNewIdMap,
} from "../graph/transaction";
import { deleteVertex, updateVertexId } from "~/lib/graph/mutate/vertex";
import type { SetStoreFunction } from "solid-js/store";
import { useToast } from "~/components/Toast";

export function setGraphData(
  graph: GraphInterface,
  setGraph: SetStoreFunction<GraphInterface>,
  args: {
    timestamp?: number;
    vertexes: VertexMap;
    vertexLabelIdMap?: { [key: string]: Id[] };
    edges: EdgeMap;
    deleted_vertexes?: string[];
    deleted_edges?: string[];
  },
) {
  batch(() => {
    for (const vertexId in args.vertexes) {
      setGraph("vertexes", vertexId, (prev) => {
        if (prev) {
          const IN = { ...prev.IN, ...args.vertexes[vertexId].IN };
          const OUT = { ...prev.OUT, ...args.vertexes[vertexId].OUT };
          return { ...args.vertexes[vertexId], IN, OUT };
        }
        return args.vertexes[vertexId];
      });

      for (const label of args.vertexes[vertexId].L) {
        setGraph("vertexLabelIdMap", label, (vertexIds) => {
          return Array.isArray(vertexIds)
            ? [...new Set([...vertexIds, args.vertexes[vertexId].id])]
            : [args.vertexes[vertexId].id];
        });
      }
    }

    for (const edgeId in args.edges) {
      setGraph("edges", edgeId, args.edges[edgeId]);
    }

    for (const edgeId in args.edges) {
      const edge = args.edges[edgeId];

      if (graph.vertexes[edge.S]) {
        setGraph("vertexes", edge.S, "OUT", edge.T, (out_edges) =>
          Array.isArray(out_edges)
            ? [...new Set([...out_edges, edge.id])]
            : [edge.id],
        );
      }

      if (graph.vertexes[edge.E]) {
        setGraph("vertexes", edge.E, "IN", edge.T, (in_edges) =>
          Array.isArray(in_edges)
            ? [...new Set([...in_edges, edge.id])]
            : [edge.id],
        );
      }
    }
    // timeTaken = Date.now() - start;
    // console.log("Total time taken : " + timeTaken + " milliseconds");
    for (const edgeId of args.deleted_edges || []) {
      deleteEdge(0, Number.parseInt(edgeId), graph, setGraph);
    }
    for (const vertexId of args.deleted_vertexes || []) {
      deleteVertex(0, Number.parseInt(vertexId), graph, setGraph);
    }
  });
}
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
        if (transactions.has(txnId))
          transactions.get(txnId)!.status = ProcessStatus.AckReceived;
      }
    }
  }
  batch(() => {
    if (Array.isArray(d)) {
      for (const [txnId, txnResult] of d) {
        if (transactions.has(txnId))
          transactions.get(txnId)!.status = ProcessStatus.Processed;
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
