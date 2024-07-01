import type { TransactionPromise } from "neo4j-driver-core";

import type { Vertex } from "~/lib/graph/graph";

import { getSelectionOptionsBase } from "~/cypher/get/getSelectionOptionsBase";


export async function replaceExpressionToLabel(
  collection: string,
  vertex: Vertex,
  tx: TransactionPromise
) {
  if (!collection) return "";
  // example: `{->$0Coll::'P.${IdAttr}'}` will get a collection from expression
  if (collection.includes("{{") && collection.includes("}}")) {
    collection = collection.replace(
      /{{.*}}/,
      (
        await getSelectionOptionsBase(
          [vertex],
          (collection.match(/{{(.*)}}/)?.[1])! || "",
          tx
        )
      ).result || ""
    );
  }
  return collection;
}
