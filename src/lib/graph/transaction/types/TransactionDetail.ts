import type {TransactionValue} from "./TransactionType";

export interface TransactionDetail {
  activeUndoIndex: number;
  namedUndoStepIndexes: { [key: string]: number };
  preventUndoBeforeIndex: number;
  revertSteps: TransactionValue[];
  steps: TransactionValue[];
  submittedIndex: number;
  undoStepIndexes: number[];
}