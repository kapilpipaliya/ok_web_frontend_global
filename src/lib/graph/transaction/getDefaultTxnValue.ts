import { ProcessStatus } from "./TransactionType";

export function getDefaultTxnValue() {
  return {
    activeUndoIndex: -1,
    preventUndoBeforeIndex: -1,
    revertSteps: [],
    status: ProcessStatus.Unset,
    steps: [],
    submittedIndex: -1,
    undoStepIndexes: []
  };
}
