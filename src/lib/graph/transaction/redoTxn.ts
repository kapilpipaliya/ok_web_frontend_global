import { Store, SetStoreFunction } from "solid-js/store";
import { getVertexOldIdToNewIdMap, getEdgeOldIdToNewIdMap } from "../get/sync/getGlobalStore";
import type { GraphInterface } from "../graph";
import { deleteEdge, addNewEdge, updateEdgeIdsToNew, replaceEdgeProperties, replaceEdgeStart, replaceEdgeEnd } from "../mutate/edge";
import { addNewVertex, updateVertexIdsToNew, deleteVertex, replaceVertexProperties, mergeVertexProperties } from "../mutate/vertex";
import { TransactionValue } from "./TransactionType";


export function redoTxn(
  txnDetail: TransactionValue,
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>
) {

  const {  id, originalData, data, ...actions } = txnDetail;

  for (const action in actions) {
    if (actions.hasOwnProperty(action)) {
      switch (action) {
        case "insert":
          addNewVertex(0, updateVertexIdsToNew(data, graph), graph, setGraph);
          break;
        case "deleteVertex": {
          const actualVertexId2 = getVertexOldIdToNewIdMap(graph)[id] || id;
          deleteVertex(0, actualVertexId2, graph, setGraph);
          break;
        }
        case "replace": {
          const actualVertexId2 = getVertexOldIdToNewIdMap(graph)[id] || id;
          replaceVertexProperties(0, actualVertexId2, graph, setGraph, data.P);
          break;
        }
        case "merge": {
          const actualVertexId2 = getVertexOldIdToNewIdMap(graph)[id] || id;
          mergeVertexProperties(0, actualVertexId2, graph, setGraph, data.P);
          break;
        }
        case "deleteEdge": {
          const actualVertexId2 = getVertexOldIdToNewIdMap(graph)[id] || id;
          deleteEdge(0, actualVertexId2, graph, setGraph);
          break;
        }
        case "insertEdge": {
          addNewEdge(0, updateEdgeIdsToNew(data, graph), graph, setGraph);
          break;
        }
        case "replaceEdge": {
          const actualEdgeId2 = getEdgeOldIdToNewIdMap(graph)[id] || id;
          replaceEdgeProperties(0, actualEdgeId2, graph, setGraph, data.P);
          break;
        }
        case "replaceEdgeStart": {
          const actualEdgeId2 = getEdgeOldIdToNewIdMap(graph)[id] || id;
          replaceEdgeStart(0, actualEdgeId2, graph, setGraph, data.S);
          break;
        }
        case "replaceEdgeEnd": {
          const actualEdgeId2 = getEdgeOldIdToNewIdMap(graph)[id] || id;
          replaceEdgeEnd(0, actualEdgeId2, graph, setGraph, data.E);
          break;
        }
        default:
          console.error(`Unknown action: ${action}`);
      }
    }
  }
}

