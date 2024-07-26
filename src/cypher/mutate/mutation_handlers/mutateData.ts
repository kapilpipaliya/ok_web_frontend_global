import type { TransactionPromise } from "neo4j-driver-core";

import type { MutationArgs } from "../../types/MutationArgs";

import { handleMutationObject } from "./handleMutationObject";
import { mapIds } from "./mapIds";
import { mutateArgsValidation } from "./mutateArgsValidation";

export async function mutateData(
  args: MutationArgs,
  tx: TransactionPromise,
): Promise<any> {
  const clientToServerVertexIdMap = new Map<number, number>();
  const clientToServerEdgeIdMap = new Map<number, number>();

  const validationResult = mutateArgsValidation(args);
  if (!validationResult) {
    return { error: true, message: "Invalid argument shape" };
  }
  if (Object.keys(validationResult).length > 0) {
    return validationResult;
  }

  mapIds(args.vertexIdMap, clientToServerVertexIdMap);
  mapIds(args.edgeIdMap, clientToServerEdgeIdMap);

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
