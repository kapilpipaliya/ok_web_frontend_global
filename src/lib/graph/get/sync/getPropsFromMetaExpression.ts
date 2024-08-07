import type { SetStoreFunction, Store } from "solid-js/store";

import type { GraphInterface, Vertex } from "~/lib/graph/graph";

import { getSelectionOptions } from "./getSelectionOptions";

function getComponentProperties(
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
  metaRows: Vertex[],
) {
  const metaData = metaRows.reduce(
    (acc, curr) => {
      const key = getSelectionOptions(
        graph,
        setGraph,
        "->$0Name::'P.name'||::'P.name'",
        [curr],
      ).vertexes;
      if (key && curr.P.value !== undefined) {
        acc[key] = curr.P.value;
      }
      return acc;
    },
    {} as { [key: string]: any },
  );
  return metaData;
}

export function getPropsFromMetaExpression(
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
  metaVertex: Vertex,
  data: Vertex,
) {
  const meta = metaVertex.P.meta;
  if (!meta) {
    return {};
  }

  const metaRows =
    getSelectionOptions(graph, setGraph, meta, [data]).vertexes || [];
  return getComponentProperties(graph, setGraph, metaRows);
}
