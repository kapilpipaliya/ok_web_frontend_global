import type { SetStoreFunction } from "solid-js/store";

import type { GraphInterface, Vertex } from "~/lib/graph/graph";

import { fetchDataFromMG } from "~/cypher/get/fetchDataFromMG";
import { isValidResponse } from "~/lib/api/isValidResponse";
import { setGraphData } from "~/lib/graph/mutate/setGraphData";

export async function getRootLevelData(graph: GraphInterface, setGraph: SetStoreFunction<GraphInterface>, root?: Vertex) {
  const result = await fetchDataFromMG({
    expression: !root ? `g:'FileDirectory[root]'` : `id:'${root.id}'->FileDirectory`
  });

  if (!isValidResponse(result)) {
    // @ts-expect-error ignore
    return { error: result.error || "Error When Loading Data" };
  }
  setGraphData(graph, setGraph, result.graph);

  return result;
}
