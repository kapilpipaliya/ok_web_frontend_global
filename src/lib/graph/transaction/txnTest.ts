function getDefaultTxnValue() {
  return {
    activeUndoIndex: 0,
    revertSteps: [],
    steps: [],
    submittedIndex: 0,
    undoStepIndexes: [] as number[],
  };
}

const transactions = new Map<number, {
  activeUndoIndex: number;
  steps: any[];
  submittedIndex: number;
  undoStepIndexes: number[];
}>();

export function getExistingOrDefaultTxnValue(txnId: number) {
  return transactions.has(txnId) ? { ...transactions.get(txnId)! } : getDefaultTxnValue();
}

export function undoAllowed(txnId: number): boolean {
  if (!txnId || !transactions.has(txnId)) return false;

  const txnValue = getExistingOrDefaultTxnValue(txnId);
  if (txnValue.steps.length <= 1) return false;

  const activeUndoIndex = txnValue.activeUndoIndex ?? txnValue.steps.length - 1;
  return activeUndoIndex > 0;
}

export function redoAllowed(txnId: number): boolean {
  if (!txnId || !transactions.has(txnId)) return false;

  const txnValue = getExistingOrDefaultTxnValue(txnId);
  const activeUndoIndex = txnValue.activeUndoIndex ?? txnValue.steps.length - 1;

  return activeUndoIndex < txnValue.steps.length - 1;
}

export function undo(txnId: number) {
  if (!undoAllowed(txnId)) return;

  const txnValue = getExistingOrDefaultTxnValue(txnId);
  const activeUndoIndex = txnValue.activeUndoIndex ?? txnValue.steps.length - 1;

  const nearestLowestIndex = txnValue.undoStepIndexes
    .slice()
    .reverse()
    .find(index => index < activeUndoIndex);

  const newUndoIndex = nearestLowestIndex !== undefined ? nearestLowestIndex : activeUndoIndex - 1;
  if (nearestLowestIndex === undefined) {
    // Commented out code for slicing steps and revertSteps
    // txnValue.steps = txnValue.steps.slice(0, newUndoPoint + 1);
    // txnValue.revertSteps = txnValue.revertSteps.slice(0, newUndoPoint + 1);
  }

  txnValue.steps.slice(newUndoIndex + 1, activeUndoIndex + 1);
  txnValue.activeUndoIndex = newUndoIndex;

  // Commented out code for redoing revertSteps
  // txnValue.revertSteps.reverse().forEach((txn) => txn.redo());

  transactions.set(txnId, txnValue);
}

export function redo(txnId: number) {
  if (!redoAllowed(txnId)) return;

  const txnValue = getExistingOrDefaultTxnValue(txnId);
  const activeUndoIndex = txnValue.activeUndoIndex ?? txnValue.steps.length - 1;

  const nextUndoIndex = txnValue.undoStepIndexes.find(index => index > activeUndoIndex);
  if (nextUndoIndex !== undefined) {
    txnValue.activeUndoIndex = nextUndoIndex;
    txnValue.steps.slice(activeUndoIndex + 1, nextUndoIndex + 1).forEach(step => {
      if (step.redo) {
        step.redo();
      }
    });
  }

  transactions.set(txnId, txnValue);
}

export function saveUndoPoint(txnId: number) {
  const txnValue = getExistingOrDefaultTxnValue(txnId);

  let activeUndoIndex = txnValue.activeUndoIndex ?? txnValue.steps.length - 1;
  if (activeUndoIndex === -1) {
    activeUndoIndex = 0;
  }

  if (!txnValue.undoStepIndexes.includes(activeUndoIndex)) {
    const insertIndex = txnValue.undoStepIndexes.findIndex(index => index > activeUndoIndex);
    if (insertIndex === -1) {
      txnValue.undoStepIndexes.push(activeUndoIndex);
    } else {
      txnValue.undoStepIndexes.splice(insertIndex, 0, activeUndoIndex);
    }
  }
  transactions.set(txnId, txnValue);
}

export function transactionDetailAdd(txnId: number, txnValue: TransactionValue) {
  if (!txnId) return;

  const existingTxnValue = getExistingOrDefaultTxnValue(txnId);

  const activeUndoIndex = existingTxnValue.activeUndoIndex ?? existingTxnValue.steps.length - 1;

  if (activeUndoIndex < existingTxnValue.steps.length - 1) {
    const activeUndoPointIndex = existingTxnValue.undoStepIndexes.findIndex((index) => index > activeUndoIndex);
    existingTxnValue.undoStepIndexes = existingTxnValue.undoStepIndexes.slice(0, activeUndoPointIndex);

    if (existingTxnValue.submittedIndex >= activeUndoIndex) {
      const removedSteps = existingTxnValue.steps.slice(activeUndoIndex + 1, existingTxnValue.submittedIndex + 1);
      console.log('removedSteps', removedSteps, activeUndoIndex + 1, existingTxnValue.submittedIndex + 1);
      existingTxnValue.revertSteps = [...removedSteps, ...existingTxnValue.revertSteps];
    }
    existingTxnValue.steps = existingTxnValue.steps.slice(0, activeUndoIndex + 1);
  }

  existingTxnValue.steps.push(txnValue);
  existingTxnValue.activeUndoIndex = existingTxnValue.steps.length - 1;

  transactions.set(txnId, existingTxnValue);
}

transactionDetailAdd(1, { a: 1 });

saveUndoPoint(1);
console.log(transactions.get(1));
transactionDetailAdd(1, { a: 2 });
transactionDetailAdd(1, { a: 3 });
transactionDetailAdd(1, { a: 4 });
saveUndoPoint(1);
console.log(transactions.get(1));
transactionDetailAdd(1, { a: 5 });
transactionDetailAdd(1, { a: 6 });
transactionDetailAdd(1, { a: 7 });
saveUndoPoint(1);
console.log(transactions.get(1));
undo(1);
undo(1);
// transactionDetailAdd(1, { a: 8 });
transactions.get(1)!.submittedIndex = transactions.get(1)!.steps.length - 1;
console.log(transactions.get(1)!.submittedIndex);
saveUndoPoint(1);
console.log(transactions.get(1));
// redo(1);
// redo(1);
saveUndoPoint(1);
console.log(transactions.get(1));
transactionDetailAdd(1, { a: 8 });
console.log(transactions.get(1));
undo(1);
undo(1);
transactions.get(1)!.submittedIndex = transactions.get(1)!.steps.length - 1;
console.log(transactions.get(1)!.submittedIndex);
console.log(transactions.get(1));
