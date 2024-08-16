import { SetStoreFunction } from "solid-js/store";

import { GraphInterface } from "~/lib/graph/graph";

import { getFilesData } from "./sidebar/getFilesData";

export async function fetchChildrenDataBatch(
  graph: GraphInterface,
  setGraph: SetStoreFunction<GraphInterface>,
  toParentEdgeType: string,
  expandedKeys: string[]
) {
  const data = await getFilesData(graph, setGraph, toParentEdgeType, expandedKeys);
  if ('result' in data && Array.isArray(data.result) && data.result.length > 0) {
    await getFilesData(graph, setGraph, toParentEdgeType, data.result.map(v => v.id));
  }
}
