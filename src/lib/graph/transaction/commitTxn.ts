import type { Store } from "solid-js/store";

import { klona } from "klona";

import { removeUndefinedProperties } from "~/lib/data_structure/removeUndefinedProperties";

import type { GraphInterface } from "../graph";
import type { TransactionValue } from "./TransactionType";

import { getEdgeOldIdToNewIdMap, getVertexOldIdToNewIdMap } from "../get/sync/getGlobalStore";
import { updateEdgeIdsToNew } from "../mutate/edge";
import { updateVertexIdsToNew } from "../mutate/vertex";

export function commitTxn(txnId: number, graph: Store<GraphInterface>) {
  if(!txnId) {
    return;
  }
  const txnVertex = graph.vertexes[`txn${txnId}`];
  if (!txnVertex) {
    return;
  }

  const submittedIndex = txnVertex.P.submittedIndex ?? -1;
  const activeUndoIndex = txnVertex.P.activeUndoIndex ?? txnVertex.P.steps.length - 1;

  if (submittedIndex === activeUndoIndex) {
    return;
  }

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

  const reverseStepsToCommit = revertSteps.reverse().map((txnDetail) => {
    return removeUndefinedProperties({
      deleteEdge: txnDetail.insertEdge ? updateEdgeIdsToNew(klona(txnDetail.data), graph) : undefined,
      deleteVertex: txnDetail.insert ? updateVertexIdsToNew(klona(txnDetail.data), graph) : undefined,
      insertEdge: txnDetail.deleteEdge ? updateEdgeIdsToNew(klona(txnDetail.data), graph) : undefined,
      insertVertex: txnDetail.deleteVertex ? updateVertexIdsToNew(klona(txnDetail.data), graph) : undefined,
      merge: txnDetail.merge ? updateVertexIdsToNew(klona(txnDetail.data), graph) : undefined,
      replace: txnDetail.replace ? updateVertexIdsToNew(klona(txnDetail.data), graph) : undefined,
      replaceEdge: txnDetail.replaceEdge ? updateEdgeIdsToNew(klona(txnDetail.data), graph) : undefined,
      replaceEdgeEnd: txnDetail.replaceEdgeEnd ? updateEdgeIdsToNew(klona(txnDetail.data), graph) : undefined,
      replaceEdgeStart: txnDetail.replaceEdgeStart ? updateEdgeIdsToNew(klona(txnDetail.data), graph) : undefined,
    });
  });

  const stepsToCommit = steps.map((txnDetail) => {
    return removeUndefinedProperties({
      deleteEdge: txnDetail.deleteEdge ? updateEdgeIdsToNew(klona(txnDetail.data), graph) : undefined,
      deleteVertex: txnDetail.deleteVertex ? updateVertexIdsToNew(klona(txnDetail.data), graph) : undefined,
      insert: txnDetail.insert ? updateVertexIdsToNew(klona(txnDetail.data), graph) : undefined,
      insertEdge: txnDetail.insertEdge ? updateEdgeIdsToNew(klona(txnDetail.data), graph) : undefined,
      merge: txnDetail.merge ? updateVertexIdsToNew(klona(txnDetail.data), graph) : undefined,
      replace: txnDetail.replace ? updateVertexIdsToNew(klona(txnDetail.data), graph) : undefined,
      replaceEdge: txnDetail.replaceEdge ? updateEdgeIdsToNew(klona(txnDetail.data), graph) : undefined,
      replaceEdgeEnd: txnDetail.replaceEdgeEnd ? updateEdgeIdsToNew(klona(txnDetail.data), graph) : undefined,
      replaceEdgeStart: txnDetail.replaceEdgeStart ? updateEdgeIdsToNew(klona(txnDetail.data), graph) : undefined,
    });
  });

  if (stepsToCommit.length || txnVertex.P.revertSteps.length) {
    const data = {
      edgeIdMap: [...Object.entries(getEdgeOldIdToNewIdMap(graph))],
      transactions: [...reverseStepsToCommit, ...stepsToCommit],
      txnId: txnId,
      vertexIdMap: [...Object.entries(getVertexOldIdToNewIdMap(graph))],
    };
    return data;
  }
}
