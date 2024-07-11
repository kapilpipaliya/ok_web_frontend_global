// TODO:
//  if possible, use Name Keys, if not found use "name"
//  key else Primary Keys will be used.
// TODO:
import type { Vertex } from "~/lib/graph/graph";

import type { ServerResult } from "./ServerResult";

import { retryTransaction } from "../mutate/mutate_api/retryTransaction";
import { getSelectionOptionsBase } from "./getSelectionOptionsBase";
import { handleMutationData } from "./handleMutationData";

export async function getSelectionOptionsMGCall(
  vertex: Vertex[],
  collection: string,
  mutationData?: any,
  maxRetries?: number,
  strict?: boolean,
): Promise<{ error: boolean } & Partial<ServerResult>> {
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
          return { error: true };
        }
      }
      return await getSelectionOptionsBase(vertex, collection, tx);
    }, maxRetries ?? 10);
  } catch (e) {
    console.error("getSelectionOptionsMGCall", e, vertex, collection);
    return { error: true };
  }
}
