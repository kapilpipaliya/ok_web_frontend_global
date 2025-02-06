import type { Transaction } from "neo4j-driver";

import type { Edge, Vertex } from "~/lib/graph/graph";

import { evalExpressionAsync } from "~/lib/expression_eval";

import type { ServerResult } from "../types/ServerResult";

export async function getSelectionOptionsBase(
  vertex: Vertex[],
  collection: string,
  tx: Transaction,
): Promise<Partial<ServerResult> & { error: boolean }> {
  const nodes: { [key: string]: Vertex } = {};
  const relationships: { [key: string]: Edge } = {};

  const value = await evalExpressionAsync(collection, {
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
