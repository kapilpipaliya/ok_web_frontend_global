import type { SetStoreFunction, Store } from "solid-js/store";

import type { GraphInterface } from "~/lib/graph/GraphContext";

import { replaceVertexProperties } from "../../mutate/core/vertex";
import { getExistingOrDefaultTxnValue } from "../value/getExistingOrDefaultTxnValue";
import { getActiveUndoIndex } from "./getActiveUndoIndex";

export function saveUndoPoint(
  txnId: number,
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
) {
  if (!txnId) {
    return;
  }
  const txnValue = getExistingOrDefaultTxnValue(txnId, graph);

  const activeUndoIndex = getActiveUndoIndex(txnId, graph);

  if (!txnValue.undoStepIndexes.includes(activeUndoIndex)) {
    const insertIndex = txnValue.undoStepIndexes.findIndex(
      (index) => index > activeUndoIndex,
    );
    if (insertIndex === -1) {
      txnValue.undoStepIndexes.push(activeUndoIndex);
    } else {
      // insert the new undo point at the correct position, and move all the points after it one position to the right
      txnValue.undoStepIndexes.splice(insertIndex, 0, activeUndoIndex);
    }
    replaceVertexProperties(0, `txn${txnId}`, graph, setGraph, txnValue as { [key: string]: unknown }, {
      cloneProperties: false,
    });
  }
}
