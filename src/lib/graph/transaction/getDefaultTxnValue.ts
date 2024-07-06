import { ProcessStatus } from "./TransactionType";

export function getDefaultTxnValue() {
  return {
    activeUndoPoint: 0,
    revertSteps: [],
    status: ProcessStatus.Unset,
    steps: [],
    submittedStep: 0,
    undoPoints: [],
  };
}
