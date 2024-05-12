import { batch } from "solid-js";
import { ServerEventsDispatcher } from "~/lib/websocket/ws_events_dispatcher";
import { isNumber } from "~/lib/Utils";
import { Id } from "./graph";




// temporary we start from 500000 because newId should not conflict with existing Ids
export let uniqueId = -50000;

export type Revert = { revert: () => any; };
export type InsertFn = {
  [key in "insert" |
  "replace" |
  "merge" |
  "deleteVertex" |
  "insertEdge" |
  "replaceEdge" |
  "replaceEdgeStart" |
  "replaceEdgeEnd" |
  "deleteEdge"]?: () => any;
};

export enum ProcessStatus {
  Unset,
  Ready,
  Sent,
  AckReceived,
  Processed
}

export type TransactionValue = InsertFn & Revert & { data: any; };
export const transactions = new Map<
  number,
  { status: ProcessStatus; steps: TransactionValue[]; }
>();
// @ts-ignore
export const transactionDetailAdd = (
  txnId: number,
  txnValue: TransactionValue
) => {
  if (!txnId) return;
  const existingTxnValue = transactions.get(txnId) || {
    status: ProcessStatus.Unset,
    steps: [],
  };
  existingTxnValue.steps = [...existingTxnValue.steps, txnValue];
  transactions.set(txnId, existingTxnValue);
};
let txnNo = 1;
export const getNewTxnId = () => ++txnNo;

export const getExistingOrDefaultTxnValue = (txnId: number) => transactions.get(txnId) || {
  status: ProcessStatus.Unset,
  steps: [],
};

export const revertOneTransactionUnSafe = (txnId: number, txnIndex: number) => {
  if (!txnId || !transactions.has(txnId)) return;
  const existingTxnValue = getExistingOrDefaultTxnValue(txnId);
  // todo dont use splice
  const newTxnValue = existingTxnValue.steps.splice(txnIndex, 1);
  newTxnValue[0]?.revert();
};
export const revertTransactionUpTo = (txnId: number, txnIndex: number) => {
  if (!txnId || !transactions.has(txnId)) return;
  const existingTxnValue = transactions.get(txnId) || {
    status: ProcessStatus.Unset,
    steps: [],
  };
  const newTxnValue = existingTxnValue.steps.splice(txnIndex);
  newTxnValue.reverse().forEach((x) => x.revert());
};
export const revertTransaction = (txnId: number) => {
  if (!txnId || !transactions.has(txnId)) return;
  const existingTxnValue = [...(transactions.get(txnId)!.steps || [])];
  batch(() => {
    existingTxnValue.reverse().forEach((txn) => txn.revert());
  });
  transactions.delete(txnId);
};
export const txnHasSteps = (txnId: number) => {
  if (!txnId || !transactions.has(txnId)) return false;
  const existingTxnValue = transactions.get(txnId)!.steps || [];
  return existingTxnValue.length > 0;
};

export const getTransactionData = (txnId: number) => {
  if (!transactions.has(txnId)) return [];
  const existingTxnValue = [...(transactions.get(txnId)!.steps || [])].map(
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
    })
  );
  return existingTxnValue;
};
export let vertexOldIdToNewIdMap = new Map<Id, Id>();
export let edgeOldIdToNewIdMap = new Map<Id, Id>();

export const commitTransaction = (Ws: ServerEventsDispatcher) => {
  let firstReadyTxn = 0;
  // If any pending transaction exist don't send it. // we will clear the previous txn on txn mutation result receive.
  for (const [txnId, value] of transactions.entries()) {
    if (value.status === ProcessStatus.Ready) {
      if (!firstReadyTxn) firstReadyTxn = txnId;
      break;
    } else if (value.status === ProcessStatus.AckReceived ||
      value.status === ProcessStatus.Sent) {
      return;
    }
  }
  if (firstReadyTxn) {
    const existingTxnValue = getTransactionData(firstReadyTxn);
    transactions.get(firstReadyTxn)!.status = ProcessStatus.Sent;
    if (existingTxnValue.length) {
      // Ws.trigger([
      //   [
      //     ["post", "mutate", 0],
      //     [
      //       [
      //         firstReadyTxn,
      //         [...vertexOldIdToNewIdMap],
      //         [...edgeOldIdToNewIdMap],
      //         existingTxnValue,
      //       ],
      //     ],
      //   ],
      // ]);
    }
  }
};
// Bug: if commitTxn is called many times it is sending event many times.
export const commitTxn = (txnId: number, Ws: ServerEventsDispatcher) => {
  if (transactions.has(txnId)) {
    transactions.get(txnId)!.status = ProcessStatus.Ready;
    commitTransaction(Ws);
  }
};
// TODO: future plan: once committed current system should be able to revert and sync to server too.

export function getNewGraphId(): Id {
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
    if (value.status !== ProcessStatus.Processed &&
      value.status !== ProcessStatus.Unset) {
      allTxnProcessed = false;
      break;
    }
  }
  return allTxnProcessed;
}

export function isValidId(startVertexId: Id) {
  return isNumber(startVertexId);
}

