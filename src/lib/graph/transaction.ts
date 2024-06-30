import { batch } from "solid-js";
import type { GraphInterface, Id } from "./graph";
import type { SetStoreFunction, Store } from "solid-js/store";

// temporary we start from 500000 because newId should not conflict with existing Ids
let uniqueId = -50000;

export type Revert = { revert: () => any };
export type InsertFn = {
  [key in
  | "insert"
  | "replace"
  | "merge"
  | "deleteVertex"
  | "insertEdge"
  | "replaceEdge"
  | "replaceEdgeStart"
  | "replaceEdgeEnd"
  | "deleteEdge"]?: () => any;
};

export enum ProcessStatus {
  Unset = 0,
  Ready = 1,
  Sent = 2,
  AckReceived = 3,
  Processed = 4,
}

export type TransactionValue = InsertFn & Revert & { data: any };

// @ts-ignore
export function transactionDetailAdd(
  txnId: number,
  txnValue: TransactionValue,graph: Store<GraphInterface>,
) {
  if (!txnId) return;
  const existingTxnValue = getExistingOrDefaultTxnValue(txnId, graph);

  if (existingTxnValue.undoStep < existingTxnValue.steps.length - 1) {
    if (existingTxnValue.submittedStep < existingTxnValue.undoStep) {
      // delete steps after undoStep
      existingTxnValue.steps = existingTxnValue.steps.slice(0, existingTxnValue.undoStep + 1);
    } else {
      // remove steps after undoStep to submittedStep and add to revertSteps, descard steps after submittedStep
      const removedSteps = existingTxnValue.steps.slice(existingTxnValue.undoStep + 1, existingTxnValue.submittedStep + 1);
      existingTxnValue.steps = existingTxnValue.steps.slice(0, existingTxnValue.undoStep + 1);
      existingTxnValue.revertSteps = [...removedSteps, ...existingTxnValue.revertSteps];
    }
  }
  existingTxnValue.steps = [...existingTxnValue.steps, txnValue];
  existingTxnValue.undoStep = existingTxnValue.steps.length - 1;

  graph.transactions.set(txnId, existingTxnValue);
}

export function getNewTxnId(
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
) {
  setGraph("txnId", (v) => (v ?? 0) + 1);
  return graph.txnId;
}

export function getExistingOrDefaultTxnValue(txnId: number, graph: Store<GraphInterface>) {
  return (
    graph.transactions.get(txnId) || {
      status: ProcessStatus.Unset,
      undoStep: 0,
      submittedStep: 0,
      steps: [],
      revertSteps: [],
      undoPoints: [],
    }
  );
}

export function revertTransactionUpTo(txnId: number, txnIndex: number, graph: Store<GraphInterface>) {
  if (!txnId || !graph.transactions.has(txnId)) return;
  const existingTxnValue = getExistingOrDefaultTxnValue(txnId, graph);
  const newTxnValue = existingTxnValue.steps.splice(txnIndex);
  newTxnValue.reverse().forEach((x) => x.revert());
}

export function revertTransaction(txnId: number, graph: Store<GraphInterface>) {
  if (!txnId || !graph.transactions.has(txnId)) return;
  const existingTxnValue = [...(graph.transactions.get(txnId)?.steps || [])];
  batch(() => {
    existingTxnValue.reverse().forEach((txn) => txn.revert());
  });
  graph.transactions.delete(txnId);
}

export function undo(txnId: number, graph: Store<GraphInterface>) {
  if (!txnId || !graph.transactions.has(txnId)) return;
  const existingTxnValue = getExistingOrDefaultTxnValue(txnId, graph);
  if (existingTxnValue.steps.length <= 1) return;
  const undoPointIndex = existingTxnValue.undoPoints.findIndex((point) => point === existingTxnValue.undoStep);
  let newUndoPoint = 0;
  if (undoPointIndex !== -1 && undoPointIndex > 0) {
    newUndoPoint = existingTxnValue.undoPoints[undoPointIndex - 1];
    

    // existingTxnValue.steps = existingTxnValue.steps.slice(0, newUndoPoint + 1);
    // existingTxnValue.revertSteps = existingTxnValue.revertSteps.slice(0, newUndoPoint + 1);
  } else {
    newUndoPoint = existingTxnValue.undoStep - 1;
  }

  existingTxnValue.steps.slice(newUndoPoint + 1, existingTxnValue.undoStep + 1).forEach((txn) => txn.revert());
  existingTxnValue.undoStep = newUndoPoint;
  // existingTxnValue.revertSteps.reverse().forEach((txn) => txn.redo());
}
export function redo(txnId: number, graph: Store<GraphInterface>) {
  if (!txnId || !graph.transactions.has(txnId)) return;
  const existingTxnValue = getExistingOrDefaultTxnValue(txnId, graph);
  // existingTxnValue.revertSteps.reverse().forEach((txn) => txn.redo());
}

export function txnHasSteps(txnId: number, graph: Store<GraphInterface>) {
  if (!txnId || !graph.transactions.has(txnId)) return false;
  const existingTxnValue = graph.transactions.get(txnId)?.steps || [];
  return existingTxnValue.length > 0;
}

export function getTransactionData(txnId: number, graph: Store<GraphInterface>) {
  if (!graph.transactions.has(txnId)) return [];
  const existingTxnValue = [...(graph.transactions.get(txnId)?.steps || [])].map(
    (txnDetail) => {
      const txnData = {
        insert: txnDetail.insert?.(),
        replace: txnDetail.replace?.(),
        merge: txnDetail.merge?.(),
        deleteVertex: txnDetail.deleteVertex?.(),
        insertEdge: txnDetail.insertEdge?.(),
        replaceEdge: txnDetail.replaceEdge?.(),
        replaceEdgeStart: txnDetail.replaceEdgeStart?.(),
        replaceEdgeEnd: txnDetail.replaceEdgeEnd?.(),
        deleteEdge: txnDetail.deleteEdge?.(),
      };
      return Object.keys(txnData).reduce((acc, key) => {
        // @ts-ignore
        if (txnData[key] !== undefined) {
          // @ts-ignore
          acc[key] = txnData[key];
        }
        return acc;
      }, {});
    },
  );
  return existingTxnValue;
}
export const vertexOldIdToNewIdMap = new Map<Id, Id>();
export const edgeOldIdToNewIdMap = new Map<Id, Id>();

export function commitTransaction(txnId: number, graph: Store<GraphInterface>) {
    const existingTxnValue = getTransactionData(txnId, graph);
    if (existingTxnValue.length) {
      const data =  {
          txnId: txnId,
          vertexIdMap: [...vertexOldIdToNewIdMap],
          edgeIdMap: [...edgeOldIdToNewIdMap],
          transactions: existingTxnValue,
        }
      return data;
    }
}
// Bug: if commitTxn is called many times it is sending event many times.
// TODO: currently we can only run this function once.
// we need to set seperate txnId once commited. Fix this.
export function commitTxn(txnId: number, graph: Store<GraphInterface>) {
  console.log("In commitTxn");
  if (graph.transactions.has(txnId)) {
    console.log("In transactions commitTxn");
    return commitTransaction(txnId, graph);
  }
}
// TODO: future plan: once committed current system should be able to revert and sync to server too.

export function getNewGraphId(): Id {
  uniqueId = uniqueId + 1;
  return uniqueId;
  // Muration Actor Exception Error : Integer overflow -
  // return `${new Date().getTime()}`;
}

export async function waitTillAllEventsAreProcessed(graph: Store<GraphInterface>) {
  if (isAllTxnProcessed(graph)) return true;
  return await new Promise((resolve, reject) => {
    const checkAllTxnCompleted = () => {
      const checkTxnCompletedTimeout = setTimeout(() => {
        if (isAllTxnProcessed(graph)) {
          vertexOldIdToNewIdMap.clear();
          edgeOldIdToNewIdMap.clear();
          resolve(true);
        } else {
          checkAllTxnCompleted();
        }
        clearTimeout(checkTxnCompletedTimeout);
      }, 120);
    };
    checkAllTxnCompleted();
  });
}

export function isAllTxnProcessed(graph: Store<GraphInterface>) {
  let allTxnProcessed = true;
  for (const [_txnId, value] of graph.transactions.entries()) {
    if (
      value.status !== ProcessStatus.Processed &&
      value.status !== ProcessStatus.Unset
    ) {
      allTxnProcessed = false;
      break;
    }
  }
  return allTxnProcessed;
}
