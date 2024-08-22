

import type { Transaction } from "neo4j-driver";

import type { MutationArgs } from "../../types/MutationArgs";

import { fillOldIdToNewIdMap } from "./fillOldIdToNewIdMap";
import { handleMutationObject } from "./handleMutationObject";
import { mutateArgsValidation } from "./validation/mutateArgsValidation";

export async function mutateData(args: MutationArgs, tx: Transaction) {
  const clientToServerVertexIdMap = new Map<number, number>();
  const clientToServerEdgeIdMap = new Map<number, number>();

  const validationResult = mutateArgsValidation(args);
  if (!validationResult) {
    return { error: "Invalid argument shape" };
  }
  if (Object.keys(validationResult).length > 0) {
    return validationResult;
  }

  fillOldIdToNewIdMap(args.vertexIdMap, clientToServerVertexIdMap);
  fillOldIdToNewIdMap(args.edgeIdMap, clientToServerEdgeIdMap);

  const txnResult = [] as any[];
  for (const mutationObject of args.transactions) {
    await handleMutationObject(
      mutationObject,
      tx,
      clientToServerVertexIdMap,
      clientToServerEdgeIdMap,
      txnResult,
    );
  }
  return {
    clientToServerEdgeIdMap,
    clientToServerVertexIdMap,
    data: txnResult,
    txnId: args.txnId,
  };
}
