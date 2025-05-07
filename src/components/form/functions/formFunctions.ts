import {
  addNewVertex,
  deleteVertex,
  mergeVertexProperties,
} from "~/lib/graph/mutate/core/vertex";
import { createFormVertex } from "~/lib/graph/mutate/form/createForm";
import { revertTransaction } from "~/lib/graph/transaction/revert/revertTransaction";
import { generateNewTxnId } from "~/lib/graph/transaction/core/generateNewTxnId";
import type { Vertex } from "~/lib/graph/graph";
import type { GraphInterface, useGraph } from "~/lib/graph/GraphContext";
import type { FormStoreObject } from "../context/FormContext";

export function deleteTxnIdAndCreateNew(
  txnId: number,
  formId: string,
  graph: GraphInterface,
  setGraph: ReturnType<typeof useGraph>[1],
) {
  // Delete existing transaction
  revertTransaction(txnId, graph, setGraph);
  // Generate and return a new transaction ID
  const newTxnId = generateNewTxnId(graph, setGraph);
  mergeVertexProperties<FormStoreObject>(0, formId, graph, setGraph, {
    txnId: newTxnId,
  });
  return newTxnId;
}

export function ensureData(
  dataId: string | undefined,
  formId: string,
  formVertex: () => Vertex<FormStoreObject> | undefined,
  graph: GraphInterface,
  setGraph: ReturnType<typeof useGraph>[1],
) {
  // If data vertex exists, return its ID
  if (dataId) {
    return dataId;
  }

  // Create a new form vertex
  const metaVertex = () => graph.vertexes[formVertex()?.P.formMetaId || ""];
  const metaKey = metaVertex()?.P.key;
  if (!metaKey) {
    console.error("Cannot recreate data ID: No meta key found");
    return null;
  }

  const txnId = formVertex()?.P.txnId;
  if (!txnId) {
    console.error("Cannot recreate data ID: No transaction ID found");
    return null;
  }

  const createResult = createFormVertex(
    graph,
    setGraph,
    txnId,
    metaKey,
    {}, // Empty initial properties
  );

  if (createResult.error) {
    console.error("Error creating new data vertex:", createResult.error);
    return null;
  }

  if (createResult.vertex) {
    mergeVertexProperties(0, formId, graph, setGraph, {
      formDataId: createResult.vertex.id,
    });
  }

  // Return the new vertex ID
  return createResult.vertex?.id;
}

export function removeTxnIdAndCreateNew(
  txnId: number,
  formId: string,
  graph: GraphInterface,
  setGraph: ReturnType<typeof useGraph>[1],
) {
  deleteVertex(0, `txn${txnId}`, graph, setGraph);
  const newTxnId = generateNewTxnId(graph, setGraph);
  mergeVertexProperties<FormStoreObject>(0, formId, graph, setGraph, {
    txnId: newTxnId,
  });
  return newTxnId;
}

export function setError(
  errorVertexId: string,
  errorKey: string,
  error: string | undefined,
  graph: GraphInterface,
  setGraph: ReturnType<typeof useGraph>[1],
) {
  if (graph.vertexes[errorVertexId]) {
    mergeVertexProperties(0, errorVertexId, graph, setGraph, {
      [errorKey]: error || "",
    });
  } else {
    addNewVertex(
      0,
      {
        id: errorVertexId,
        IN: {},
        L: ["Error"],
        OUT: {},
        P: {
          [errorKey]: error || "",
        },
      },
      graph,
      setGraph,
    );
  }
}
