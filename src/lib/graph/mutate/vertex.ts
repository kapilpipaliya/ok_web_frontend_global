import { pipe } from "@mobily/ts-belt";
import { klona } from "klona";
import { batch } from "solid-js";
import { type SetStoreFunction, type Store, reconcile } from "solid-js/store";

import type { GraphInterface, Id, Vertex } from "~/lib/graph/graph";

import { useToast } from "~/components/Toast";
import { deleteEdge } from "~/lib/graph/mutate/edge";

import {
  edgeOldIdToNewIdMap,
  vertexOldIdToNewIdMap,
} from "../transaction/TransactionType";
import { transactionDetailAdd } from "../transaction/transactionDetailAdd";

// return a new Vertex
export function newVertex(
  id: Id,
  labels: string[],
  properties?: { [key: string]: any },
): Vertex {
  return { IN: {}, L: labels, OUT: {}, P: properties || {}, id };
}

// add a new vertex to the graph
export function addNewVertex(
  txnId: number,
  vertex: Vertex,
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
): {
  error: boolean | string;
  txnDetailIndex?: number;
} {
  const actualVertexId = vertexOldIdToNewIdMap.get(vertex.id) || vertex.id;
  if (graph.vertexes[actualVertexId]) {
    return { error: "Vertex ID Already exist" };
  }
  const existedVertexes = vertex.L.filter(
    (label) =>
      Array.isArray(graph.vertexLabelIdMap[label]) &&
      graph.vertexLabelIdMap[label].includes(actualVertexId),
  );
  if (existedVertexes.length) {
    return { error: "vertex ID already exist while adding new vertex" };
  }
  setGraph("vertexes", actualVertexId, updateVertex(klona(vertex)));
  vertex.L.forEach((label) =>
    setGraph("vertexLabelIdMap", label, (vertexIds: any) =>
      Array.isArray(vertexIds)
        ? [...vertexIds, actualVertexId]
        : [actualVertexId],
    ),
  );
  const data = updateVertex(klona(vertex));
  transactionDetailAdd(
    txnId,
    {
      data,
      insert: () => {
        return updateVertex(data);
      },
      redo: () => {
        return addNewVertex(0, updateVertex(data), graph, setGraph);
      },
      revert: () => {
        const actualVertexId2 =
          vertexOldIdToNewIdMap.get(actualVertexId) || actualVertexId;
        return deleteVertex(0, actualVertexId2, graph, setGraph);
      },
    },
    graph,
  );
  return {
    error: false,
    txnDetailIndex: txnId
      ? graph.transactions.get(txnId)?.steps.length - 1
      : -1,
  };
}

// replace a vertex properties
export function replaceVertexProperties(
  txnId: number,
  vertexId: Id,
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
  properties: { [key: string]: any },
): { error: boolean | string; txnDetailIndex?: number } {
  const actualVertexId = vertexOldIdToNewIdMap.get(vertexId) || vertexId;
  if (!graph.vertexes[actualVertexId]) {
    return { error: "Vertex ID is not valid" };
  }
  const originalProperties = klona(graph.vertexes[actualVertexId].P);
  setGraph("vertexes", actualVertexId, "P", reconcile(klona(properties)));
  const data = updateVertex(klona(graph.vertexes[actualVertexId]));
  transactionDetailAdd(
    txnId,
    {
      data,
      redo: () =>
        replaceVertexProperties(0, actualVertexId, graph, setGraph, data.P),
      replace: () => updateVertex(klona(graph.vertexes[actualVertexId])),
      revert: () =>
        replaceVertexProperties(
          0,
          actualVertexId,
          graph,
          setGraph,
          originalProperties,
        ),
    },
    graph,
  );
  return {
    error: false,
    txnDetailIndex: txnId
      ? graph.transactions.get(txnId)?.steps.length - 1
      : -1,
  };
}

// mergeVertexProperties(0, vertexId, {props: { title }}) } }} will replace props.
export function mergeVertexProperties(
  txnId: number,
  vertexId: Id,
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
  properties: { [key: string]: any },
  types?: { [key: string]: any },
): { error: boolean | string; txnDetailIndex?: number } {
  const actualVertexId = vertexOldIdToNewIdMap.get(vertexId) || vertexId;
  const vertex = graph.vertexes[actualVertexId];
  if (!vertex) {
    return { error: `Vertex ID is not valid ${actualVertexId}` };
  }
  const originalProperties = {} as { [key: string]: any };
  for (const property in properties) {
    originalProperties[property] = vertex.P[property];
  }
  // It will only merge top level properties.
  setGraph("vertexes", actualVertexId, "P", klona(properties));

  transactionDetailAdd(
    txnId,
    {
      data: properties,
      merge: () => {
        const actualVertexId2 =
          vertexOldIdToNewIdMap.get(actualVertexId) || actualVertexId;
        return updateVertex(
          Object.assign({}, graph.vertexes[actualVertexId2], {
            properties: klona(properties),
          }),
        );
      },
      redo: () => {
        const actualVertexId2 =
          vertexOldIdToNewIdMap.get(actualVertexId) || actualVertexId;
        return mergeVertexProperties(
          0,
          actualVertexId2,
          graph,
          setGraph,
          klona(properties),
        );
      },
      revert: () => {
        const actualVertexId2 =
          vertexOldIdToNewIdMap.get(actualVertexId) || actualVertexId;
        return mergeVertexProperties(
          0,
          actualVertexId2,
          graph,
          setGraph,
          klona(originalProperties),
        );
      },
    },
    graph,
  );
  return {
    error: false,
    txnDetailIndex: txnId
      ? graph.transactions.get(txnId)?.steps.length - 1
      : -1,
  };
}

// delete a vertex
export function deleteVertex(
  txnId: number,
  vertexId: Id,
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
): {
  error: boolean | string;
  txnDetailIndex?: number;
} {
  const { showErrorToast } = useToast();
  const actualVertexId = vertexOldIdToNewIdMap.get(vertexId) || vertexId;

  if (!graph.vertexes[actualVertexId]) {
    return { error: "Vertex ID is not valid" };
  }
  // TODO:
  //  this must check
  //  if the in and out edges are empty else not allow to delete.

  const vertex = klona(graph.vertexes[actualVertexId]);

  if (
    Object.keys(vertex.OUT).filter((label) => label !== "AttrInst").length > 0
  ) {
    showErrorToast(
      `there are multiple children exist when deleting ${vertex.L[0]} (${actualVertexId})`,
    );
    return { error: "Vertex Children Exist When deleting vertex" };
  }
  for (const attrInstEdgeId of vertex.OUT.AttrInst || []) {
    const attrInstEdge = graph.edges[attrInstEdgeId];
    if (attrInstEdge) {
      const endVertex = graph.vertexes[attrInstEdge.E];
      deleteEdge(txnId, attrInstEdgeId, graph, setGraph);
      if (endVertex) {
        for (const metaAttrEdgeId of endVertex.OUT.MetaAttr || []) {
          const metaAttrEdge = graph.edges[metaAttrEdgeId];
          if (metaAttrEdge) {
            const endVertex = graph.vertexes[metaAttrEdge.E];
            deleteEdge(txnId, metaAttrEdgeId, graph, setGraph);
            if (endVertex) {
              deleteVertex(txnId, metaAttrEdge.E, graph, setGraph);
            }
          }
        }

        deleteVertex(txnId, attrInstEdge.E, graph, setGraph);
      }
    }
  }

  if (Object.keys(vertex.IN).length > 0) {
    showErrorToast(
      `there are multiple Parent exist when deleting ${vertex.L[0]} (${actualVertexId})`,
    );
    return { error: "Vertex Children Exist When deleting vertex" };
  }

  batch(() => {
    graph.vertexes[actualVertexId].L.forEach((label) =>
      // @ts-ignore
      setGraph("vertexLabelIdMap", label, (vertexIds) =>
        Array.isArray(vertexIds) && vertexIds.includes(actualVertexId)
          ? pipe(
              vertexIds.filter((vId) => vId !== actualVertexId),
              (fIds) => (fIds.length ? fIds : undefined),
            )
          : vertexIds,
      ),
    );
    // @ts-ignore
    setGraph("vertexes", actualVertexId, undefined);
  });
  const data = klona(vertex);
  transactionDetailAdd(
    txnId,
    {
      data,
      deleteVertex: () => updateVertex(data),
      redo: () => {
        const actualVertexId2 =
          vertexOldIdToNewIdMap.get(actualVertexId) || actualVertexId;
        return deleteVertex(0, actualVertexId2, graph, setGraph);
      },
      revert: () => {
        return addNewVertex(0, updateVertex(vertex), graph, setGraph);
      },
    },
    graph,
  );
  return {
    error: false,
    txnDetailIndex: txnId
      ? graph.transactions.get(txnId)?.steps.length - 1
      : -1,
  };
}

function updateVertex(vertex: Vertex) {
  vertex.id = vertexOldIdToNewIdMap.get(vertex.id) || vertex.id;
  Object.entries(vertex.IN).forEach(([edgeType, edgeIds]) => {
    vertex.IN[edgeType] = edgeIds.map(
      (id) => edgeOldIdToNewIdMap.get(id) || id,
    );
  });

  Object.entries(vertex.OUT).forEach(([edgeType, edgeIds]) => {
    vertex.OUT[edgeType] = edgeIds.map(
      (id) => edgeOldIdToNewIdMap.get(id) || id,
    );
  });
  return vertex;
}

// update vertex id when we receive new id from api response
export function updateVertexId(
  oldVertexId: Id,
  newVertexId: Id,
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
) {
  if (!graph.vertexes[oldVertexId]) {
    return { error: "Vertex ID is not valid" };
  }
  if (graph.vertexes[newVertexId]) {
    return { error: "new Vertex ID is not valid" };
  }
  setGraph("vertexes", newVertexId, graph.vertexes[oldVertexId]);
  setGraph("vertexes", newVertexId, "id", newVertexId);
  // @ts-ignore
  setGraph("vertexes", oldVertexId, undefined);
  // TODO: replace id exactly at same position
  graph.vertexes[newVertexId].L.forEach((label) =>
    setGraph("vertexLabelIdMap", label, (ids) =>
      ids.filter((id) => id !== oldVertexId),
    ),
  );
  graph.vertexes[newVertexId].L.forEach((label) =>
    setGraph("vertexLabelIdMap", label, (vertexIds) =>
      Array.isArray(vertexIds) ? [...vertexIds, newVertexId] : [newVertexId],
    ),
  );
  // v->E--in->V-out-->E->v
  Object.entries(graph.vertexes[newVertexId].OUT).forEach(
    ([edgeType, edgeIds]) => {
      setGraph("edges", edgeIds, "S", newVertexId);
    },
  );
  Object.entries(graph.vertexes[newVertexId].IN).forEach(
    ([edgeType, edgeIds]) => {
      setGraph("edges", edgeIds, "E", newVertexId);
    },
  );
  return { error: "" };
}
