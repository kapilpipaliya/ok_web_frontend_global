import type { GraphInterface } from "~/lib/graph/graph";

import { getExistingOrDefaultTxnValue } from "./getExistingOrDefaultTxnValue";

export function saveUndoPoint(txnId: number, graph: GraphInterface) {
  const txnValue = getExistingOrDefaultTxnValue(txnId, graph);

  let activeUndoIndex = txnValue.activeUndoIndex ?? txnValue.steps.length - 1;
  if (activeUndoIndex === -1) {
    activeUndoIndex = 0;
  }

  if (!txnValue.undoStepIndexes.includes(activeUndoIndex)) {
    const insertIndex = txnValue.undoStepIndexes.findIndex(
      (index) => index > activeUndoIndex,
    );
    if (insertIndex === -1) {
      txnValue.undoStepIndexes.push(activeUndoIndex);
    } else {
      txnValue.undoStepIndexes.splice(insertIndex, 0, activeUndoIndex);
    }
  }
  graph.transactions.set(txnId, txnValue);
}
