import type { SetStoreFunction } from "solid-js/store";

import type { GraphInterface } from "~/lib/graph/graph";

import { fetchDataFromMG } from "~/cypher/get/fetchDataFromMG";
import { isValidResponse } from "~/lib/api/isValidResponse";
import { setGraphData } from "~/lib/graph/mutate/setGraphData";
import { getGlobalStore } from "../get/sync/getGlobalStore";

export async function fetchAndSetGraphData(
  graph: GraphInterface,
  setGraph: SetStoreFunction<GraphInterface>,
  expression: string,
  context?: {
    [key: string]: any;
  },
) {
  const result = await fetchDataFromMG(
    { expression, [getGlobalStore(graph).P.url]: true },
    context,
  );

  if (!isValidResponse(result)) {
    // @ts-expect-error ignore
    return { error: result.error || "Error When Loading Data" };
  }
  setGraphData(graph, setGraph, result.graph);

  return result;
}
