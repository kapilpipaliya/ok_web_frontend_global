import { klona } from "klona";
import { batch, untrack } from "solid-js";
import { reconcile, type SetStoreFunction, type Store } from "solid-js/store";

import type { GraphInterface, Id, Vertex } from "~/lib/graph/graph";

import { isObject } from "~/lib/data_structure/object/isObject";
import { broadcastToAllChannels } from "~/lib/graph/mutate/core/channel";

import {
  getEdgeOldIdToNewIdMap,
  getVertexOldIdToNewIdMap,
} from "../../get/sync/store/getGlobalStore";
import { transactionDetailAdd } from "../../transaction/core/transactionDetailAdd";
import { getLastTxnIndex } from "../../transaction/value/getLastTxnIndex";

// add a new vertex to the graph
export function addNewVertex(
  txnId: number,
  vertex: Vertex,
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
  options?: { skipPostMessage?: string },
): {
  error: string;
  txnDetailIndex?: number;
} {
  return untrack(() => {
    const actualVertexId =
      getVertexOldIdToNewIdMap(graph)[vertex.id] || vertex.id;
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
    const actualVertex = updateVertexIdsToNew(klona(vertex), graph, true);
    setGraph("vertexes", actualVertexId, { ...actualVertex, IN: {}, OUT: {} });
    for (const label of vertex.L) {
      setGraph("vertexLabelIdMap", label, (vertexIds: Id[]) =>
        Array.isArray(vertexIds)
          ? [...vertexIds, actualVertexId]
          : [actualVertexId],
      );
    }
    const data = klona(actualVertex);
    transactionDetailAdd(
      txnId,
      {
        data,
        id: actualVertexId,
        insert: "insertVertex",
        originalData: klona(vertex),
      },
      graph,
      setGraph,
      options,
    );
    broadcastToAllChannels(
      graph.broadcastChannels,
      options?.skipPostMessage ?? "",
      { addNewVertex: { txnId, vertex } },
    );
    return {
      error: "",
      txnDetailIndex: getLastTxnIndex(txnId, graph),
    };
  });
}

// delete a vertex
export function deleteVertex(
  txnId: number,
  vertexId: Id,
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
  options?: { skipPostMessage?: string },
): {
  error: boolean | string;
  txnDetailIndex?: number;
} {
  return untrack(() => {
    const actualVertexId =
      getVertexOldIdToNewIdMap(graph)[vertexId] || vertexId;

    if (!graph.vertexes[actualVertexId]) {
      return { error: "Vertex ID is not valid" };
    }
    // TODO:
    //  this must check
    //  if the in and out edges are empty else not allow to delete.

    const vertex = graph.vertexes[actualVertexId];

    if (
      Object.keys(vertex.OUT).filter((label) => label !== "AttrInst").length > 0
    ) {
      alert(
        `there are multiple children exist when deleting ${vertex.L[0]} (${actualVertexId})`,
      );
      return { error: "Vertex Children Exist When deleting vertex" };
    }

    if (Object.keys(vertex.IN).length > 0) {
      const parentInfo = Object.entries(vertex.IN)
        .map(([edgeType, edgeIds]) => {
          const parents = edgeIds.map(
            (id) => graph.vertexes[graph.edges[id].S],
          );
          return `${edgeType}: ${parents.map((p) => JSON.stringify(p)).join(", ")}`;
        })
        .join(", ");

      console.error(
        `Multiple parents exist when deleting ${vertex.L[0]} (${actualVertexId}):`,
        "\nVertex:",
        vertex,
        "\nParents:",
        parentInfo,
      );
      return { error: "Vertex Children Exist When deleting vertex" };
    }

    // this should be handled by TableInput Wrapper component
    /*for (const attrInstEdgeId of vertex.OUT.AttrInst || []) {
      const attrInstEdge = graph.edges[attrInstEdgeId];
      if (attrInstEdge) {
        const endVertex = graph.vertexes[attrInstEdge.E];
        deleteEdge(0, attrInstEdgeId, graph, setGraph);
        if (endVertex) {
          for (const metaAttrEdgeId of endVertex.OUT.Attr || []) {
            const metaAttrEdge = graph.edges[metaAttrEdgeId];
            if (metaAttrEdge) {
              const endVertex = graph.vertexes[metaAttrEdge.E];
              deleteEdge(0, metaAttrEdgeId, graph, setGraph);
              if (endVertex) {
                deleteVertex(0, metaAttrEdge.E, graph, setGraph);
              }
            }
          }

          deleteVertex(0, attrInstEdge.E, graph, setGraph);
        }
      }
    }*/

    const data = klona(vertex);
    batch(() => {
      for (const label of graph.vertexes[actualVertexId].L) {
        // @ts-expect-error ignore
        setGraph("vertexLabelIdMap", label, (vertexIds) => {
          if (Array.isArray(vertexIds) && vertexIds.includes(actualVertexId)) {
            const filteredIds = vertexIds.filter(
              (vId) => vId !== actualVertexId,
            );
            return filteredIds.length ? filteredIds : undefined;
          }
          return vertexIds;
        });
      }
      // @ts-expect-error ignore
      setGraph("vertexes", actualVertexId, undefined);
    });

    transactionDetailAdd(
      txnId,
      {
        data,
        deleteVertex: "deleteVertexFn",
        id: actualVertexId,
        originalData: klona(vertex),
      },
      graph,
      setGraph,
      options,
    );
    broadcastToAllChannels(
      graph.broadcastChannels,
      options?.skipPostMessage ?? "",
      { deleteVertex: { txnId, vertexId } },
    );
    return {
      error: false,
      txnDetailIndex: getLastTxnIndex(txnId, graph),
    };
  });
}

export function isVertex(vertex: unknown): vertex is Vertex {
  return (
    isObject(vertex) &&
    typeof vertex.id === "string" &&
    Array.isArray(vertex.L) &&
    isObject(vertex.P)
  );
}

// mergeVertexProperties(0, vertexId, {props: { title }}) } }} will replace props.
export function mergeVertexProperties<T extends { [key: string]: unknown }>(
  txnId: number,
  vertexId: Id,
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
  properties: Partial<T>,
  options?: { cloneProperties?: boolean; skipPostMessage?: string },
): { error: string; txnDetailIndex?: number } {
  return untrack(() => {
    const actualVertexId =
      getVertexOldIdToNewIdMap(graph)[vertexId] || vertexId;
    const vertex = graph.vertexes[actualVertexId];
    if (!vertex) {
      return { error: `Vertex ID is not valid ${actualVertexId}` };
    }
    const originalProperties = {} as { [key: string]: unknown };
    for (const property in properties) {
      // clonning json will remove undefined value, so used null as default.
      originalProperties[property] = vertex.P[property] ?? null;
    }
    const clonedProperties = options?.cloneProperties
      ? klona(properties)
      : properties;
    // It will only merge top level properties.
    setGraph("vertexes", actualVertexId, "P", clonedProperties);
    const data = updateVertexIdsToNew(klona(vertex), graph, true);
    data.P = clonedProperties;

    transactionDetailAdd(
      txnId,
      {
        data,
        id: actualVertexId,
        merge: "mergeVertex",
        originalData: klona(originalProperties),
      },
      graph,
      setGraph,
      options,
    );
    broadcastToAllChannels(
      graph.broadcastChannels,
      options?.skipPostMessage ?? "",
      { mergeVertexProperties: { properties, txnId, vertexId } },
    );
    return {
      error: "",
      txnDetailIndex: getLastTxnIndex(txnId, graph),
    };
  });
}

// return a new Vertex
export function newVertex<T extends { [key: string]: unknown }>(
  id: Id,
  labels: string[],
  properties?: T,
): Vertex {
  return { id, IN: {}, L: labels, OUT: {}, P: properties || {} };
}

// replace a vertex properties
export function replaceVertexProperties(
  txnId: number,
  vertexId: Id,
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
  properties: { [key: string]: unknown },
  // clonning will reduce performance, so we can use this flag to disable it.
  options?: { cloneProperties?: boolean; skipPostMessage?: string },
): { error: boolean | string; txnDetailIndex?: number } {
  return untrack(() => {
    const actualVertexId =
      getVertexOldIdToNewIdMap(graph)[vertexId] || vertexId;
    if (!graph.vertexes[actualVertexId]) {
      const error = "Vertex ID not exist";
      console.error(error);
      return { error };
    }
    const shouldClone = options?.cloneProperties ?? true;
    setGraph(
      "vertexes",
      actualVertexId,
      "P",
      reconcile(shouldClone ? klona(properties) : properties),
    );
    if (txnId) {
      const originalProperties = klona(graph.vertexes[actualVertexId].P);
      const data = updateVertexIdsToNew(
        klona(graph.vertexes[actualVertexId]),
        graph,
        true,
      );
      transactionDetailAdd(
        txnId,
        {
          data,
          id: actualVertexId,
          originalData: klona(originalProperties),
          replace: "replaceVertex",
        },
        graph,
        setGraph,
        options,
      );
    }
    broadcastToAllChannels(
      graph.broadcastChannels,
      options?.skipPostMessage ?? "",
      { replaceVertexProperties: { properties, txnId, vertexId } },
    );
    return {
      error: false,
      txnDetailIndex: getLastTxnIndex(txnId, graph),
    };
  });
}

// update vertex id when we receive new id from api response
export function updateVertexId(
  oldVertexId: Id,
  newVertexId: Id,
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
  options?: { skipPostMessage?: string },
) {
  return untrack(() => {
    if (!graph.vertexes[oldVertexId]) {
      return { error: "Vertex ID is not valid" };
    }
    if (graph.vertexes[newVertexId]) {
      return { error: "new Vertex ID is not valid" };
    }
    setGraph("vertexes", newVertexId, graph.vertexes[oldVertexId]);
    setGraph("vertexes", newVertexId, "id", newVertexId);
    // TODO: replace id exactly at same position
    for (const label of graph.vertexes[newVertexId as string].L) {
      setGraph("vertexLabelIdMap", label, (ids) =>
        ids.filter((id) => id !== oldVertexId),
      );
    }
    for (const label of graph.vertexes[newVertexId as string].L) {
      setGraph("vertexLabelIdMap", label, (vertexIds: Id[]) =>
        Array.isArray(vertexIds) ? [...vertexIds, newVertexId] : [newVertexId],
      );
    }
    // v->E--in->V-out-->E->v
    for (const [_edgeType, edgeIds] of Object.entries(
      graph.vertexes[newVertexId as string].OUT,
    )) {
      setGraph("edges", edgeIds, "S", newVertexId);
    }
    for (const [_edgeType, edgeIds] of Object.entries(
      graph.vertexes[newVertexId as string].IN,
    )) {
      setGraph("edges", edgeIds, "E", newVertexId);
    }
    // @ts-expect-error intentionally setting vertex to undefined to remove it
    setGraph("vertexes", oldVertexId, undefined);
    broadcastToAllChannels(
      graph.broadcastChannels,
      options?.skipPostMessage ?? "",
      { updateVertexId: { newVertexId, oldVertexId } },
    );
    return { error: "" };
  });
}

// make sure to use klona to avoid cant mutate vertex issues
export function updateVertexIdsToNew(
  vertex: Vertex,
  graph: Store<GraphInterface>,
  ignoreEdges: boolean,
) {
  return untrack(() => {
    vertex.id = getVertexOldIdToNewIdMap(graph)[vertex.id] || vertex.id;
    if (!ignoreEdges) {
      for (const [edgeType, edgeIds] of Object.entries(vertex.IN)) {
        vertex.IN[edgeType] = edgeIds.map(
          (id) => getEdgeOldIdToNewIdMap(graph)[id] || id,
        );
      }

      for (const [edgeType, edgeIds] of Object.entries(vertex.OUT)) {
        vertex.OUT[edgeType] = edgeIds.map(
          (id) => getEdgeOldIdToNewIdMap(graph)[id] || id,
        );
      }
    }
    return vertex;
  });
}
