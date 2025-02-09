import type { SetStoreFunction, Store } from "solid-js/store";

import type { GraphInterface } from "../graph";
import type { TransactionValue } from "./TransactionType";

import { replaceVertexProperties } from "../mutate/vertex";
import { getExistingOrDefaultTxnValue } from "./getExistingOrDefaultTxnValue";

export function redo(
  txnId: number,
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
) {
  if (!redoAllowed(txnId, graph)) {
    return;
  }

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

  replaceVertexProperties(0, `txn${txnId}`, graph, setGraph, txnValue);
}

export function redoAllowed(
  txnId: number,
  graph: Store<GraphInterface>,
): boolean {
  if (!txnId) {
    return false;
  }

  const txnValue = getExistingOrDefaultTxnValue(txnId, graph);
  const activeUndoIndex = txnValue.activeUndoIndex ?? txnValue.steps.length - 1;

  return activeUndoIndex < txnValue.steps.length - 1;
}

export function saveUndoPoint(
  txnId: number,
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
) {
  if (!txnId) {
    return;
  }
  const txnValue = getExistingOrDefaultTxnValue(txnId, graph);

  let activeUndoIndex = txnValue.activeUndoIndex ?? txnValue.steps.length - 1;
  if (activeUndoIndex === -1) {
    activeUndoIndex = 0;
  }

  if (!txnValue.undoStepIndexes.includes(activeUndoIndex)) {
    const insertIndex = txnValue.undoStepIndexes.findIndex(
      (index) => index > activeUndoIndex,
    );
    if (insertIndex === -1) {
      txnValue.undoStepIndexes.push(activeUndoIndex);
    } else {
      txnValue.undoStepIndexes.splice(insertIndex, 0, activeUndoIndex);
    }
  }
  replaceVertexProperties(0, `txn${txnId}`, graph, setGraph, txnValue, false);
}

export function transactionDetailAdd(
  txnId: number,
  txnValue: TransactionValue,
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
) {
  if (!txnId) {
    return;
  }

  const existingTxnValue = getExistingOrDefaultTxnValue(txnId, graph);

  const activeUndoIndex =
    existingTxnValue.activeUndoIndex ?? existingTxnValue.steps.length - 1;

  if (activeUndoIndex < existingTxnValue.steps.length - 1) {
    const activeUndoPointIndex = existingTxnValue.undoStepIndexes.findIndex(
      (index) => index > activeUndoIndex,
    );
    existingTxnValue.undoStepIndexes = existingTxnValue.undoStepIndexes.slice(
      0,
      activeUndoPointIndex,
    );

    if (existingTxnValue.submittedIndex >= activeUndoIndex) {
      const removedSteps = existingTxnValue.steps.slice(
        activeUndoIndex + 1,
        existingTxnValue.submittedIndex + 1,
      );
      existingTxnValue.revertSteps = [
        ...removedSteps,
        ...existingTxnValue.revertSteps,
      ];
    }
    existingTxnValue.steps = existingTxnValue.steps.slice(
      0,
      activeUndoIndex + 1,
    );
  }

  existingTxnValue.steps.push(txnValue);
  existingTxnValue.activeUndoIndex = existingTxnValue.steps.length - 1;

  replaceVertexProperties(0, `txn${txnId}`, graph, setGraph, existingTxnValue, {
    cloneProperties: false,
  });
}

export function undo(
  txnId: number,
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
) {
  if (!undoAllowed(txnId, graph)) {
    return;
  }

  const txnValue = getExistingOrDefaultTxnValue(txnId, graph);
  const activeUndoIndex = txnValue.activeUndoIndex ?? txnValue.steps.length - 1;

  const nearestLowestIndex = txnValue.undoStepIndexes
    .slice()
    .reverse()
    .find((index) => index < activeUndoIndex);

  const newUndoIndex =
    nearestLowestIndex !== undefined ? nearestLowestIndex : activeUndoIndex - 1;

  txnValue.steps.slice(newUndoIndex + 1, activeUndoIndex + 1);
  txnValue.activeUndoIndex = newUndoIndex;

  replaceVertexProperties(0, `txn${txnId}`, graph, setGraph, txnValue);
}

export function undoAllowed(
  txnId: number,
  graph: Store<GraphInterface>,
): boolean {
  if (!txnId) {
    return false;
  }

  const txnValue = getExistingOrDefaultTxnValue(txnId, graph);
  if (txnValue.steps.length <= 1) {
    return false;
  }

  const activeUndoIndex = txnValue.activeUndoIndex ?? txnValue.steps.length - 1;
  return activeUndoIndex > 0;
}

transactionDetailAdd(1, { a: 1 });

saveUndoPoint(1);
transactionDetailAdd(1, { a: 2 });
transactionDetailAdd(1, { a: 3 });
transactionDetailAdd(1, { a: 4 });
saveUndoPoint(1);
transactionDetailAdd(1, { a: 5 });
transactionDetailAdd(1, { a: 6 });
transactionDetailAdd(1, { a: 7 });
saveUndoPoint(1);
undo(1);
undo(1);
// transactionDetailAdd(1, { a: 8 });
transactions.get(1)!.submittedIndex = transactions.get(1)!.steps.length - 1;
saveUndoPoint(1);
// redo(1);
// redo(1);
saveUndoPoint(1);
transactionDetailAdd(1, { a: 8 });
undo(1);
undo(1);
transactions.get(1)!.submittedIndex = transactions.get(1)!.steps.length - 1;
