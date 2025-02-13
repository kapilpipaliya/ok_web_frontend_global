// TODO:
//  if possible, use Name Keys, if not found use "key"
//  key else Primary Keys will be used.
// TODO:
import type { Vertex } from "~/lib/graph/graph";

import type { ServerResult } from "../../types/ServerResult";

import { retryTransaction } from "../../mutate/mutation_handlers/retryTransaction";
import { getSelectionOptionsBase } from "../getSelectionOptionsBase";
import { handleMutationData } from "../handleMutationData";

export async function getSelectionOptionsAPICall(
  vertex: Vertex[],
  collection: string,
  mutationData?: any,
  maxRetries?: number,
  _strict?: boolean,
): Promise<Partial<ServerResult> & { error: boolean }> {
  "use server";

  try {
    return await retryTransaction(async (tx) => {
      if (mutationData) {
        const mutationError = await handleMutationData(
          mutationData,
          vertex,
          tx,
        );
        if (mutationError.error) {
          return { error: mutationError.error };
        }
      }
      return await getSelectionOptionsBase(vertex, collection, tx);
    }, maxRetries ?? 10);
  } catch (e: any) {
    console.error("getSelectionOptionsAPICall", e, vertex, collection);
    return { error: e.message };
  }
}
