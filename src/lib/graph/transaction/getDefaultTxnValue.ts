import { ProcessStatus } from "./TransactionType";

export function getDefaultTxnValue() {
  return {
    activeUndoIndex: 0,
    revertSteps: [],
    status: ProcessStatus.Unset,
    steps: [],
    submittedIndex: 0,
    undoStepIndexes: [],
  };
}
