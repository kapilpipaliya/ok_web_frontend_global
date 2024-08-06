import type { SetStoreFunction } from "solid-js/store";

import type { GraphInterface, } from "~/lib/graph/graph";

import { fetchDataFromMG } from "~/cypher/get/fetchDataFromMG";
import { isValidResponse } from "~/lib/api/isValidResponse";
import { setGraphData } from "~/lib/graph/mutate/setGraphData";

export async function getFilesData(graph: GraphInterface, setGraph: SetStoreFunction<GraphInterface>, rootId?: string, fileId?: string) {
  let expression;
  if (!(rootId || fileId)) {
    expression = `g:'Folder[root]'`;
  } else if (rootId) {
    expression = `id:'${rootId}'<-ParentFolder`;
  } else if (fileId) {
    expression = `id:'${fileId}'->ParentFolder`;
  }
  if (!expression) {
    return { error: "Invalid expression" };
  }
  const result = await fetchDataFromMG({ expression });

  if (!isValidResponse(result)) {
    // @ts-expect-error ignore
    return { error: result.error || "Error When Loading Data" };
  }
  setGraphData(graph, setGraph, result.graph);

  return result;
}
