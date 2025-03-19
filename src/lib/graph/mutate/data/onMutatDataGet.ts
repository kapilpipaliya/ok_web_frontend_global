import type { SetStoreFunction } from "solid-js/store";

import { batch } from "solid-js";

import type { MutationResult } from "~/cypher/types/MutationArgs";
import type { GraphInterface } from "~/lib/graph/GraphContext";

import { useToast } from "~/components/styled/Toast";
import { updateEdgeId } from "~/lib/graph/mutate/core/edge";
import {
  mergeVertexProperties,
  updateVertexId,
} from "~/lib/graph/mutate/core/vertex";

export function onMutatDataGet(
  graph: GraphInterface,
  setGraph: SetStoreFunction<GraphInterface>,
  d: MutationResult,
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
      mergeVertexProperties(0, "globalStoreId", graph, setGraph, {vertexOldIdToNewIdMap: []})
      mergeVertexProperties(0, "globalStoreId", graph, setGraph, {edgeOldIdToNewIdMap: []})
    } else {
      // commitTxn(txnId, graph);
    }*/
  });
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

function handleInsertEdge(
  oldId: string,
  newId: string,
  graph: GraphInterface,
  setGraph: SetStoreFunction<GraphInterface>,
) {
  mergeVertexProperties(0, "edgeOldIdToNewIdMap", graph, setGraph, {
    [oldId]: newId,
  });
  updateEdgeId(oldId, newId, graph, setGraph);
}

function handleInsertVertex(
  oldId: string,
  newId: string,
  graph: GraphInterface,
  setGraph: SetStoreFunction<GraphInterface>,
) {
  mergeVertexProperties(0, "vertexOldIdToNewIdMap", graph, setGraph, {
    [oldId]: newId,
  });
  updateVertexId(oldId, newId, graph, setGraph);
}
