import type { TransactionPromise } from "neo4j-driver-core";

import type { Vertex } from "~/lib/graph/graph";

import { retryTransaction } from "~/cypher/mutate/mutation_handlers/retryTransaction";

import { getSelectionOptionsBase } from "../getSelectionOptionsBase";
import { handleMutationData } from "../handleMutationData";

export async function getPropsFromMetaExpressionMGCall(
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
      return await getComponentPropertiesMGCall(metaRowsResult, tx);
    }, maxRetries);
  } catch (error) {
    console.error(
      "Error in getPropsFromMetaExpressionMGCall:",
      error,
      metaVertex,
      data,
    );
    return {};
  }
}

async function getComponentPropertiesMGCall(
  metaRows: Vertex[],
  tx: TransactionPromise,
): Promise<{ [key: string]: any }> {
  const metaData: { [key: string]: any } = {};

  for (const curr of metaRows) {
    const result = await getSelectionOptionsBase(
      [curr],
      "->$0Name::'P.name'||::'P.name'",
      tx,
    );
    const key = result.result; // ->$0Name:P.name||:P.name
    if (key && curr.P.value !== undefined) {
      metaData[key] = curr.P.value;
    }
  }

  return metaData;
}
