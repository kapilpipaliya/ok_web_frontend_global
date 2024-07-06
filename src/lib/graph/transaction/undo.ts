import type { Store } from "solid-js/store";

import type { GraphInterface } from "../graph";

import { getExistingOrDefaultTxnValue } from "./getExistingOrDefaultTxnValue";


export function undo(txnId: number, graph: Store<GraphInterface>) {
  if (!txnId || !graph.transactions.has(txnId)) return;
  const existingTxnValue = getExistingOrDefaultTxnValue(txnId, graph);
  if (existingTxnValue.steps.length <= 1) return;
  const undoPointIndex = existingTxnValue.undoPoints.findIndex((point) => point === existingTxnValue.undoStep);
  let newUndoPoint = 0;
  if (undoPointIndex !== -1 && undoPointIndex > 0) {
    newUndoPoint = existingTxnValue.undoPoints[undoPointIndex - 1];


    // existingTxnValue.steps = existingTxnValue.steps.slice(0, newUndoPoint + 1);
    // existingTxnValue.revertSteps = existingTxnValue.revertSteps.slice(0, newUndoPoint + 1);
  } else {
    newUndoPoint = existingTxnValue.undoStep - 1;
  }

  existingTxnValue.steps.slice(newUndoPoint + 1, existingTxnValue.undoStep + 1).forEach((txn) => txn.revert());
  existingTxnValue.undoStep = newUndoPoint;
  // existingTxnValue.revertSteps.reverse().forEach((txn) => txn.redo());
}
