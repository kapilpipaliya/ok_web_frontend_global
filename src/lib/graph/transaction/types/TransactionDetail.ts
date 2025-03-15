import type { TransactionValue } from "./TransactionType";

export interface TransactionDetail {
  // Current position in the undo history
  activeUndoIndex: number;

  // Maps named checkpoints to their step indexes for quick reference
  namedUndoStepIndexes: { [key: string]: number };

  // Prevents undo operations before this index (safety threshold)
  preventUndoBeforeIndex: number;

  // Stores steps that were reverted/removed for potential recovery
  revertSteps: TransactionValue[];

  // The main sequence of transaction steps/operations
  steps: TransactionValue[];

  // Index of the last submitted/confirmed transaction
  submittedIndex: number;

  // Special indexes that mark important undo points/checkpoints
  undoStepIndexes: number[];
}
