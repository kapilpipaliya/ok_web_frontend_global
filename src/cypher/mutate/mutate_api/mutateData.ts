import { mutateArgsValidation } from "./mutateArgsValidation";
import { handleMutationObject } from "./handleMutationObject";
import { mapIds } from "./mapIds";
import type { MutationArgs } from "./MutationArgs";
import type { TransactionPromise } from "neo4j-driver-core";

export async function mutateData(
  args: MutationArgs,
  tx: TransactionPromise,
  maxRetries = 1
): Promise<any> {
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
  for (const mutationObject of args.transactions) {
    let attempt = 0;
    do {
      try {
        await handleMutationObject(mutationObject, tx, clientToServerVertexIdMap, clientToServerEdgeIdMap, txnResult);
        break;
      } catch (error: any) {
        if (error.message.includes("Cannot resolve conflicting transactions. You can retry this transaction when the conflicting transaction is finished")) {
          attempt++;
          if (attempt < maxRetries) {
            console.log(`Attempt ${attempt} failed. Retrying...`);
            await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before retrying
          } else {
            console.error('Max retries reached. Could not handle mutation object.');
            return { error: 'Max retries reached. Could not handle mutation object.' };
          }
        } else {
          console.error('Failed to handle mutation object:', error);
          throw error;
        }
      }
    } while (attempt < maxRetries);
  }
  return { txnId: args.txnId, data: txnResult, clientToServerVertexIdMap, clientToServerEdgeIdMap };
}
