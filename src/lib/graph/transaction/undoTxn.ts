import type { SetStoreFunction, Store } from "solid-js/store";

import type { GraphInterface } from "../graph";
import type { TransactionValue } from "./TransactionType";

import {
  getEdgeOldIdToNewIdMap,
  getVertexOldIdToNewIdMap,
} from "../get/sync/getGlobalStore";
import {
  addNewEdge,
  deleteEdge,
  replaceEdgeEnd,
  replaceEdgeStart,
  updateEdgeIdsToNew,
} from "../mutate/edge";
import {
  addNewVertex,
  deleteVertex,
  mergeVertexProperties,
  replaceVertexProperties,
  updateVertexIdsToNew,
} from "../mutate/vertex";

export function undoTxn(
  txnDetail: TransactionValue,
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
) {
  const { data, id, originalData, ...actions } = txnDetail;
  for (const action in actions) {
    if (actions.hasOwnProperty(action)) {
      switch (action) {
        case "deleteEdge": {
          addNewEdge(0, updateEdgeIdsToNew(data, graph), graph, setGraph);
          break;
        }
        case "deleteVertex": {
          addNewVertex(0, updateVertexIdsToNew(data, graph), graph, setGraph);
          break;
        }
        case "insert": {
          const actualVertexId2 = getVertexOldIdToNewIdMap(graph)[id] || id;
          deleteVertex(0, actualVertexId2, graph, setGraph);
          break;
        }
        case "insertEdge": {
          const actualEdgeId2 = getEdgeOldIdToNewIdMap(graph)[id] || id;
          deleteEdge(0, actualEdgeId2, graph, setGraph);
          break;
        }
        case "merge": {
          const actualVertexId3 = getVertexOldIdToNewIdMap(graph)[id] || id;
          mergeVertexProperties(
            0,
            actualVertexId3,
            graph,
            setGraph,
            originalData,
          );
          break;
        }
        case "replace": {
          const actualVertexId2 = getVertexOldIdToNewIdMap(graph)[id] || id;
          replaceVertexProperties(
            0,
            actualVertexId2,
            graph,
            setGraph,
            originalData,
          );
          break;
        }
        case "replaceEdge": {
          const actualEdgeId3 = getEdgeOldIdToNewIdMap(graph)[id] || id;
          replaceEdgeStart(0, actualEdgeId3, graph, setGraph, originalData);
          break;
        }
        case "replaceEdgeEnd": {
          const actualEdgeId5 = getEdgeOldIdToNewIdMap(graph)[id] || id;
          replaceEdgeEnd(0, actualEdgeId5, graph, setGraph, originalData.E);
          break;
        }
        case "replaceEdgeStart": {
          const actualEdgeId4 = getEdgeOldIdToNewIdMap(graph)[id] || id;
          replaceEdgeStart(0, actualEdgeId4, graph, setGraph, originalData.S);
          break;
        }
        default: {
          console.error(`Unknown action: ${action}`);
        }
      }
    }
  }
}
