import type {ContextType} from "~/cypher/types/ContextType";
import type {Vertex} from "~/lib/graph/graph";

import {evalGetRelatedNodes} from "~/cypher/get/evaluate/evalGetRelatedNodes";

export async function evalGetChildren(
  vertexes: Vertex[],
  edgeType: string,
  context: ContextType = {}
) {
  "use server";
  return await evalGetRelatedNodes(vertexes, edgeType, context, "child");
}

export async function evalGetParents(
  vertexes: Vertex[],
  edgeType: string,
  context: ContextType = {}
) {
  "use server";
  return await evalGetRelatedNodes(vertexes, edgeType, context, "parent");
}

export async function evalGlobalColl(
  edgeType: string,
  context: ContextType = {}
) {
  "use server";
  return await evalGetRelatedNodes([], edgeType, context, "g");
}

export async function evalVertexById(id: string, context: ContextType = {}) {
  "use server";
  return await evalGetRelatedNodes([], id, context, "id");
}