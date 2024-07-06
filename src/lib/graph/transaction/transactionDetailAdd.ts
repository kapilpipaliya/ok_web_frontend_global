import type { Store } from "solid-js/store";

import type { GraphInterface } from "../graph";
import type { TransactionValue } from "./TransactionType";

import { getExistingOrDefaultTxnValue } from "./getExistingOrDefaultTxnValue";

// @ts-ignore

export function transactionDetailAdd(
  txnId: number,
  txnValue: TransactionValue, graph: Store<GraphInterface>
) {
  if (!txnId) return;
  const existingTxnValue = getExistingOrDefaultTxnValue(txnId, graph);

  if (existingTxnValue.undoStep < existingTxnValue.steps.length - 1) {
    if (existingTxnValue.submittedStep < existingTxnValue.undoStep) {
      // delete steps after undoStep
      existingTxnValue.steps = existingTxnValue.steps.slice(0, existingTxnValue.undoStep + 1);
    } else {
      // remove steps after undoStep to submittedStep and add to revertSteps, descard steps after submittedStep
      const removedSteps = existingTxnValue.steps.slice(existingTxnValue.undoStep + 1, existingTxnValue.submittedStep + 1);
      existingTxnValue.steps = existingTxnValue.steps.slice(0, existingTxnValue.undoStep + 1);
      existingTxnValue.revertSteps = [...removedSteps, ...existingTxnValue.revertSteps];
    }
  }
  existingTxnValue.steps = [...existingTxnValue.steps, txnValue];
  existingTxnValue.undoStep = existingTxnValue.steps.length - 1;

  graph.transactions.set(txnId, existingTxnValue);
}
