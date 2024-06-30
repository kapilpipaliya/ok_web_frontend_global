// refactor this file
import type { Store } from "solid-js/store";
import { type GraphInterface, IdAttr, type Vertex } from "~/lib/graph/graph";

export function getCollection(
 graph: Store<GraphInterface>,
 item?: Vertex
): string | undefined {
 return item && item.P.collection;
}