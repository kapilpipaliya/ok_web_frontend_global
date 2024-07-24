export function getDefaultTxnValue() {
  return {
    activeUndoIndex: -1,
    preventUndoBeforeIndex: -1,
    revertSteps: [],
    steps: [],
    submittedIndex: -1,
    undoStepIndexes: []
  };
}
