import { batch } from "solid-js";
import { klona } from "klona";
import { reconcile, SetStoreFunction, Store } from "solid-js/store";
import {
  getNewGraphId,
  Id,
  IGraph,
  Node,
  transactionDetailAdd,
  transactions,
} from "~/cypher_api/lib/graph";
import { pipe } from "@mobily/ts-belt";
import { deleteEdge } from "~/cypher_api/lib/Edge";
import { DBConnection } from "~/cypher_api/lib/dbs";
import { findVertexMGCall } from "~/cypher_api/functions/findVertex";
import { newVertexDBCall } from "~/cypher_api/functions/newVertex";

// return a new Vertex
export function newVertex(
  id: Id,
  labels: string[],
  properties?: { [key: string]: any },
): Node {
  return { id, L: labels, P: properties || {}, IN: {}, OUT: {} };
}

export function addNewNodeUnsafe(
  graph: Store<IGraph>,
  setGraph: SetStoreFunction<IGraph>,
  vertex: Node,
) {
  setGraph("vertexes", vertex.id, vertex);
  vertex.L.forEach((label) =>
    setGraph("vertexLabelIdMap", label, (vertexIds) =>
      Array.isArray(vertexIds) ? [...vertexIds, vertex.id] : [vertex.id],
    ),
  );
}

// add a new vertex to the graph
export function addNewVertex(
  graph: Store<IGraph>,
  setGraph: SetStoreFunction<IGraph>,
  txnId: number,
  vertex: Node,
): { error: string | boolean; txnDetailIndex?: number } {
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
    setGraph("vertexLabelIdMap", label, (vertexIds) =>
      Array.isArray(vertexIds) ? [...vertexIds, vertex.id] : [vertex.id],
    ),
  );
  const data = klona(vertex);
  transactionDetailAdd(txnId, {
    data,
    insert: () => data,
    revert: () => deleteVertex(graph, setGraph, 0, vertex.id),
  });
  return {
    error: false,
    txnDetailIndex: txnId ? transactions.get(txnId)!.steps.length - 1 : -1,
  };
}

// replace a vertex properties
export function replaceVertexProperties(
  graph: Store<IGraph>,
  setGraph: SetStoreFunction<IGraph>,
  txnId: number,
  vertexId: Id,
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
    replace: () => data,
    revert: () =>
      replaceVertexProperties(graph, setGraph, 0, vertexId, originalProperties),
  });
  return {
    error: false,
    txnDetailIndex: txnId ? transactions.get(txnId)!.steps.length - 1 : -1,
  };
}

// mergeVertexProperties(0, vertexId, {props: { title }}) } }} will replace props.
export function mergeVertexProperties(
  graph: Store<IGraph>,
  setGraph: SetStoreFunction<IGraph>,
  txnId: number,
  vertexId: Id,
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
      mergeVertexProperties(graph, setGraph, 0, vertexId, originalProperties),
  });
  return {
    error: false,
    txnDetailIndex: txnId ? transactions.get(txnId)!.steps.length - 1 : -1,
  };
}

// delete a vertex
export function deleteVertex(
  graph: Store<IGraph>,
  setGraph: SetStoreFunction<IGraph>,
  txnId: number,
  vertexId: Id,
): { error: string | boolean; txnDetailIndex?: number } {
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
    console.error(
      `there are multiple children exist when deleting ${vertex.L[0]} (${vertex.id})`,
    );
    return { error: "Vertex Children Exist When deleting vertex" };
  }
  for (const attrInstEdgeId of vertex.OUT["AttrInst"] || []) {
    const attrInstEdge = graph.edges[attrInstEdgeId];
    if (attrInstEdge) {
      const endVertex = graph.vertexes[attrInstEdge.E];
      deleteEdge(graph, setGraph, txnId, attrInstEdgeId);
      if (endVertex) {
        for (const metaAttrEdgeId of endVertex.OUT["MetaAttr"] || []) {
          const metaAttrEdge = graph.edges[metaAttrEdgeId];
          if (metaAttrEdge) {
            const endVertex = graph.vertexes[metaAttrEdge.E];
            deleteEdge(graph, setGraph, txnId, metaAttrEdgeId);
            if (endVertex) {
              deleteVertex(graph, setGraph, txnId, metaAttrEdge.E);
            }
          }
        }

        deleteVertex(graph, setGraph, txnId, attrInstEdge.E);
      }
    }
  }

  if (Object.keys(vertex.IN).length > 0) {
    console.error(
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
    revert: () => addNewVertex(graph, setGraph, 0, vertex),
  });
  return {
    error: false,
    txnDetailIndex: txnId ? transactions.get(txnId)!.steps.length - 1 : -1,
  };
}

// update vertex id when we receive new id from api response
export function updateVertexId(
  graph: Store<IGraph>,
  setGraph: SetStoreFunction<IGraph>,
  oldVertexId: Id,
  newVertexId: Id,
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

// helper function to find all the vertex ids of the label
export function findVertexIdsByLabel(
  graph: Store<IGraph>,
  setGraph: SetStoreFunction<IGraph>,
  label: string,
): Id[] {
  return graph.vertexLabelIdMap[label] || [];
}

export function findVertexByLabelAndUniqueId(
  graph: Store<IGraph>,
  setGraph: SetStoreFunction<IGraph>,
  label: string,
  attribute: string,
  value: number | string,
) {
  if (!value) return undefined;
  const vertexId = (graph.vertexLabelIdMap[label] || []).find(
    (vertexId) => value === graph.vertexes[vertexId].P[attribute],
  );
  return vertexId ? graph.vertexes[vertexId] : undefined;
}

export function findVertexByLabelAndPks(
  graph: Store<IGraph>,
  setGraph: SetStoreFunction<IGraph>,
  label: string,
  value: { [key: string]: number | string | boolean },
) {
  if (!value) return undefined;
  const vertexId = (graph.vertexLabelIdMap[label] || []).find((vertexId) => {
    for (const valueKey in value) {
      if (value[valueKey] !== graph.vertexes[vertexId].P[valueKey]) {
        return false;
      }
    }
    return true;
  });
  return vertexId ? graph.vertexes[vertexId] : undefined;
}

export function findVertexByLabelAndUniqueIdWithSkip(
  graph: Store<IGraph>,
  setGraph: SetStoreFunction<IGraph>,
  label: string,
  attribute: string,
  value: any,
  skipId: number,
) {
  let vertexIds = graph.vertexLabelIdMap[label] || [];
  if (skipId != undefined) {
    vertexIds = vertexIds.filter((value) => value !== skipId);
  }
  const vertexId = vertexIds.find(
    (vertexId) => value === graph.vertexes[vertexId].P[attribute],
  );

  return vertexId ? graph.vertexes[vertexId] : undefined;
}

export function findOrCreateNewVertex(
  graph: Store<IGraph>,
  setGraph: SetStoreFunction<IGraph>,
  txnId: number,
  label: string,
  lookupId: string,
  lookUpUniqueValue: string,
) {
  if (!lookUpUniqueValue) {
    console.error("lookup Unique Value must not be empty");
    return;
  }
  let existingVertex = findVertexByLabelAndUniqueId(
    graph,
    setGraph,
    label,
    lookupId,
    lookUpUniqueValue,
  );

  if (!existingVertex) {
    const vertexId = getNewGraphId();
    addNewVertex(
      graph,
      setGraph,
      txnId,
      newVertex(vertexId, [label], { [lookupId]: lookUpUniqueValue }),
    );
    existingVertex = graph.vertexes[vertexId];
  }
  return existingVertex;
}

export async function findOrCreateNewVertexMGCall(
  dbConn: DBConnection,
  label: string,
  lookupId: string,
  lookUpUniqueValue: string,
) {
  if (!lookUpUniqueValue) {
    console.error("lookup Unique Value must not be empty");
    return;
  }
  const existingVertex = await findVertexMGCall(
    dbConn,
    label,
    lookupId,
    lookUpUniqueValue,
  );

  if (existingVertex.error) {
    const newVertexResult = await newVertexDBCall(dbConn, label, {
      [lookupId]: lookUpUniqueValue,
    });
    return newVertexResult.vertex!;
  }
  return existingVertex.vertex!;
}
