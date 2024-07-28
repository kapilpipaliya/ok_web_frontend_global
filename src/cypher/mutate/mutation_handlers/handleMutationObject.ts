import { isObject } from "~/lib/data_structure/object/isObject";

import { handleDeleteEdge } from "./handlers/handleDeleteEdge";
import { handleDeleteVertex } from "./handlers/handleDeleteVertex";
import { handleInsert } from "./handlers/handleInsert";
import { handleInsertEdge } from "./handlers/handleInsertEdge";
import { handleMerge } from "./handlers/handleMerge";
import { handleReplace } from "./handlers/handleReplace";
import { handleReplaceEdge } from "./handlers/handleReplaceEdge";
import { handleReplaceEdgeEnd } from "./handlers/handleReplaceEdgeEnd";
import { handleReplaceEdgeStart } from "./handlers/handleReplaceEdgeStart";

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
