import type { Store } from "solid-js/store";

import { removeUndefinedProperties } from "~/lib/data_structure/removeUndefinedProperties";

import type { GraphInterface } from "../graph";
import type { TransactionValue } from "./TransactionType";

import { edgeOldIdToNewIdMap, vertexOldIdToNewIdMap } from "./TransactionType";

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
      deleteEdge: txnDetail.insertEdge ? txnDetail.insertEdge() : undefined,
      deleteVertex: txnDetail.insert ? txnDetail.insert() : undefined,
      insertEdge: txnDetail.deleteEdge ? txnDetail.deleteEdge() : undefined,
      insertVertex: txnDetail.deleteVertex
        ? txnDetail.deleteVertex()
        : undefined,
      merge: txnDetail.merge ? txnDetail.merge() : undefined,
      replace: txnDetail.replace ? txnDetail.replace() : undefined,
      replaceEdge: txnDetail.replaceEdge ? txnDetail.replaceEdge() : undefined,
      replaceEdgeEnd: txnDetail.replaceEdgeEnd
        ? txnDetail.replaceEdgeEnd()
        : undefined,
      replaceEdgeStart: txnDetail.replaceEdgeStart
        ? txnDetail.replaceEdgeStart()
        : undefined,
    });
  });

  const stepsToCommit = steps.map((txnDetail) => {
    return removeUndefinedProperties({
      deleteEdge: txnDetail.deleteEdge?.(),
      deleteVertex: txnDetail.deleteVertex?.(),
      insert: txnDetail.insert?.(),
      insertEdge: txnDetail.insertEdge?.(),
      merge: txnDetail.merge?.(),
      replace: txnDetail.replace?.(),
      replaceEdge: txnDetail.replaceEdge?.(),
      replaceEdgeEnd: txnDetail.replaceEdgeEnd?.(),
      replaceEdgeStart: txnDetail.replaceEdgeStart?.(),
    });
  });

  if (stepsToCommit.length || txnVertex.P.revertSteps.length) {
    const data = {
      edgeIdMap: [...edgeOldIdToNewIdMap],
      transactions: [...reverseStepsToCommit, ...stepsToCommit],
      txnId: txnId,
      vertexIdMap: [...vertexOldIdToNewIdMap],
    };
    return data;
  }
}
