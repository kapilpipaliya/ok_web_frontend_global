import type { SetStoreFunction, Store } from "solid-js/store";

import type { GraphInterface } from "../graph";

import { getExistingOrDefaultTxnValue } from "./getExistingOrDefaultTxnValue";
import { replaceVertexProperties } from "../mutate/vertex";

export function redoAllowed(
  txnId: number,
  graph: Store<GraphInterface>,
): boolean {
  if (!txnId) {
    return false;
  }
  const txnVertex = graph.vertexes[`txn${txnId}`];
  if (!txnVertex) {
    return false;
  }

  const txnValue = getExistingOrDefaultTxnValue(txnId, graph);
  const activeUndoIndex = txnValue.activeUndoIndex ?? txnValue.steps.length - 1;
  return activeUndoIndex < txnValue.steps.length - 1;
}

export function redo(
  txnId: number, 
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>
) {
  if (!redoAllowed(txnId, graph)) {
    return;
  }

  const txnValue = getExistingOrDefaultTxnValue(txnId, graph);
  const activeUndoIndex = txnValue.activeUndoIndex ?? txnValue.steps.length - 1;

  let nextUndoIndex = txnValue.undoStepIndexes.find(
    (index) => index > activeUndoIndex,
  );
  if (nextUndoIndex === undefined) {
    nextUndoIndex = txnValue.activeUndoIndex + 1;
    if (nextUndoIndex >= txnValue.steps.length) {
      console.error("No next undo index found");
      return;
    }
  }

  txnValue.activeUndoIndex = nextUndoIndex;
  txnValue.steps
    .slice(activeUndoIndex + 1, nextUndoIndex + 1)
    .forEach((step) => {
      if (step.redo) {
        step.redo();
      }
    });

  replaceVertexProperties(0, `txn${txnId}`, graph, setGraph, txnValue, {cloneProperties: false});
}
