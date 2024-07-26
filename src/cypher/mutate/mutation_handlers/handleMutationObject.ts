import { isObject } from "~/lib/utils";

import { handleDeleteEdge } from "./handleDeleteEdge";
import { handleDeleteVertex } from "./handleDeleteVertex";
import { handleInsert } from "./handleInsert";
import { handleInsertEdge } from "./handleInsertEdge";
import { handleMerge } from "./handleMerge";
import { handleReplace } from "./handleReplace";
import { handleReplaceEdge } from "./handleReplaceEdge";
import { handleReplaceEdgeEnd } from "./handleReplaceEdgeEnd";
import { handleReplaceEdgeStart } from "./handleReplaceEdgeStart";

export async function handleMutationObject(
  mutationObject: any,
  tx: any,
  clientToServerVertexIdMap: Map<number, number>,
  clientToServerEdgeIdMap: Map<number, number>,
  txnResult: any[],
) {
  if (mutationObject.insert && isObject(mutationObject.insert)) {
    await handleInsert(
      mutationObject.insert,
      tx,
      clientToServerVertexIdMap,
      txnResult,
    );
  }
  if (mutationObject.replace && isObject(mutationObject.replace)) {
    await handleReplace(
      mutationObject.replace,
      tx,
      clientToServerVertexIdMap,
      txnResult,
    );
  }
  if (mutationObject.merge && isObject(mutationObject.merge)) {
    await handleMerge(
      mutationObject.merge,
      tx,
      clientToServerVertexIdMap,
      txnResult,
    );
  }
  if (mutationObject.deleteVertex) {
    await handleDeleteVertex(
      mutationObject.deleteVertex,
      tx,
      clientToServerVertexIdMap,
      txnResult,
    );
  }
  if (mutationObject.insertEdge) {
    await handleInsertEdge(
      mutationObject.insertEdge,
      tx,
      clientToServerVertexIdMap,
      clientToServerEdgeIdMap,
      txnResult,
    );
  }
  if (mutationObject.replaceEdge) {
    await handleReplaceEdge(
      mutationObject.replaceEdge,
      tx,
      clientToServerVertexIdMap,
      clientToServerEdgeIdMap,
      txnResult,
    );
  }
  if (mutationObject.replaceEdgeStart) {
    await handleReplaceEdgeStart(
      mutationObject.replaceEdgeStart,
      tx,
      clientToServerVertexIdMap,
      clientToServerEdgeIdMap,
      txnResult,
    );
  }
  if (mutationObject.replaceEdgeEnd) {
    await handleReplaceEdgeEnd(
      mutationObject.replaceEdgeEnd,
      tx,
      clientToServerVertexIdMap,
      clientToServerEdgeIdMap,
      txnResult,
    );
  }
  if (mutationObject.deleteEdge) {
    await handleDeleteEdge(
      mutationObject.deleteEdge,
      tx,
      clientToServerVertexIdMap,
      clientToServerEdgeIdMap,
      txnResult,
    );
  }
}
