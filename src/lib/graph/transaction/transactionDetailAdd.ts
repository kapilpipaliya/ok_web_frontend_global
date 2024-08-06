import type { Store } from "solid-js/store";

import type { GraphInterface } from "../graph";
import type { TransactionValue } from "./TransactionType";

import { getExistingOrDefaultTxnValue } from "./getExistingOrDefaultTxnValue";

export function transactionDetailAdd(
  txnId: number,
  txnValue: TransactionValue,
  graph: Store<GraphInterface>,
) {
  if (!txnId) { return; }

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

  graph.transactions.set(txnId, existingTxnValue);
}
