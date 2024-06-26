// TODO:
//  if possible, use Name Keys, if not found use "name"
//  key else Primary Keys will be used.
// TODO:
import type {Edge, Vertex} from "~/lib/graph/graph";
import {evalAsync} from "~/lib/expression_eval";
import jsep from "jsep";
import {replaceExpressionToLabel} from "~/cypher/get/traverse";
import type { ServerResult } from "./ServerResult";

export async function getSelectionOptionsMGCall(
  vertex: Vertex[],
  collection: string,
  strict?: boolean,
): Promise<Partial<ServerResult> & { error: boolean }> {
  "use server";
  const nodes: { [key: string]: Vertex } = {};
  const relationships: { [key: string]: Edge } = {};
  collection = await replaceExpressionToLabel(collection, vertex[0]);
  try {
    const value = await evalAsync(jsep(collection), {
      vertexes: vertex,
      nodes,
      relationships,
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
    return {error: true};
  } catch (e) {
    console.error(e, vertex, collection);
    return {error: true};
  }
}