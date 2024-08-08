import type { SetStoreFunction } from "solid-js/store";

import type { GraphInterface } from "~/lib/graph/graph";

import { fetchDataFromMG } from "~/cypher/get/fetchDataFromMG";
import { isValidResponse } from "~/lib/api/isValidResponse";
import { setGraphData } from "~/lib/graph/mutate/setGraphData";

export async function getFilesData(
  graph: GraphInterface,
  setGraph: SetStoreFunction<GraphInterface>,
  folderId: string,
) {
  const expression = `id:'${folderId}'<-ParentFolder`;

  const result = await fetchDataFromMG({ expression });

  if (!isValidResponse(result)) {
    // @ts-expect-error ignore
    return { error: result.error || "Error When Loading Data" };
  }
  setGraphData(graph, setGraph, result.graph);

  return result;
}

export async function getRootData(
  graph: GraphInterface,
  setGraph: SetStoreFunction<GraphInterface>,
  folderId?: string,
  fileId?: string,
) {
  let expression;
  if ((folderId || fileId)) {
    // -> operator not return current vertex
    expression = `id:'${folderId || fileId}'->'ParentFolder*'`;
  } else {
    expression = `g:'Folder[root]'`;
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
