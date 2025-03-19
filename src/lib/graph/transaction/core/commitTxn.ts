import type { Store } from "solid-js/store";

import { klona } from "klona";

import type { MutationArgs } from "~/cypher/types/MutationArgs";
import type { GraphInterface } from "~/lib/graph/GraphContext";

import { removeUndefinedProperties } from "~/lib/data_structure/removeUndefinedProperties";

import type { Edge, Vertex } from "../../graph";
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
      // Merge steps operating on the same entity before returning
      const allSteps = [...reverseStepsToCommit, ...stepsToCommit];
      const mergedSteps = mergeStepsForSameEntities(allSteps);

      mutationArgs.transactions = mergedSteps;
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

// Helper function to merge steps that operate on the same entity
function mergeStepsForSameEntities(steps: any[]): any[] {
  const seenEntityIds = new Set<string>();
  const seenEdgeIds = new Set<string>();
  const edgesToDelete = new Set<string>();
  const result: any[] = [];

  // First pass: process all steps
  for (const step of steps) {
    // Handle merge operations
    if (step.merge) {
      const entityId = step.merge.id;

      // Check if we've seen this entity before
      const existingIndex = result.findIndex(
        (s) => s.merge && s.merge.id === entityId,
      );

      if (existingIndex === -1) {
        // First occurrence - add to result
        result.push(step);
        seenEntityIds.add(entityId);
      } else {
        // Merge with existing step
        const existingStep = result[existingIndex];
        result[existingIndex] = {
          ...existingStep,
          merge: {
            ...existingStep.merge,
            P: {
              ...(existingStep.merge.P || {}),
              ...(step.merge.P || {}),
            },
          },
        };
      }
    }
    // Handle insertEdge operations
    else if (step.insertEdge) {
      const edgeId = step.insertEdge.id;
      result.push(step);
      seenEdgeIds.add(edgeId);
    }
    // Handle deleteEdge operations
    else if (step.deleteEdge) {
      const edgeId = step.deleteEdge.id;
      edgesToDelete.add(edgeId);

      // Remove any previous operations for this edge ID
      const filteredResult = result.filter(
        (s) =>
          !(s.insertEdge && s.insertEdge.id === edgeId) &&
          !(s.replaceEdge && s.replaceEdge.id === edgeId) &&
          !(s.replaceEdgeStart && s.replaceEdgeStart.id === edgeId) &&
          !(s.replaceEdgeEnd && s.replaceEdgeEnd.id === edgeId),
      );

      result.length = 0;
      result.push(...filteredResult);

      // Only add the delete operation if the edge wasn't just inserted in this transaction
      const wasInserted = seenEdgeIds.has(edgeId);
      if (!wasInserted) {
        result.push(step);
      }
      // Otherwise, if the edge was just inserted in this transaction,
      // we can omit both the insert and delete operations
    }
    // Handle edge modifications (replaceEdge, replaceEdgeStart, replaceEdgeEnd)
    else if (step.replaceEdge || step.replaceEdgeStart || step.replaceEdgeEnd) {
      const operation =
        step.replaceEdge || step.replaceEdgeStart || step.replaceEdgeEnd;
      const edgeId = operation.id;

      // this will not happen, but lets keep it here for now.
      if (edgesToDelete.has(edgeId)) {
        // This edge is going to be deleted, so ignore modifications
        continue;
      }

      // Check if we've seen this edge before
      const existingIndex = result.findIndex(
        (s) =>
          (s.insertEdge && s.insertEdge.id === edgeId) ||
          (s.replaceEdge && s.replaceEdge.id === edgeId) ||
          (s.replaceEdgeStart && s.replaceEdgeStart.id === edgeId) ||
          (s.replaceEdgeEnd && s.replaceEdgeEnd.id === edgeId),
      );

      if (existingIndex === -1) {
        // First occurrence - add to result
        result.push(step);
      } else {
        // Update based on which operation this is
        if (step.replaceEdge) {
          result[existingIndex].P = step.replaceEdge.P;
          // assuming that insert vertex is done before insert edge.
        } else if (step.replaceEdgeStart) {
          result[existingIndex].S = step.replaceEdgeStart.S;
        } else if (step.replaceEdgeEnd) {
          result[existingIndex].E = step.replaceEdgeEnd.E;
        }
      }
    }
    // All other operations (not merge or edge related)
    else {
      // Non-merge, non-edge step - add as is
      result.push(step);
    }
  }

  return result;
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
