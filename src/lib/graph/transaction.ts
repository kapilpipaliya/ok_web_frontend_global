import { batch } from "solid-js";
import type {
  ServerEventsDispatcher,
  WSEvent,
} from "~/lib/websocket/ws_events_dispatcher";
import type { GraphInterface, Id } from "./graph";
import type { SetStoreFunction, Store } from "solid-js/store";

// temporary we start from 500000 because newId should not conflict with existing Ids
export let uniqueId = -50000;

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
export const transactions = new Map<
  number,
  {
    status: ProcessStatus;
    steps: TransactionValue[];
    undoStep: number;
    submittedStep: number;
    revertSteps: TransactionValue[];
    undoPoints: number[];
  }
>();



// @ts-ignore
export function transactionDetailAdd(
  txnId: number,
  txnValue: TransactionValue,
) {
  if (!txnId) return;
  const existingTxnValue = getExistingOrDefaultTxnValue(txnId);

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

  transactions.set(txnId, existingTxnValue);
}

export function getNewTxnId(
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
) {
  setGraph("txnId", (v) => (v ?? 0) + 1);
  return graph.txnId;
}

export function getExistingOrDefaultTxnValue(txnId: number) {
  return (
    transactions.get(txnId) || {
      status: ProcessStatus.Unset,
      undoStep: 0,
      submittedStep: 0,
      steps: [],
      revertSteps: [],
      undoPoints: [],
    }
  );
}

export function revertTransactionUpTo(txnId: number, txnIndex: number) {
  if (!txnId || !transactions.has(txnId)) return;
  const existingTxnValue = getExistingOrDefaultTxnValue(txnId);
  const newTxnValue = existingTxnValue.steps.splice(txnIndex);
  newTxnValue.reverse().forEach((x) => x.revert());
}

export function revertTransaction(txnId: number) {
  if (!txnId || !transactions.has(txnId)) return;
  const existingTxnValue = [...(transactions.get(txnId)?.steps || [])];
  batch(() => {
    existingTxnValue.reverse().forEach((txn) => txn.revert());
  });
  transactions.delete(txnId);
}

export function undo(txnId: number) {
  debugger;
  if (!txnId || !transactions.has(txnId)) return;
  const existingTxnValue = getExistingOrDefaultTxnValue(txnId);
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
export function redo(txnId: number) {
  if (!txnId || !transactions.has(txnId)) return;
  const existingTxnValue = getExistingOrDefaultTxnValue(txnId);
  // existingTxnValue.revertSteps.reverse().forEach((txn) => txn.redo());
}

export function txnHasSteps(txnId: number) {
  if (!txnId || !transactions.has(txnId)) return false;
  const existingTxnValue = transactions.get(txnId)?.steps || [];
  return existingTxnValue.length > 0;
}

export function getTransactionData(txnId: number) {
  if (!transactions.has(txnId)) return [];
  const existingTxnValue = [...(transactions.get(txnId)?.steps || [])].map(
    (txnDetail) => ({
      insert: txnDetail.insert?.(),
      replace: txnDetail.replace?.(),
      merge: txnDetail.merge?.(),
      deleteVertex: txnDetail.deleteVertex?.(),
      insertEdge: txnDetail.insertEdge?.(),
      replaceEdge: txnDetail.replaceEdge?.(),
      replaceEdgeStart: txnDetail.replaceEdgeStart?.(),
      replaceEdgeEnd: txnDetail.replaceEdgeEnd?.(),
      deleteEdge: txnDetail.deleteEdge?.(),
    }),
  );
  return existingTxnValue;
}
export const vertexOldIdToNewIdMap = new Map<Id, Id>();
export const edgeOldIdToNewIdMap = new Map<Id, Id>();

export function commitTransaction(Ws: ServerEventsDispatcher) {
  let firstReadyTxn = 0;
  // If any pending transaction exist don't send it. // we will clear the previous txn on txn mutation result receive.
  for (const [txnId, value] of transactions.entries()) {
    if (value.status === ProcessStatus.Ready) {
      if (!firstReadyTxn) firstReadyTxn = txnId;
      break;
    }
    // if (
    //   value.status === ProcessStatus.AckReceived ||
    //   value.status === ProcessStatus.Sent
    // ) {
    //   return;
    // }
  }
  if (firstReadyTxn) {
    const existingTxnValue = getTransactionData(firstReadyTxn);
    transactions.get(firstReadyTxn)!.status = ProcessStatus.Sent;
    if (existingTxnValue.length) {
      const data = [
        [
          firstReadyTxn,
          [...vertexOldIdToNewIdMap],
          [...edgeOldIdToNewIdMap],
          existingTxnValue,
        ],
      ];
      const event = ["post", "mutate", 0] as WSEvent;
      // Ws.trigger([
      //   [
      //     event,
      //     data,
      //   ],
      // ]);
      return { event, data };
    }
  }
}
// Bug: if commitTxn is called many times it is sending event many times.
// TODO: currently we can only run this function once.
// we need to set seperate txnId once commited. Fix this.
export function commitTxn(txnId: number, Ws: ServerEventsDispatcher) {
  console.log("In commitTxn");

  if (transactions.has(txnId)) {
    console.log("In transactions commitTxn");
    transactions.get(txnId)!.status = ProcessStatus.Ready;
    return commitTransaction(Ws);
  }
}
// TODO: future plan: once committed current system should be able to revert and sync to server too.

export function getNewGraphId() {
  uniqueId = uniqueId + 1;
  return uniqueId;
  // Muration Actor Exception Error : Integer overflow -
  // return `${new Date().getTime()}`;
}

export async function waitTillAllEventsAreProcessed() {
  if (isAllTxnProcessed()) return true;
  return await new Promise((resolve, reject) => {
    const checkAllTxnCompleted = () => {
      const checkTxnCompletedTimeout = setTimeout(() => {
        if (isAllTxnProcessed()) {
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

export function isAllTxnProcessed() {
  let allTxnProcessed = true;
  for (const [_txnId, value] of transactions.entries()) {
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
