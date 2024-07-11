import type { SetStoreFunction, Store } from "solid-js/store";

import type { GraphInterface, Vertex } from "~/lib/graph/graph";

import { getSelectionOptions } from "./getSelectionOptions";

export function replaceExpressionToLabel(
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
  collection: string,
  vertex: Vertex,
) {
  if (!collection) return "";
  // example: `{->$0Coll::'P.${IdAttr}'}` will get a collection from expression
  if (collection.includes("{{") && collection.includes("}}")) {
    collection = collection.replace(
      /{{.*}}/,
      getSelectionOptions(
        graph,
        setGraph,
        collection.match(/{{(.*)}}/)?.[1]! || "",
        [vertex],
      ).vertexes || "",
    );
  }
  return collection;
}
