import type { Store } from "solid-js/store";

import type { GraphInterface } from "~/lib/graph/graph";

import { findVertexByLabelAndUniqueId } from "~/lib/graph/get/sync/findVertex";
import { getNameKeyForCollection } from "~/lib/graph/get/sync/getNameKeyForCollection";

// so in future can use more operators.

export function collectionNameDisplayExpr(
  graph: Store<GraphInterface>,
  collection?: string
) {
  if (!collection) return;
  const collectionVertex = findVertexByLabelAndUniqueId(
    graph,
    "Coll",
    "name",
    collection
  );
  if (collectionVertex) {
    const nameKeys = getNameKeyForCollection(graph, collectionVertex);
    return nameKeys.length === 1
      ? `P.${nameKeys[0]}`
      : nameKeys.map((name) => `$P.${name}`).join(" ");
  }
}
