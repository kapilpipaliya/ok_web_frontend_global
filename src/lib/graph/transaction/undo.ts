import type { Store } from "solid-js/store";

import type { GraphInterface, TransactionDetail } from "../graph";

import { getExistingOrDefaultTxnValue } from "./getExistingOrDefaultTxnValue";

export function undoAllowed(
  txnId: number,
  graph: Store<GraphInterface>,
): boolean {
  if (!txnId || !graph.transactions.has(txnId)) return false;

  const txnValue = graph.transactions.get(txnId);
  if (!txnValue) return false;
  if (txnValue.steps.length <= 1) return false;

  const activeUndoIndex = txnValue.activeUndoIndex ?? txnValue.steps.length - 1;
  const preventUndoBeforeIndex = txnValue.preventUndoBeforeIndex ?? -1;
  
  if ((txnValue.steps.length - 1) <= preventUndoBeforeIndex) return false;

  const newUndoIndex = getNewUndoIndex(txnValue, activeUndoIndex);

  if (newUndoIndex < preventUndoBeforeIndex) return false;
  
  return activeUndoIndex > 0;
}

export function undo(txnId: number, graph: Store<GraphInterface>) {
  if (!undoAllowed(txnId, graph)) return;

  const txnValue = getExistingOrDefaultTxnValue(txnId, graph);
  const activeUndoIndex = txnValue.activeUndoIndex ?? txnValue.steps.length - 1;

  const newUndoIndex = getNewUndoIndex(txnValue, activeUndoIndex);

  txnValue.steps
    .slice(newUndoIndex + 1, activeUndoIndex + 1)
    .reverse()
    .forEach((txn) => txn.revert());
  txnValue.activeUndoIndex = newUndoIndex;

  graph.transactions.set(txnId, txnValue);
}

function getNewUndoIndex(txnValue: TransactionDetail, activeUndoIndex: number) {
  const nearestLowestIndex = txnValue.undoStepIndexes
    .slice()
    .reverse()
    .find((index) => index < activeUndoIndex);

  const newUndoIndex = nearestLowestIndex !== undefined ? nearestLowestIndex : activeUndoIndex - 1;
  return newUndoIndex;
}
