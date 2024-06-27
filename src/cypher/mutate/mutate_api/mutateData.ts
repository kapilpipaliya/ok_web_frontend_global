import type { Session } from "neo4j-driver";
import { mutateArgsValidation } from "./mutateArgsValidation";
import { handleMutationObject } from "./handleMutationObject";
import { mapIds } from "./mapIds";
import type { MutationArgs } from "./MutationArgs";

export async function mutateData(
  args: MutationArgs,
  session: Session
): Promise<any> {
  const tx = session.beginTransaction();
  const clientToServerVertexIdMap = new Map<number, number>();
  const clientToServerEdgeIdMap = new Map<number, number>();


  const validationResult = mutateArgsValidation(args);
  if (!validationResult) {
    return { error: true, message: 'Invalid argument shape' };
  }
  if (Object.keys(validationResult).length > 0) {
    return validationResult;
  }

  mapIds(args.vertexIdMap, clientToServerVertexIdMap);
  mapIds(args.edgeIdMap, clientToServerEdgeIdMap);

  const txnResult = [] as any[];
  try {
    for (const mutationObject of args.transactions) {
      await handleMutationObject(mutationObject, tx, clientToServerVertexIdMap, clientToServerEdgeIdMap, txnResult);
    }

    await tx.commit();

    return {txnId: args.txnId, data:txnResult};
  } catch (error: any) {
    await tx.rollback();
    console.error('Transaction failed:', error);
    return { error: 'Transaction failed: ' + error.message };
  } finally {
    await tx.close();
    session.close();
  }
}
