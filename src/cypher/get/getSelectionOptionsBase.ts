import type { Edge, Vertex } from "~/lib/graph/graph";
import { evalAsync } from "~/lib/expression_eval";
import jsep from "jsep";
import { replaceExpressionToLabel } from "~/cypher/get/traverse";
import type { ServerResult } from "./ServerResult";
import type { TransactionPromise } from "neo4j-driver-core";


export async function getSelectionOptionsBase(
  vertex: Vertex[],
  collection: string,
  tx: TransactionPromise
): Promise<Partial<ServerResult> & { error: boolean; }> {
  const nodes: { [key: string]: Vertex; } = {};
  const relationships: { [key: string]: Edge; } = {};
  collection = await replaceExpressionToLabel(collection, vertex[0], tx);

  const value = await evalAsync(jsep(collection), {
    vertexes: vertex,
    nodes,
    relationships,
    tx
  });

  if (value) {
    return {
      error: false,
      result: value,
      graph: {
        vertexes: nodes,
        edges: relationships,
      },
    };
  }
  return { error: true };
}
