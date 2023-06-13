import { batch } from "solid-js";
import { klona } from "klona";
import { reconcile } from "solid-js/store";
import {
  getNewGraphId,
  graph,
  Id,
  setGraph,
  transactionDetailAdd,
  transactions,
  Vertex
} from "./graph";
import { G, pipe } from "@mobily/ts-belt";
import { deleteEdge } from "./Edge";

// return a new Vertex
export function newVertex(id: Id, labels: string[], properties?: {[key: string]: any} ): Vertex {
  return { id, L: labels, P: properties || {}, IN: {}, OUT: {} };
}

export function addNewVertexUnSafe(vertex: Vertex) {
  setGraph("vertexes", vertex.id, vertex);
  vertex.L.forEach((label) =>
   setGraph("vertexLabelIdMap", label, (vertexIds) =>
    G.isArray(vertexIds) ? [...vertexIds, vertex.id] : [vertex.id],
   ),
  );
}
// add a new vertex to the graph
export function addNewVertex(txnId: number, vertex: Vertex): { error: string | boolean; txnDetailIndex?: number } {
  if (graph.vertexes[vertex.id]) {
    return { error: "Vertex ID Already exist" };
  }
  const existedVertexes = vertex.L.filter(
    (label) => G.isArray(graph.vertexLabelIdMap[label]) && graph.vertexLabelIdMap[label].includes(vertex.id),
  );
  if (existedVertexes.length) {
    return { error: "vertex ID already exist while adding new vertex" };
  }
  setGraph("vertexes", vertex.id, klona(vertex));
  vertex.L.forEach((label) =>
    setGraph("vertexLabelIdMap", label, (vertexIds) =>
      G.isArray(vertexIds) ? [...vertexIds, vertex.id] : [vertex.id],
    ),
  );
  transactionDetailAdd(txnId, {
    insert: () => klona(vertex),
    revert: () => deleteVertex(0, vertex.id),
  });
  return {
    error: false,
    txnDetailIndex: txnId ? transactions.get(txnId)!.steps.length - 1 : -1,
  };
}

// replace a vertex properties
export function replaceVertexProperties(
  txnId: number,
  vertexId: Id,
  properties: {},
): { error: string | boolean; txnDetailIndex?: number } {
  if (!graph.vertexes[vertexId]) {
    return { error: "Vertex ID is not valid" };
  }
  const originalProperties = klona(graph.vertexes[vertexId].P);
  setGraph("vertexes", vertexId, "P", reconcile(klona(properties)));
  transactionDetailAdd(txnId, {
    replace: () => klona(graph.vertexes[vertexId]),
    revert: () => replaceVertexProperties(0, vertexId, originalProperties),
  });
  return {
    error: false,
    txnDetailIndex: txnId ? transactions.get(txnId)!.steps.length - 1 : -1,
  };
}

export function mergeVertexProperties(
  txnId: number,
  vertexId: Id,
  properties: {[key: string]: any},
  types?: {[key: string]: any}
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
    merge: () => Object.assign({}, vertex, { properties }),
    revert: () => mergeVertexProperties(0, vertexId, originalProperties),
  });
  return {
    error: false,
    txnDetailIndex: txnId ? transactions.get(txnId)!.steps.length - 1 : -1,
  };
}

// delete a vertex
export function deleteVertex(txnId: number, vertexId: Id): { error: string | boolean; txnDetailIndex?: number } {
  if (!graph.vertexes[vertexId]) {
    return { error: "Vertex ID is not valid" };
  }
  // TODO:
  //  this must check
  //  if the in and out edges are empty else not allow to delete.

  const vertex = klona(graph.vertexes[vertexId]);

  if (Object.keys(vertex.OUT).filter(label => label !== "AttrInst").length > 0) {
    alert(`there are multiple children exist when deleting ${vertex.L[0]} (${vertex.id})`);
    return { error: "Vertex Children Exist When deleting vertex" };
  }
  for (const attrInstEdgeId of vertex.OUT["AttrInst"] || []) {
    const attrInstEdge = graph.edges[attrInstEdgeId];
    if (attrInstEdge) {
      const endVertex = graph.vertexes[attrInstEdge.E];
      deleteEdge(txnId, attrInstEdgeId);
      if (endVertex) {
        for (const metaAttrEdgeId of endVertex.OUT["MetaAttr"] || []) {
          const metaAttrEdge = graph.edges[metaAttrEdgeId];
          if (metaAttrEdge) {
            const endVertex = graph.vertexes[metaAttrEdge.E];
            deleteEdge(txnId, metaAttrEdgeId);
            if (endVertex) {
              deleteVertex(txnId, metaAttrEdge.E);
            }
          }
        }

        deleteVertex(txnId, attrInstEdge.E);
      }
    }
  }

  if (Object.keys(vertex.IN).length > 0) {
    alert(`there are multiple Parent exist when deleting ${vertex.L[0]} (${vertex.id})`);
    return { error: "Vertex Children Exist When deleting vertex" };
  }

  batch(() => {
    // @ts-ignore
    graph.vertexes[vertexId].L.forEach((label) =>
      setGraph("vertexLabelIdMap", label, (vertexIds) =>
        G.isArray(vertexIds) && vertexIds.includes(vertexId)
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
  transactionDetailAdd(txnId, {
    deleteVertex: () => klona(vertex),
    revert: () => addNewVertex(0, vertex),
  });
  return {
    error: false,
    txnDetailIndex: txnId ? transactions.get(txnId)!.steps.length - 1 : -1,
  };
}
// update vertex id when we receive new id from api response
export function updateVertexId(oldVertexId: Id, newVertexId: Id) {
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
    setGraph("vertexLabelIdMap", label, (ids) => ids.filter((id) => id !== oldVertexId)),
  );
  graph.vertexes[newVertexId].L.forEach((label) =>
    setGraph("vertexLabelIdMap", label, (vertexIds) =>
      G.isArray(vertexIds) ? [...vertexIds, newVertexId] : [newVertexId],
    ),
  );
  // v->E--in->V-out-->E->v
  Object.entries(graph.vertexes[newVertexId].OUT).forEach(([edgeType, edgeIds]) => {
    setGraph("edges", edgeIds, "S", newVertexId);
  });
  Object.entries(graph.vertexes[newVertexId].IN).forEach(([edgeType, edgeIds]) => {
    setGraph("edges", edgeIds, "E", newVertexId);
  });
  return { error: "" };
}
// helper function to find all the vertex ids of the label
export function findVertexIdsByLabel(label: string): Id[] {
  return graph.vertexLabelIdMap[label] || [];
}
export function findVertexByLabelAndUniqueId(label: string, attribute: string, value: number | string) {
  if (!value) return undefined;
  const vertexId = (graph.vertexLabelIdMap[label] || []).find(
    (vertexId) => value === graph.vertexes[vertexId].P[attribute],
  );
  return vertexId ? graph.vertexes[vertexId] : undefined;
}
export function findVertexByLabelAndPks(label: string, value: {[key: string]: number | string | boolean}) {
  if (!value) return undefined;
  const vertexId = (graph.vertexLabelIdMap[label] || []).find(
    (vertexId) => {
      for (const valueKey in value) {
        if (value[valueKey] !== graph.vertexes[vertexId].P[valueKey]) {
          return false;
        }
      }
      return true;
    },
  );
  return vertexId ? graph.vertexes[vertexId] : undefined;
}
export function findVertexByLabelAndUniqueIdWithSkip(label: string, attribute: string, value: any, skipId: number) {
  let vertexIds = graph.vertexLabelIdMap[label] || [];
  if (skipId != undefined) {
    vertexIds = vertexIds.filter((value) => value !== skipId);
  }
  const vertexId = vertexIds.find((vertexId) => value === graph.vertexes[vertexId].P[attribute]);

  return vertexId ? graph.vertexes[vertexId] : undefined;
}

export function findOrCreateNewVertex(txnId: number, label: string, lookupId: string, lookUpUniqueValue: string) {
  if (!lookUpUniqueValue) {
    alert("lookup Unique Value must not be empty");
    return;
  }
  let existingVertex = findVertexByLabelAndUniqueId(label, lookupId, lookUpUniqueValue);

  if (!existingVertex) {
    const vertexId = getNewGraphId();
    addNewVertex(txnId, newVertex(vertexId, [label], { [lookupId]: lookUpUniqueValue }));
    existingVertex = graph.vertexes[vertexId];
  }
  return existingVertex;
}