import type { Store } from "solid-js/store";

import type { GraphInterface } from "../graph";

import { getExistingOrDefaultTxnValue } from "./getExistingOrDefaultTxnValue";

export function undoAllowed(txnId: number, graph: Store<GraphInterface>): boolean {
  if (!txnId || !graph.transactions.has(txnId)) return false;

  const txnValue = getExistingOrDefaultTxnValue(txnId, graph);
  if (txnValue.steps.length <= 1) return false;

  const activeUndoIndex = txnValue.activeUndoIndex ?? txnValue.steps.length - 1;
  return activeUndoIndex > 0;
}

export function undo(txnId: number, graph: Store<GraphInterface>) {
  if (!undoAllowed(txnId, graph)) return;

  const txnValue = getExistingOrDefaultTxnValue(txnId, graph);
  const activeUndoIndex = txnValue.activeUndoIndex ?? txnValue.steps.length - 1;

  const nearestLowestIndex = txnValue.undoStepIndexes
    .slice()
    .reverse()
    .find(index => index < activeUndoIndex);

  const newUndoIndex = nearestLowestIndex !== undefined ? nearestLowestIndex : activeUndoIndex - 1;
  if (nearestLowestIndex === undefined) {
    // Commented out code for slicing steps and revertSteps
    // txnValue.steps = txnValue.steps.slice(0, newUndoPoint + 1);
    // txnValue.revertSteps = txnValue.revertSteps.slice(0, newUndoPoint + 1);
  }

  txnValue.steps.slice(newUndoIndex + 1, activeUndoIndex + 1).reverse().forEach((txn) => txn.revert());
  txnValue.activeUndoIndex = newUndoIndex;

  graph.transactions.set(txnId, txnValue);
}
