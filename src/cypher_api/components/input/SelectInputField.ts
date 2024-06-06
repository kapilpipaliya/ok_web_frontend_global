import { getOutEdges } from "~/cypher_api/functions/get/getOutEdges";
import { deleteRelationShipMGCall } from "~/cypher_api/functions/mutate/deleteRelationShip";
import { newEdgeMGCall } from "~/cypher_api/functions/mutate/newEdge";
import {
  compareId,
  isIdArrayIncludesID,
} from "~/lib/graph/get/sync/graph_functions";

import { getInEdge } from "~/lib/graph/get/sync/traverse";
import { getToEdge } from "~/lib/graph/get/sync/traverse";
import { getRequestURL } from "vinxi/http";
import { getSubDomain } from "~/cypher_api/server/domain_utils";
import type { Id, Vertex } from "~/lib/graph/graph";

async function vertexOutEdgeContainVertexMGCall(
  vertex: Vertex,
  type: string,
  vertexId: Id,
) {
  "use server";
  const host = getRequestURL().hostname;
  const subDomain = await getSubDomain(host);
  const outEdgesResult = await getOutEdges(vertex.id, type);

  for (const [relationship, endVertex] of outEdgesResult.pairs || []) {
    if (compareId(endVertex, vertexId)) {
      return true;
    }
  }
  return false;
}

async function vertexInEdgeContainVertexMGCall(
  vertex: Vertex,
  type: any,
  vertexId: Id,
) {
  "use server";
  const host = getRequestURL().hostname;
  const subDomain = await getSubDomain(host);
  const inEdgesResult = await getOutEdges(vertex.id, type, {
    isInward: true,
  });
  for (const [relationship, startVertex] of inEdgesResult.pairs || []) {
    if (compareId(startVertex.id, vertexId)) {
      return true;
    }
  }
  return false;
}

export async function setSelectionValueMGCall(
  vertex: Vertex,
  meta: Vertex,
  value?: Id[] | Id,
) {
  "use server";
  const host = getRequestURL().hostname;
  const subDomain = await getSubDomain(host);
  // delete removed edges:
  const type = getToEdge(meta, vertex);
  if (!type) console.error("edge type cant be empty");
  const outEdgesResult = await getOutEdges(vertex.id, type);
  const previousEdges = outEdgesResult.pairs! || [];

  if (!Array.isArray(value)) {
    if (value !== null && value !== undefined) {
      value = [value];
    } else {
      value = [];
    }
  }

  for (const [edge, node] of previousEdges) {
    // we should not delete edge that end to same vertex
    if (isIdArrayIncludesID(value, node.id)) continue;
    const deleteEdgeResult = await deleteRelationShipMGCall(edge.id);
    if (deleteEdgeResult?.error) console.error(deleteEdgeResult.error);
  }

  // add added edges:
  for (const vertexId of value) {
    if (
      isIdArrayIncludesID(
        previousEdges.map((x) => x[1].id),
        vertexId,
      )
    )
      continue;
    const insertEdgeResult = await newEdgeMGCall(type, vertex.id, vertexId);
    if (insertEdgeResult.error) console.error(insertEdgeResult.error);
  }
}

export async function setParentValueMGCall(
  vertex: Vertex,
  meta: Vertex,
  value?: Id[] | Id,
) {
  "use server";
  const host = getRequestURL().hostname;
  const subDomain = await getSubDomain(host);
  // delete removed edges:
  const type = getInEdge(meta, vertex);
  if (!type) console.error("edge type cant be empty");
  const previousEdgesResult = await getOutEdges(vertex.id, type, {
    isInward: true,
  });
  const previousEdges = previousEdgesResult.pairs! || [];

  let valueArray = [] as Id[];

  if (!Array.isArray(value)) {
    if (value !== null && value !== undefined) {
      valueArray = [value];
    } else {
      valueArray = [];
    }
  } else {
    valueArray = value;
  }

  for (const [relationship, startNode] of previousEdges) {
    // we should not delete edge that start with same vertex
    if (isIdArrayIncludesID(valueArray, startNode.id)) continue;
    const deleteEdgeResult = await deleteRelationShipMGCall(relationship.id);
    if (deleteEdgeResult?.error) console.error(deleteEdgeResult.error);
  }

  // add added edges:
  for (const vertexId of valueArray) {
    if (
      isIdArrayIncludesID(
        previousEdges.map((x) => x[1].id),
        vertexId,
      )
    )
      continue;
    const insertEdgeResult = await newEdgeMGCall(type, vertexId, vertex.id);
    if (insertEdgeResult.error) console.error(insertEdgeResult.error);
  }
}
