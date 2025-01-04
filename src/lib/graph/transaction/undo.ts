import type { SetStoreFunction, Store } from "solid-js/store";

import type { GraphInterface, TransactionDetail } from "../graph";

import { getExistingOrDefaultTxnValue } from "./getExistingOrDefaultTxnValue";
import { replaceVertexProperties } from "../mutate/vertex";

export function undoAllowed(
  txnId: number,
  graph: Store<GraphInterface>,
  revertTransactionUpToIndex?: number,
): boolean {
  if (!txnId) {
    return false;
  }
  const txnVertex = graph.vertexes[`txn${txnId}`];
  if (!txnVertex) {
    return false;
  }

  const txnValue = txnVertex.P as TransactionDetail;
  if (txnValue.steps.length === 0) {
    return false;
  }

  const activeUndoIndex = txnValue.activeUndoIndex ?? txnValue.steps.length - 1;
  const preventUndoBeforeIndex = txnValue.preventUndoBeforeIndex ?? -1;

  if (txnValue.steps.length - 1 <= preventUndoBeforeIndex) {
    return false;
  }

  const newUndoIndex =
    revertTransactionUpToIndex ?? getNewUndoIndex(txnValue, activeUndoIndex);

  if (newUndoIndex < preventUndoBeforeIndex) {
    return false;
  }

  return activeUndoIndex > -1;
}

export function undo(
  txnId: number,
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
  revertTransactionUpToIndex?: number,
  removeAfterSteps?: boolean,
) {
  if (!undoAllowed(txnId, graph, revertTransactionUpToIndex)) {
    return;
  }

  const txnValue = getExistingOrDefaultTxnValue(txnId, graph);
  const activeUndoIndex = txnValue.activeUndoIndex ?? txnValue.steps.length - 1;

  const newUndoIndex =
    revertTransactionUpToIndex ?? getNewUndoIndex(txnValue, activeUndoIndex);

  txnValue.steps
    .slice(newUndoIndex + 1, activeUndoIndex + 1)
    .reverse()
    .forEach((txn) => txn.revert());
  txnValue.activeUndoIndex = newUndoIndex;

  if (removeAfterSteps) {
    txnValue.steps = txnValue.steps.slice(0, newUndoIndex + 1);
    txnValue.activeUndoIndex = txnValue.steps.length - 1;
    txnValue.undoStepIndexes = txnValue.undoStepIndexes.filter(
      (index) => index <= txnValue.activeUndoIndex,
    );
  }

  replaceVertexProperties(0, `txn${txnId}`, graph, setGraph, txnValue, {cloneProperties: false});
}

function getNewUndoIndex(txnValue: TransactionDetail, activeUndoIndex: number) {
  const nearestLowestIndex = txnValue.undoStepIndexes
    .slice()
    .reverse()
    .find((index) => index < activeUndoIndex);

  const newUndoIndex =
    nearestLowestIndex !== undefined ? nearestLowestIndex : activeUndoIndex - 1;
  return newUndoIndex;
}
