import {TransactionDetail} from "../types/TransactionDetail";

export function getDefaultTxnValue() {
  return {
    activeUndoIndex: -1,
    namedUndoStepIndexes: {},
    preventUndoBeforeIndex: -1,
    revertSteps: [],
    steps: [],
    submittedIndex: -1,
    undoStepIndexes: [],
  } as TransactionDetail;
}
