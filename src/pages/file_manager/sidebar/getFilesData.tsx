import type { SetStoreFunction } from "solid-js/store";

import type { GraphInterface, } from "~/lib/graph/graph";

import { fetchDataFromMG } from "~/cypher/get/fetchDataFromMG";
import { isValidResponse } from "~/lib/api/isValidResponse";
import { setGraphData } from "~/lib/graph/mutate/setGraphData";

export async function getFilesData(graph: GraphInterface, setGraph: SetStoreFunction<GraphInterface>, rootId?: string) {
  const result = await fetchDataFromMG({
    expression: !rootId ? `g:'Folder[root]'` : `id:'${rootId}'<-ParentFolder`
  });

  if (!isValidResponse(result)) {
    // @ts-expect-error ignore
    return { error: result.error || "Error When Loading Data" };
  }
  setGraphData(graph, setGraph, result.graph);

  return result;
}
