import type { TransactionPromise } from "neo4j-driver-core";

import jsep from "jsep";

import type { Edge, Vertex } from "~/lib/graph/graph";

import { evalAsync } from "~/lib/expression_eval";

import type { ServerResult } from "./ServerResult";

import { replaceExpressionToLabel } from "./replaceExpressionToLabel";

export async function getSelectionOptionsBase(
  vertex: Vertex[],
  collection: string,
  tx: TransactionPromise,
): Promise<{ error: boolean } & Partial<ServerResult>> {
  const nodes: { [key: string]: Vertex } = {};
  const relationships: { [key: string]: Edge } = {};
  collection = await replaceExpressionToLabel(collection, vertex[0], tx);

  const value = await evalAsync(jsep(collection), {
    nodes,
    relationships,
    tx,
    vertexes: vertex,
  });

  if (value) {
    return {
      error: false,
      graph: {
        edges: relationships,
        vertexes: nodes,
      },
      result: value,
    };
  }
  return { error: true };
}
