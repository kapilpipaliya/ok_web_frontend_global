import type { SetStoreFunction, Store } from "solid-js/store";

import type { GraphInterface } from "../../graph";
import type { TransactionValue } from "../types/TransactionType";

import {
  getEdgeOldIdToNewIdMap,
  getVertexOldIdToNewIdMap,
} from "../../get/sync/store/getGlobalStore";
import {
  addNewEdge,
  deleteEdge,
  replaceEdgeEnd,
  replaceEdgeProperties,
  replaceEdgeStart,
  updateEdgeIdsToNew,
} from "../../mutate/core/edge";
import {
  addNewVertex,
  deleteVertex,
  mergeVertexProperties,
  replaceVertexProperties,
  updateVertexIdsToNew,
} from "../../mutate/core/vertex";

export function redoTxn(
  txnDetail: TransactionValue,
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
) {
  const { data, id, originalData, ...actions } = txnDetail;

  for (const action in actions) {
    if (actions.hasOwnProperty(action)) {
      switch (action) {
        case "deleteEdge": {
          const actualVertexId2 = getVertexOldIdToNewIdMap(graph)[id] || id;
          deleteEdge(0, actualVertexId2, graph, setGraph);
          break;
        }
        case "deleteVertex": {
          const actualVertexId2 = getVertexOldIdToNewIdMap(graph)[id] || id;
          deleteVertex(0, actualVertexId2, graph, setGraph);
          break;
        }
        case "insert":
          addNewVertex(0, updateVertexIdsToNew(data, graph), graph, setGraph);
          break;
        case "insertEdge": {
          addNewEdge(0, updateEdgeIdsToNew(data, graph), graph, setGraph);
          break;
        }
        case "merge": {
          const actualVertexId2 = getVertexOldIdToNewIdMap(graph)[id] || id;
          mergeVertexProperties(0, actualVertexId2, graph, setGraph, data.P);
          break;
        }
        case "replace": {
          const actualVertexId2 = getVertexOldIdToNewIdMap(graph)[id] || id;
          replaceVertexProperties(0, actualVertexId2, graph, setGraph, data.P);
          break;
        }
        case "replaceEdge": {
          const actualEdgeId2 = getEdgeOldIdToNewIdMap(graph)[id] || id;
          replaceEdgeProperties(0, actualEdgeId2, graph, setGraph, data.P);
          break;
        }
        case "replaceEdgeEnd": {
          const actualEdgeId2 = getEdgeOldIdToNewIdMap(graph)[id] || id;
          replaceEdgeEnd(0, actualEdgeId2, graph, setGraph, data.E);
          break;
        }
        case "replaceEdgeStart": {
          const actualEdgeId2 = getEdgeOldIdToNewIdMap(graph)[id] || id;
          replaceEdgeStart(0, actualEdgeId2, graph, setGraph, data.S);
          break;
        }
        default:
          console.error(`Unknown action: ${action}`);
      }
    }
  }
}
