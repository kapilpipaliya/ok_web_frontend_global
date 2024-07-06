import type { GraphInterface } from "~/lib/graph/graph";

import { getExistingOrDefaultTxnValue } from "../graph/transaction/getExistingOrDefaultTxnValue";

export function saveUndoPoint(txnId2: number, graph: GraphInterface) {
  const existingTxnValue = getExistingOrDefaultTxnValue(txnId2, graph);
  existingTxnValue.activeUndoPoint = existingTxnValue.steps.length - 1;
  existingTxnValue.undoPoints.push(existingTxnValue.activeUndoPoint);
  graph.transactions.set(txnId2, existingTxnValue);
}
