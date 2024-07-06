import type { Store } from "solid-js/store";

import type { GraphInterface } from "../graph";

import { getExistingOrDefaultTxnValue } from "./getExistingOrDefaultTxnValue";


export function undo(txnId: number, graph: Store<GraphInterface>) {
  // Check if the transaction ID is valid and if the transaction exists in the graph
  if (!txnId || !graph.transactions.has(txnId)) return;
  
  // Get the existing transaction value or a default value
  const existingTxnValue = getExistingOrDefaultTxnValue(txnId, graph);
  
  // If there are no steps to undo, return
  if (existingTxnValue.steps.length <= 1) return;
  
  // Find the index of the current undo point
  const undoPointIndex = existingTxnValue.undoPoints.findIndex((point) => point === existingTxnValue.activeUndoPoint);
  let newUndoPoint = 0;
  
  // Determine the new undo point
  if (undoPointIndex !== -1 && undoPointIndex > 0) {
    newUndoPoint = existingTxnValue.undoPoints[undoPointIndex - 1];

    // Commented out code for slicing steps and revertSteps
    // existingTxnValue.steps = existingTxnValue.steps.slice(0, newUndoPoint + 1);
    // existingTxnValue.revertSteps = existingTxnValue.revertSteps.slice(0, newUndoPoint + 1);
  } else {
    newUndoPoint = existingTxnValue.activeUndoPoint - 1;
  }

  // Revert the transactions from the the current undo step to the new undo point
  existingTxnValue.steps.slice(newUndoPoint + 1, existingTxnValue.activeUndoPoint + 1).forEach((txn) => txn.revert());
  
  // Update the undo step to the new undo point
  existingTxnValue.activeUndoPoint = newUndoPoint;
  
  // Commented out code for redoing revertSteps
  // existingTxnValue.revertSteps.reverse().forEach((txn) => txn.redo());
}
