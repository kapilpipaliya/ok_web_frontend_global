import type { SetStoreFunction } from "solid-js/store";

import type { MongoFilter } from "~/cypher/get/evaluate/mongoToCypher";
import type { GraphInterface } from "~/lib/graph/graph";

import { fetchAndSetGraphData } from "~/lib/graph/mutate/fetchAndSetGraphData";

export async function getRootData(
  graph: GraphInterface,
  setGraph: SetStoreFunction<GraphInterface>,
  parentVertexLabel: string,
  filter: MongoFilter,
) {
  return await fetchAndSetGraphData(
    graph,
    setGraph,
    `g:'${parentVertexLabel}[$1]'`,
    { $1: { filter }, nodes: {}, relationships: {} },
  );
}
