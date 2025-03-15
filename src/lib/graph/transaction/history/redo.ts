import type { SetStoreFunction, Store } from "solid-js/store";

import type { GraphInterface } from "../../graph";

import { replaceVertexProperties } from "../../mutate/core/vertex";
import { getExistingOrDefaultTxnValue } from "../value/getExistingOrDefaultTxnValue";
import { getLastTxnIndex } from "../value/getLastTxnIndex";
import { redoTxn } from "./redoTxn";

/**
 * Performs a redo operation on a transaction, restoring previously undone changes.
 *
 * The redo operation:
 * 1. Moves forward to the next undo checkpoint if one exists
 * 2. Otherwise moves forward one step
 * 3. Applies all steps between current position and target position
 *
 * @param txnId - Transaction ID to redo
 * @param graph - Current graph state
 * @param setGraph - Function to update graph state
 */
export function redo(
  txnId: number,
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
) {
  // Validate if redo operation is allowed
  if (!redoAllowed(txnId, graph)) {
    return;
  }

  // Get current transaction state
  const txnValue = getExistingOrDefaultTxnValue(txnId, graph);
  const activeUndoIndex = txnValue.activeUndoIndex ?? txnValue.steps.length - 1;

  // Find next undo checkpoint or step
  let nextUndoIndex = txnValue.undoStepIndexes.find(
    (index) => index > activeUndoIndex,
  );

  // If no checkpoint found, move forward one step
  if (nextUndoIndex === undefined) {
    nextUndoIndex = txnValue.activeUndoIndex + 1;
    if (nextUndoIndex >= txnValue.steps.length) {
      console.error("No next undo index found");
      return;
    }
  }

  // Update undo position and apply steps
  txnValue.activeUndoIndex = nextUndoIndex;
  for (const step of txnValue.steps.slice(
    activeUndoIndex + 1,
    nextUndoIndex + 1,
  )) {
    redoTxn(step, graph, setGraph);
  }

  // Update transaction state in the graph
  replaceVertexProperties(0, `txn${txnId}`, graph, setGraph, txnValue, {
    cloneProperties: false,
  });
}

/**
 * Checks if a redo operation is allowed for the given transaction.
 *
 * Validates:
 * 1. Transaction exists
 * 2. There are steps available to redo
 *
 * @param txnId - Transaction ID to check
 * @param graph - Current graph state
 * @returns boolean indicating if redo is allowed
 */
export function redoAllowed(
  txnId: number,
  graph: Store<GraphInterface>,
): boolean {
  // Basic validation
  if (!txnId) {
    return false;
  }

  const txnVertex = graph.vertexes[`txn${txnId}`];
  if (!txnVertex) {
    return false;
  }

  const lastTxnIndex = getLastTxnIndex(txnId, graph);
  // Check if there are steps to redo
  const txnValue = getExistingOrDefaultTxnValue(txnId, graph);
  const activeUndoIndex = txnValue.activeUndoIndex ?? lastTxnIndex;
  return activeUndoIndex < lastTxnIndex;
}
