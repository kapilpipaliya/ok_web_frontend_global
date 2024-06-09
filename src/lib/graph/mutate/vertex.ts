import { batch } from "solid-js";
import { klona } from "klona";
import { reconcile, type SetStoreFunction, type Store } from "solid-js/store";
import type { GraphInterface, Id, Vertex } from "~/lib/graph/graph";
import {
  getNewGraphId,
  transactionDetailAdd,
  transactions,
} from "../transaction";
import { pipe } from "@mobily/ts-belt";
import { deleteEdge } from "~/lib/graph/mutate/edge";
import { findVertexByLabelAndUniqueId } from "~/lib/graph/get/sync/findVertex";
import { useToast } from "~/components/Toast";

// return a new Vertex
export function newVertex(
  id: Id,
  labels: string[],
  properties?: { [key: string]: any },
): Vertex {
  return { id, L: labels, P: properties || {}, IN: {}, OUT: {} };
}

export function addNewVertexUnSafe(
  vertex: Vertex,
  setGraph: SetStoreFunction<GraphInterface>,
) {
  setGraph("vertexes", vertex.id, vertex);
  vertex.L.forEach((label) =>
    setGraph("vertexLabelIdMap", label, (vertexIds: any) =>
      Array.isArray(vertexIds) ? [...vertexIds, vertex.id] : [vertex.id],
    ),
  );
}

// add a new vertex to the graph
export function addNewVertex(
  txnId: number,
  vertex: Vertex,
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
): {
  error: string | boolean;
  txnDetailIndex?: number;
} {
  if (graph.vertexes[vertex.id]) {
    return { error: "Vertex ID Already exist" };
  }
  const existedVertexes = vertex.L.filter(
    (label) =>
      Array.isArray(graph.vertexLabelIdMap[label]) &&
      graph.vertexLabelIdMap[label].includes(vertex.id),
  );
  if (existedVertexes.length) {
    return { error: "vertex ID already exist while adding new vertex" };
  }
  setGraph("vertexes", vertex.id, klona(vertex));
  vertex.L.forEach((label) =>
    setGraph("vertexLabelIdMap", label, (vertexIds: any) =>
      Array.isArray(vertexIds) ? [...vertexIds, vertex.id] : [vertex.id],
    ),
  );
  const data = klona(vertex);
  transactionDetailAdd(txnId, {
    data,
    insert: () => data,
    revert: () => deleteVertex(0, vertex.id, graph, setGraph),
  });
  return {
    error: false,
    txnDetailIndex: txnId ? transactions.get(txnId)?.steps.length - 1 : -1,
  };
}

// replace a vertex properties
export function replaceVertexProperties(
  txnId: number,
  vertexId: Id,
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
  properties: {},
): { error: string | boolean; txnDetailIndex?: number } {
  if (!graph.vertexes[vertexId]) {
    return { error: "Vertex ID is not valid" };
  }
  const originalProperties = klona(graph.vertexes[vertexId].P);
  setGraph("vertexes", vertexId, "P", reconcile(klona(properties)));
  const data = klona(graph.vertexes[vertexId]);
  transactionDetailAdd(txnId, {
    data,
    replace: () => klona(graph.vertexes[vertexId]),
    revert: () =>
      replaceVertexProperties(0, vertexId, graph, setGraph, originalProperties),
  });
  return {
    error: false,
    txnDetailIndex: txnId ? transactions.get(txnId)?.steps.length - 1 : -1,
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
): { error: string | boolean; txnDetailIndex?: number } {
  const vertex = graph.vertexes[vertexId];
  if (!vertex) {
    return { error: `Vertex ID is not valid ${vertexId}` };
  }
  const originalProperties = {} as { [key: string]: any };
  for (const property in properties) {
    originalProperties[property] = vertex.P[property];
  }
  setGraph("vertexes", vertexId, "P", properties);

  transactionDetailAdd(txnId, {
    data: properties,
    merge: () => Object.assign({}, vertex, { properties }),
    revert: () =>
      mergeVertexProperties(0, vertexId, graph, setGraph, originalProperties),
  });
  return {
    error: false,
    txnDetailIndex: txnId ? transactions.get(txnId)?.steps.length - 1 : -1,
  };
}

// delete a vertex
export function deleteVertex(
  txnId: number,
  vertexId: Id,
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
): {
  error: string | boolean;
  txnDetailIndex?: number;
} {
  const { showErrorToast } = useToast();

  if (!graph.vertexes[vertexId]) {
    return { error: "Vertex ID is not valid" };
  }
  // TODO:
  //  this must check
  //  if the in and out edges are empty else not allow to delete.

  const vertex = klona(graph.vertexes[vertexId]);

  if (
    Object.keys(vertex.OUT).filter((label) => label !== "AttrInst").length > 0
  ) {
    showErrorToast(
      `there are multiple children exist when deleting ${vertex.L[0]} (${vertex.id})`,
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
      `there are multiple Parent exist when deleting ${vertex.L[0]} (${vertex.id})`,
    );
    return { error: "Vertex Children Exist When deleting vertex" };
  }

  batch(() => {
    graph.vertexes[vertexId].L.forEach((label) =>
      // @ts-ignore
      setGraph("vertexLabelIdMap", label, (vertexIds) =>
        Array.isArray(vertexIds) && vertexIds.includes(vertexId)
          ? pipe(
              vertexIds.filter((vId) => vId !== vertexId),
              (fIds) => (fIds.length ? fIds : undefined),
            )
          : vertexIds,
      ),
    );
    // @ts-ignore
    setGraph("vertexes", vertexId, undefined);
  });
  const data = klona(vertex);
  transactionDetailAdd(txnId, {
    data,
    deleteVertex: () => data,
    revert: () => addNewVertex(0, vertex, graph, setGraph),
  });
  return {
    error: false,
    txnDetailIndex: txnId ? transactions.get(txnId)?.steps.length - 1 : -1,
  };
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

export function findOrCreateNewVertex(
  txnId: number,
  label: string,
  lookupId: string,
  lookUpUniqueValue: string,
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
) {
  const { showErrorToast } = useToast();

  if (!lookUpUniqueValue) {
    showErrorToast("lookup Unique Value must not be empty");
    return;
  }
  let existingVertex = findVertexByLabelAndUniqueId(
    graph,
    label,
    lookupId,
    lookUpUniqueValue,
  );

  if (!existingVertex) {
    const vertexId = getNewGraphId();
    addNewVertex(
      txnId,
      newVertex(vertexId, [label], { [lookupId]: lookUpUniqueValue }),
      graph,
      setGraph,
    );
    existingVertex = graph.vertexes[vertexId];
  }
  return existingVertex;
}
