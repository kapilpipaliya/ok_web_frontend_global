import type { Store } from "solid-js/store";

import type { GraphInterface } from "../graph";

import { getExistingOrDefaultTxnValue } from "./getExistingOrDefaultTxnValue";

export function redoAllowed(
  txnId: number,
  graph: Store<GraphInterface>,
): boolean {
  if (!txnId || !graph.transactions.has(txnId)) return false;

  const txnValue = getExistingOrDefaultTxnValue(txnId, graph);
  const activeUndoIndex = txnValue.activeUndoIndex ?? txnValue.steps.length - 1;

  return activeUndoIndex < txnValue.steps.length - 1;
}

export function redo(txnId: number, graph: Store<GraphInterface>) {
  if (!redoAllowed(txnId, graph)) return;

  const txnValue = getExistingOrDefaultTxnValue(txnId, graph);
  const activeUndoIndex = txnValue.activeUndoIndex ?? txnValue.steps.length - 1;

  const nextUndoIndex = txnValue.undoStepIndexes.find(
    (index) => index > activeUndoIndex,
  );
  if (nextUndoIndex !== undefined) {
    txnValue.activeUndoIndex = nextUndoIndex;
    txnValue.steps
      .slice(activeUndoIndex + 1, nextUndoIndex + 1)
      .forEach((step) => {
        if (step.redo) {
          step.redo();
        }
      });
  }

  graph.transactions.set(txnId, txnValue);
}
