import type { SetStoreFunction } from "solid-js/store";

import { batch } from "solid-js";

import type { GraphInterface } from "~/lib/graph/graph";

import { useToast } from "~/components/styled/Toast";
import { updateEdgeId } from "~/lib/graph/mutate/edge";
import { updateVertexId } from "~/lib/graph/mutate/vertex";

import {
  edgeOldIdToNewIdMap,
  vertexOldIdToNewIdMap,
} from "../transaction/TransactionType";

function handleInsertVertex(
  oldId: string,
  newId: string,
  graph: GraphInterface,
  setGraph: SetStoreFunction<GraphInterface>,
) {
  vertexOldIdToNewIdMap.set(oldId, newId);
  updateVertexId(oldId, newId, graph, setGraph);
}

function handleInsertEdge(
  oldId: string,
  newId: string,
  graph: GraphInterface,
  setGraph: SetStoreFunction<GraphInterface>,
) {
  edgeOldIdToNewIdMap.set(oldId, newId);
  updateEdgeId(oldId, newId, graph, setGraph);
}

function handleDeleteVertex(
  error: boolean,
  message: string,
  showErrorToast: (msg: string) => void,
) {
  if (error) {
    showErrorToast(message);
  }
}

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
    }[];
    txnId: number;
  },
) {
  const { showErrorToast } = useToast();
  batch(() => {
    for (const txnObject of d.data) {
      // Vertexes and edges are interlinked.
      // It's complicated to insert replace without error.
      // When saving Form with Select field, table is giving error.
      if (txnObject.insert) {
        handleInsertVertex(
          txnObject.insert[0],
          txnObject.insert[1],
          graph,
          setGraph,
        );
      }
      if (txnObject.insertEdge) {
        handleInsertEdge(
          txnObject.insertEdge[0],
          txnObject.insertEdge[1],
          graph,
          setGraph,
        );
      }
      if (txnObject.deleteVertex) {
        handleDeleteVertex(
          txnObject.deleteVertex.error,
          txnObject.deleteVertex.message,
          showErrorToast,
        );
      }
      // TODO: handle other cases for replace, replaceEdge, deleteEdge, replaceEdgeStart, replaceEdgeEnd
    }

    /*if (isAllTxnProcessed(graph)) {
      vertexOldIdToNewIdMap.clear();
      edgeOldIdToNewIdMap.clear();
    } else {
      // commitTxn(txnId, graph);
    }*/
  });
}
