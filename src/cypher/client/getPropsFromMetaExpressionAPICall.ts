import type { Transaction } from "neo4j-driver";

import type { Vertex } from "~/lib/graph/graph";

import { retryTransaction } from "~/cypher/mutate/mutation_handlers/retryTransaction";

import { getSelectionOptionsBase } from "../get/getSelectionOptionsBase";
import { handleMutationData } from "../get/handleMutationData";

export async function getPropsFromMetaExpressionAPICall(
  metaVertex: Vertex,
  data: Vertex[],
  mutationData?: any,
  maxRetries = 10,
): Promise<{ [key: string]: any }> {
  "use server";
  try {
    return await retryTransaction(async (tx) => {
      if (mutationData) {
        const mutationResult = await handleMutationData(mutationData, data, tx);
        if (mutationResult.error) {
          return {};
        }
      }

      const metaRows = await getSelectionOptionsBase(
        data,
        metaVertex.P.meta,
        tx,
      );
      const metaRowsResult = (metaRows.result as Vertex[]) || [];
      return await getComponentPropertiesAPICall(metaRowsResult, tx);
    }, maxRetries);
  } catch (error) {
    console.error(
      "Error in getPropsFromMetaExpressionAPICall:",
      error,
      metaVertex,
      data,
    );
    return {};
  }
}

async function getComponentPropertiesAPICall(
  metaRows: Vertex[],
  tx: Transaction,
): Promise<{ [key: string]: any }> {
  const metaData: { [key: string]: any } = {};

  for (const curr of metaRows) {
    const result = await getSelectionOptionsBase(
      [curr],
      "->$0Name::'P.key'||::'P.key'",
      tx,
    );
    const key = result.result; // ->$0Name:P.key||:P.key
    if (key && curr.P.value !== undefined) {
      metaData[key] = curr.P.value;
    }
  }

  return metaData;
}
