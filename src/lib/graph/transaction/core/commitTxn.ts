import type { Store } from "solid-js/store";

import { klona } from "klona";

import type { MutationArgs } from "~/cypher/types/MutationArgs";

import { removeUndefinedProperties } from "~/lib/data_structure/removeUndefinedProperties";

import type { Edge, GraphInterface, Vertex } from "../../graph";
import type { TransactionValue } from "../types/TransactionType";

import {
  getEdgeOldIdToNewIdMap,
  getVertexOldIdToNewIdMap,
} from "../../get/sync/store/getGlobalStore";
import { updateEdgeIdsToNew } from "../../mutate/core/edge";
import { updateVertexIdsToNew } from "../../mutate/core/vertex";
import { getLastTxnIndex } from "../value/getLastTxnIndex";

export function commitTxn(
  txnId: number,
  graph: Store<GraphInterface>,
): MutationArgs | undefined {
  const validationError = validateTransaction(txnId, graph);
  if (validationError) {
    console.error("Transaction validation failed:", validationError);
    return;
  }

  const txnVertex = graph.vertexes[`txn${txnId}`];
  const submittedIndex = txnVertex.P.submittedIndex ?? -1;
  const activeUndoIndex =
    txnVertex.P.activeUndoIndex ?? getLastTxnIndex(txnId, graph);

  if (submittedIndex === activeUndoIndex) {
    return;
  }

  try {
    let revertSteps: TransactionValue[] = [];
    let steps: TransactionValue[];

    if (activeUndoIndex < submittedIndex) {
      const removedSteps = txnVertex.P.steps.slice(
        activeUndoIndex + 1,
        submittedIndex + 1,
      );
      revertSteps = [...removedSteps, ...txnVertex.P.revertSteps];
      steps = [];
    } else {
      const startFromNextStep = submittedIndex === 0 ? 0 : submittedIndex + 1;
      steps = txnVertex.P.steps.slice(startFromNextStep, activeUndoIndex + 1);
      revertSteps = txnVertex.P.revertSteps || [];
    }

    // Update transaction status
    // txnVertex.P.status = 'committed';
    // txnVertex.P.timestamp = Date.now();

    // Get ID maps
    const vertexIdMap = getVertexOldIdToNewIdMap(graph);
    const edgeIdMap = getEdgeOldIdToNewIdMap(graph);

    // Create mutation args with proper typing
    const mutationArgs: MutationArgs = {
      edgeIdMap: Object.entries(edgeIdMap),
      transactions: [],
      txnId,
      vertexIdMap: Object.entries(vertexIdMap),
    };

    // Process revert steps
    const reverseStepsToCommit = revertSteps.reverse().map((txnDetail) => {
      return removeUndefinedProperties({
        deleteEdge: txnDetail.insertEdge
          ? updateEdgeIdsToNew(klona(txnDetail.data as Edge), graph)
          : undefined,
        deleteVertex: txnDetail.insert
          ? updateVertexIdsToNew(klona(txnDetail.data as Vertex), graph, true)
          : undefined,
        insertEdge: txnDetail.deleteEdge
          ? updateEdgeIdsToNew(klona(txnDetail.data as Edge), graph)
          : undefined,
        insertVertex: txnDetail.deleteVertex
          ? updateVertexIdsToNew(klona(txnDetail.data as Vertex), graph, true)
          : undefined,
        // TODO: Below Four are not correctly implemented yet
        merge: txnDetail.merge
          ? updateVertexIdsToNew(klona(txnDetail.data as Vertex), graph, true)
          : undefined,
        replace: txnDetail.replace
          ? updateVertexIdsToNew(klona(txnDetail.data as Vertex), graph, true)
          : undefined,
        replaceEdge: txnDetail.replaceEdge
          ? updateEdgeIdsToNew(klona(txnDetail.data as Edge), graph)
          : undefined,
        replaceEdgeEnd: txnDetail.replaceEdgeEnd
          ? updateEdgeIdsToNew(klona(txnDetail.data as Edge), graph)
          : undefined,
        replaceEdgeStart: txnDetail.replaceEdgeStart
          ? updateEdgeIdsToNew(klona(txnDetail.data as Edge), graph)
          : undefined,
      });
    });

    // Process forward steps
    const stepsToCommit = steps.map((txnDetail) => {
      return removeUndefinedProperties({
        deleteEdge: txnDetail.deleteEdge
          ? updateEdgeIdsToNew(klona(txnDetail.data as Edge), graph)
          : undefined,
        deleteVertex: txnDetail.deleteVertex
          ? updateVertexIdsToNew(klona(txnDetail.data as Vertex), graph, true)
          : undefined,
        insert: txnDetail.insert
          ? updateVertexIdsToNew(klona(txnDetail.data as Vertex), graph, true)
          : undefined,
        insertEdge: txnDetail.insertEdge
          ? updateEdgeIdsToNew(klona(txnDetail.data as Edge), graph)
          : undefined,
        merge: txnDetail.merge
          ? updateVertexIdsToNew(klona(txnDetail.data as Vertex), graph, true)
          : undefined,
        replace: txnDetail.replace
          ? updateVertexIdsToNew(klona(txnDetail.data as Vertex), graph, true)
          : undefined,
        replaceEdge: txnDetail.replaceEdge
          ? updateEdgeIdsToNew(klona(txnDetail.data as Edge), graph)
          : undefined,
        replaceEdgeEnd: txnDetail.replaceEdgeEnd
          ? updateEdgeIdsToNew(klona(txnDetail.data as Edge), graph)
          : undefined,
        replaceEdgeStart: txnDetail.replaceEdgeStart
          ? updateEdgeIdsToNew(klona(txnDetail.data as Edge), graph)
          : undefined,
      });
    });

    if (stepsToCommit.length || reverseStepsToCommit.length) {
      mutationArgs.transactions = [...reverseStepsToCommit, ...stepsToCommit];
      return mutationArgs;
    }
  } catch (error) {
    console.error("Error during transaction commit:", error);
    // txnVertex.P.status = 'rolled_back';
    // txnVertex.P.error = {
    //   code: 'COMMIT_ERROR',
    //   message: error instanceof Error ? error.message : 'Unknown error during commit',
    //   details: error
    // };
    return;
  }
}

function validateTransaction(
  txnId: number,
  graph: Store<GraphInterface>,
): string {
  if (!txnId) {
    return "Transaction ID is required";
  }

  const txnVertex = graph.vertexes[`txn${txnId}`];
  if (!txnVertex) {
    return `Transaction ${txnId} not found`;
  }

  return "";
}
