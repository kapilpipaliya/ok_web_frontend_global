import type { SetStoreFunction } from "solid-js/store";

import type { GraphInterface } from "~/lib/graph/graph";

import { fetchDataFromMG } from "~/cypher/get/fetchDataFromMG";
import { isValidResponse } from "~/lib/api/isValidResponse";
import { setGraphData } from "~/lib/graph/mutate/setGraphData";

export async function fetchAndSetGraphData(
  graph: GraphInterface,
  setGraph: SetStoreFunction<GraphInterface>,
  expression: string,
) {
  const result = await fetchDataFromMG({ expression });

  if (!isValidResponse(result)) {
    // @ts-expect-error ignore
    return { error: result.error || "Error When Loading Data" };
  }
  setGraphData(graph, setGraph, result.graph);

  return result;
}
