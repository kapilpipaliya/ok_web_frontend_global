import type { SetStoreFunction, Store } from "solid-js/store";

import type { GraphInterface, Vertex } from "~/lib/graph/graph";

import { getSelectionOptions } from "./getSelectionOptions";

export function getCompProps(graph: Store<GraphInterface>, comp: Vertex) {
  return (getSelectionOptions(graph, () => 0, "->$0Prop", [comp]).vertexes || []).reduce(
    (acc, curr) => {
      if (curr.P.name && curr.P.value !== undefined) {
        acc[curr.P.name] = curr.P.value;
      }
      return acc;
    },
    {} as { [key: string]: any },
  );
}

export function getRowProps(
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
  comp: Vertex,
) {
  return (getSelectionOptions(graph, () => 0, "->$0Prop", [comp]).vertexes || []).reduce(
    (acc, curr) => {
      const key = getSelectionOptions(
        graph,
        setGraph,
        "->$0Name::'P.name'",
        [curr],
      ).vertexes;
      if (key && curr.P.value !== undefined) {
        acc[key] = curr.P.value;
      }

      return acc;
    },
    {} as { [key: string]: any },
  );
}

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
  if(!metaVertex.P.meta) return {};
  const meta = metaVertex.P.meta.split("++");
  const results = [] as { [key: string]: any }[];
  for (const metaPart of meta) {
    const metaRows =
      getSelectionOptions(graph, setGraph, metaPart, [data]).vertexes || [];
    const metaData = getComponentProperties(graph, setGraph, metaRows);
    results.push(metaData);
  }
  return results.reduce(
    (acc, curr) => {
      Object.assign(acc, curr);
      return acc;
    },
    {} as { [key: string]: any },
  );
}


