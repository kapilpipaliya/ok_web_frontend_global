import type { TransactionPromise } from "neo4j-driver-core";

import type { Vertex } from "~/lib/graph/graph";

import { retryTransaction } from "~/cypher/mutate/mutation_handlers/retryTransaction";

import { getSelectionOptionsBase } from "./getSelectionOptionsBase";
import { handleMutationData } from "./handleMutationData";

export async function getPropsFromMetaExpressionMGCall(
  metaVertex: Vertex,
  data: Vertex[],
  mutationData?: any,
  maxRetries?: number,
) {
  "use server";
  try {
    return await retryTransaction(async (tx) => {
      if (mutationData) {
        const mutationResult = await handleMutationData(mutationData, data, tx);
        if (mutationResult.error) {
          console.log("mutationResult", mutationResult);
          return {};
        }
      }

      const meta = metaVertex.P.meta.split("++");
      const results = [] as { [key: string]: any }[];
      for (const metaPart of meta) {
        const metaRows = await getSelectionOptionsBase(data, metaPart, tx);
        const metaRowsResult = (metaRows.result as Vertex[]) || [];
        const metaData = await getComponentPropertiesMGCall(metaRowsResult, tx);
        results.push(metaData);
      }
      return results.reduce(
        (acc, curr) => {
          Object.assign(acc, curr);
          return acc;
        },
        {} as { [key: string]: any },
      );
    }, 10);
  } catch (e) {
    console.error("getMetaPropsMGCall", e, metaVertex, data);
    return {};
  }
}

async function getComponentPropertiesMGCall(
  metaRows: Vertex[],
  tx: TransactionPromise,
) {
  const metaData = {} as { [key: string]: any };
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
