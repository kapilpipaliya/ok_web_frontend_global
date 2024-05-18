
import { DBConnection } from "~/cypher_api/functions/dbs";
import { SetStoreFunction, Store } from "solid-js/store";
import { getOutEdges } from "~/cypher_api/functions/getOutEdges";
import { deleteRelationShipMGCall } from "~/cypher_api/functions/deleteRelationShip";
import { newEdgeMGCall } from "~/cypher_api/functions/newEdge";
import { GraphInterface } from "~/lib/graph/graph";
import { compareId, isIdArrayIncludesID } from "~/lib/graph/get/sync/graph_functions";
import { Node } from "~/cypher_api/functions/Type";
import { getInEdge } from "~/lib/graph/get/sync/traverse";
import { getToEdge } from "~/lib/graph/get/sync/traverse";

async function vertexOutEdgeContainVertexMGCall(
  dbConn: DBConnection,
  vertex: Node,
  type: string,
  vertexId: number,
) {
  "use server";
  const outEdgesResult = await getOutEdges(dbConn, vertex.id, type);

  for (const [relationship, endVertex] of outEdgesResult.pairs || []) {
    if (compareId(endVertex, vertexId)) {
      return true;
    }
  }
  return false;
}


async function vertexInEdgeContainVertexMGCall(
  dbConn: DBConnection,
  vertex: Node,
  type: any,
  vertexId: number,
) {
  "use server";
  const inEdgesResult = await getOutEdges(dbConn, vertex.id, type, {
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
  dbConn: DBConnection,
  vertex: Node,
  meta: Node,
  value?: number[] | number,
) {
  "use server";
  // delete removed edges:
  const type = getToEdge(meta, vertex);
  if (!type) console.error("edge type cant be empty");
  const outEdgesResult = await getOutEdges(dbConn, vertex.id, type);
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
    const deleteEdgeResult = await deleteRelationShipMGCall(dbConn, edge.id);
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
    const insertEdgeResult = await newEdgeMGCall(
      dbConn,
      type,
      vertex.id,
      vertexId,
    );
    if (insertEdgeResult.error) console.error(insertEdgeResult.error);
  }
}


export async function setParentValueMGCall(
  dbConn: DBConnection,
  vertex: Node,
  meta: Node,
  value?: number[] | number,
) {
  "use server";
  // delete removed edges:
  const type = getInEdge(meta, vertex);
  if (!type) console.error("edge type cant be empty");
  const previousEdgesResult = await getOutEdges(dbConn, vertex.id, type, {
    isInward: true,
  });
  const previousEdges = previousEdgesResult.pairs! || [];

  let valueArray = [] as number[];

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
    const deleteEdgeResult = await deleteRelationShipMGCall(
      dbConn,
      relationship.id,
    );
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
    const insertEdgeResult = await newEdgeMGCall(
      dbConn,
      type,
      vertexId,
      vertex.id,
    );
    if (insertEdgeResult.error) console.error(insertEdgeResult.error);
  }
}