import { Store, SetStoreFunction } from "solid-js/store";
import { getVertexOldIdToNewIdMap, getEdgeOldIdToNewIdMap } from "../get/sync/getGlobalStore";
import type { GraphInterface } from "../graph";
import { addNewEdge, updateEdgeIdsToNew, deleteEdge, replaceEdgeStart, replaceEdgeEnd } from "../mutate/edge";
import { deleteVertex, addNewVertex, updateVertexIdsToNew, replaceVertexProperties, mergeVertexProperties } from "../mutate/vertex";
import { TransactionValue } from "./TransactionType";

export function undoTxn(
  txnDetail: TransactionValue,
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>
) {
  const { id, originalData, data, ...actions } = txnDetail;
  for (const action in actions) {
    if (actions.hasOwnProperty(action)) {
      switch (action) {
        case "insert": {
          const actualVertexId2 = getVertexOldIdToNewIdMap(graph)[id] || id;
          deleteVertex(0, actualVertexId2, graph, setGraph);
          break;
        }
        case "deleteVertex": {
          addNewVertex(0, updateVertexIdsToNew(data, graph), graph, setGraph);
          break;
        }
        case "replace": {
          const actualVertexId2 = getVertexOldIdToNewIdMap(graph)[id] || id;
          replaceVertexProperties(0, actualVertexId2, graph, setGraph, originalData);
          break;
        }
        case "merge": {
          const actualVertexId3 = getVertexOldIdToNewIdMap(graph)[id] || id;
          mergeVertexProperties(0, actualVertexId3, graph, setGraph, originalData);
          break;
        }
        case "deleteEdge": {
          addNewEdge(0, updateEdgeIdsToNew(data, graph), graph, setGraph);
          break;
        }
        case "insertEdge": {
          const actualEdgeId2 = getEdgeOldIdToNewIdMap(graph)[id] || id;
          deleteEdge(0, actualEdgeId2, graph, setGraph);
          break;
        }
        case "replaceEdge": {
          const actualEdgeId3 = getEdgeOldIdToNewIdMap(graph)[id] || id;
          replaceEdgeStart(0, actualEdgeId3, graph, setGraph, originalData);
          break;
        }
        case "replaceEdgeStart": {
          const actualEdgeId4 = getEdgeOldIdToNewIdMap(graph)[id] || id;
          replaceEdgeStart(0, actualEdgeId4, graph, setGraph, originalData.S);
          break;
        }
        case "replaceEdgeEnd": {
          const actualEdgeId5 = getEdgeOldIdToNewIdMap(graph)[id] || id;
          replaceEdgeEnd(0, actualEdgeId5, graph, setGraph, originalData.E);
          break;
        }
        default: {
          console.error(`Unknown action: ${action}`);
        }
      }
    }
  }
}
