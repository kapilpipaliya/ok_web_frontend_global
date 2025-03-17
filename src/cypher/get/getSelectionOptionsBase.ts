import type { Edge, Vertex } from "~/lib/graph/graph";

import { evalExpressionAsync } from "~/lib/expression_eval";

import type { ServerResult } from "../types/ServerResult";

import { getDBSessionForSubdomain } from "../session/getSessionForSubdomain";

export async function getSelectionOptionsBase(
  vertex: Vertex[],
  collection: string,
): Promise<Partial<ServerResult> & { error: boolean }> {
  "use server";
  const nodes: { [key: string]: Vertex } = {};
  const relationships: { [key: string]: Edge } = {};

  const { dbSession } = await getDBSessionForSubdomain();

  const value = await evalExpressionAsync(collection, {
    nodes,
    relationships,
    tx: dbSession,
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
