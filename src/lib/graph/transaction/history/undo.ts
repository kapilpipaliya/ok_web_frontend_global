import type { SetStoreFunction, Store } from "solid-js/store";

import type { GraphInterface } from "../../graph";

import { replaceVertexProperties } from "../../mutate/core/vertex";
import {TransactionDetail} from "../types/TransactionDetail";
import { getExistingOrDefaultTxnValue } from "../value/getExistingOrDefaultTxnValue";
import { getLastTxnIndex } from "../value/getLastTxnIndex";
import { undoTxn } from "./undoTxn";

/**
 * Performs an undo operation on a transaction, reverting changes up to a specified point.
 * 
 * The undo operation can:
 * 1. Revert to the previous checkpoint if no specific index is provided
 * 2. Revert to a specific index if provided
 * 3. Optionally remove all steps after the undo point
 * 
 * @param txnId - Transaction ID to undo
 * @param graph - Current graph state
 * @param setGraph - Function to update graph state
 * @param revertTransactionUpToIndex - Optional specific index to revert to
 * @param removeAfterSteps - Whether to remove steps after the undo point
 */
export function undo(
  txnId: number,
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
  revertTransactionUpToIndex?: number,
  removeAfterSteps?: boolean,
) {
  // Validate if undo operation is allowed
  if (!undoAllowed(txnId, graph, revertTransactionUpToIndex)) {
    return;
  }

  // Get current transaction state
  const txnValue = getExistingOrDefaultTxnValue(txnId, graph);
  const activeUndoIndex = txnValue.activeUndoIndex ?? getLastTxnIndex(txnId, graph);

  // Determine the target undo index
  const newUndoIndex = revertTransactionUpToIndex ?? 
    getNewUndoIndex(txnValue, activeUndoIndex);

  // Revert steps in reverse order up to the target index
  const stepsToRedo = txnValue.steps
    .slice(newUndoIndex + 1, activeUndoIndex + 1)
    .reverse();
  for (const txn of stepsToRedo) {
    undoTxn(txn, graph, setGraph);
  }
  txnValue.activeUndoIndex = newUndoIndex;

  // Optionally remove steps after the undo point
  if (removeAfterSteps) {
    txnValue.steps = txnValue.steps.slice(0, newUndoIndex + 1);
    txnValue.activeUndoIndex = txnValue.steps.length - 1;
    txnValue.undoStepIndexes = txnValue.undoStepIndexes.filter(
      (index) => index <= txnValue.activeUndoIndex
    );
  }

  // Update transaction state in the graph
  replaceVertexProperties(0, `txn${txnId}`, graph, setGraph, txnValue, {
    cloneProperties: false,
  });
}

/**
 * Checks if an undo operation is allowed for the given transaction.
 * 
 * Validates:
 * 1. Transaction exists and has steps
 * 2. Undo won't go before the prevention threshold
 * 3. There are steps available to undo
 * 
 * @param txnId - Transaction ID to check
 * @param graph - Current graph state
 * @param revertTransactionUpToIndex - Optional target index to check
 * @returns boolean indicating if undo is allowed
 */
export function undoAllowed(
  txnId: number,
  graph: Store<GraphInterface>,
  revertTransactionUpToIndex?: number,
): boolean {
  // Basic validation
  if (!txnId) return false;
  
  const txnVertex = graph.vertexes[`txn${txnId}`];
  if (!txnVertex) return false;

  const txnValue = txnVertex.P as TransactionDetail;
  if (txnValue.steps.length === 0) return false;

  const lastTxnIndex = getLastTxnIndex(txnId, graph);
  // Check undo position constraints
  const activeUndoIndex = txnValue.activeUndoIndex ?? lastTxnIndex;
  const preventUndoBeforeIndex = txnValue.preventUndoBeforeIndex ?? -1;

  if (lastTxnIndex <= preventUndoBeforeIndex) return false;

  const newUndoIndex = revertTransactionUpToIndex ?? 
    getNewUndoIndex(txnValue, activeUndoIndex);

  if (newUndoIndex < preventUndoBeforeIndex) return false;

  return activeUndoIndex > -1;
}

/**
 * Finds the nearest previous undo checkpoint before the current position.
 * If no checkpoint exists, returns the previous step.
 */
function getNewUndoIndex(txnValue: TransactionDetail, activeUndoIndex: number): number {
  const nearestLowestIndex = txnValue.undoStepIndexes
    .slice()
    .reverse()
    .find((index) => index < activeUndoIndex);

  return nearestLowestIndex !== undefined ? nearestLowestIndex : activeUndoIndex - 1;
}
