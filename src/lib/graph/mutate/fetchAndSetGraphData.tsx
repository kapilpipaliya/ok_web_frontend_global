import type { SetStoreFunction } from "solid-js/store";

import type { GraphInterface } from "~/lib/graph/graph";

import { fetchDataFromMG } from "~/cypher/get/fetchDataFromMG";
import { isValidResponse } from "~/lib/api/isValidResponse";
import { setGraphData, type UpdateOptions } from "~/lib/graph/mutate/setGraphData";

import { getGlobalStore } from "../get/sync/getGlobalStore";

export async function fetchAndSetGraphData(
  graph: GraphInterface,
  setGraph: SetStoreFunction<GraphInterface>,
  expression: string,
  context?: {
    [key: string]: any;
  },
  options?: UpdateOptions
) {
  const result = await fetchDataFromMG(
    { expression, [getGlobalStore(graph).P.url]: true },
    context,
  );

  if (!isValidResponse(result)) {
    return { error: result.error || "Error When Loading Data" };
  }
  setGraphData(graph, setGraph, result.graph, options);

  return result;
}
