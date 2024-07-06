import { ProcessStatus } from "./TransactionType";

export function getDefaultTxnValue() {
  return {
    revertSteps: [],
    status: ProcessStatus.Unset,
    steps: [],
    submittedStep: 0,
    undoPoints: [],
    undoStep: 0,
  };
}
