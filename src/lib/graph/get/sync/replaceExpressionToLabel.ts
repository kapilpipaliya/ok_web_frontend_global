import { SetStoreFunction, Store } from "solid-js/store";
import { GraphInterface, Vertex } from "~/lib/graph/graph";
import { getSelectionOptions } from "~/lib/graph/get/sync/traverse";

export function replaceExpressionToLabel(
 graph: Store<GraphInterface>,
 setGraph: SetStoreFunction<GraphInterface>,
 collection: string,
 vertex: Vertex
) {
 if (!collection) return "";
 // example: `{->$0Coll::'P.${IdAttr}'}` will get a collection from expression
 if (collection.includes("{{") && collection.includes("}}")) {
  collection = collection.replace(
   /{{.*}}/,
   getSelectionOptions(
    graph,
    setGraph,
    [vertex],
    collection.match(/{{(.*)}}/)?.[1]! || ""
   ).vertexes || ""
  );
 }
 return collection;
}