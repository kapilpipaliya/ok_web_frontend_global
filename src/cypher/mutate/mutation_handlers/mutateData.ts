import type { Transaction } from "neo4j-driver";

import type { EdgeMap, Id, VertexMap } from "~/lib/graph/graph";

import type { MutationArgs, MutationResult } from "../../types/MutationArgs";

import { fillOldIdToNewIdMap } from "./fillOldIdToNewIdMap";
import { handleMutationObject } from "./handleMutationObject";
import { mutateArgsValidation } from "./validation/mutateArgsValidation";

export async function mutateData(args: MutationArgs, tx: Transaction) {
  const clientToServerVertexIdMap = new Map<Id, Id>();
  const clientToServerEdgeIdMap = new Map<Id, Id>();

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
  const deletedVertexes: Id[] = [];
  const deletedEdges: Id[] = [];
  const vertexes: VertexMap = {};
  const edges: EdgeMap = {};

  for (const mutationObject of args.transactions) {
    await handleMutationObject(
      mutationObject,
      tx,
      clientToServerVertexIdMap,
      clientToServerEdgeIdMap,
      txnResult,
      vertexes,
      edges,
      deletedVertexes,
      deletedEdges,
    );
  }

  return {
    clientToServerEdgeIdMap,
    clientToServerVertexIdMap,
    data: txnResult,
    graph: {
      deleted_edges: deletedEdges.length > 0 ? deletedEdges : undefined,
      deleted_vertexes:
        deletedVertexes.length > 0 ? deletedVertexes : undefined,
      edges,
      vertexes,
    },
    txnId: args.txnId,
  } as MutationResult;
}
