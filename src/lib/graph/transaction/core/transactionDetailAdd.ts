import type { SetStoreFunction, Store } from "solid-js/store";

import { untrack } from "solid-js";

import type { GraphInterface } from "../../graph";
import type { TransactionValue } from "../types/TransactionType";

import { replaceVertexProperties } from "../../mutate/core/vertex";
import {TransactionDetail} from "../types/TransactionDetail";

export function transactionDetailAdd(
  txnId: number,
  txnValue: TransactionValue,
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
  options?: { skipPostMessage?: string },
) {
  return untrack(() => {
    if (!txnId) {
      return;
    }

    const txnVertex = graph.vertexes[`txn${txnId}`];
    const existingTxnValue = txnVertex.P as TransactionDetail;

    let steps = [...existingTxnValue.steps];
    let undoStepIndexes = [...existingTxnValue.undoStepIndexes];
    let revertSteps = [...existingTxnValue.revertSteps];

    const activeUndoIndex =
      existingTxnValue.activeUndoIndex ?? steps.length - 1;

    if (activeUndoIndex < steps.length - 1) {
      const activeUndoPointIndex = undoStepIndexes.findIndex(
        (index) => index > activeUndoIndex,
      );
      undoStepIndexes = undoStepIndexes.slice(0, activeUndoPointIndex);

      if (existingTxnValue.submittedIndex >= activeUndoIndex) {
        const removedSteps = steps.slice(
          activeUndoIndex + 1,
          existingTxnValue.submittedIndex + 1,
        );
        revertSteps = [...removedSteps, ...revertSteps];
      }
      steps = steps.slice(0, activeUndoIndex + 1);
    }

    steps.push(txnValue);
    const newActiveUndoIndex = steps.length - 1;

    const newTxnValue = {
      ...existingTxnValue,
      activeUndoIndex: newActiveUndoIndex,
      revertSteps,
      steps,
      undoStepIndexes,
    };

    replaceVertexProperties(0, `txn${txnId}`, graph, setGraph, newTxnValue, {
      cloneProperties: false,
      skipPostMessage: options?.skipPostMessage,
    });
  });
}
