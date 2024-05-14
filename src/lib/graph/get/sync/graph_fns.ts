import { batch, onCleanup, useContext } from "solid-js";
import { ServerEventsDispatcher } from "~/lib/websocket/ws_events_dispatcher";
import { addNewEdge, deleteEdge, newEdge } from "~/lib/graph/mutate/edge";
import {
  addNewVertex,
  deleteVertex,
  mergeVertexProperties,
  newVertex,
} from "~/lib/graph/mutate/vertex";
import { GraphInterface, Id, IdAttr, Vertex } from "~/lib/graph/graph";
import {
  commitTxn,
  getNewGraphId,
  getNewTxnId,
  revertTransaction,
} from "../../transaction";
import { evaluate } from "~/lib/jsep";
import jsep from "jsep";
import { klona } from "klona/json";
import { setSelectionValue } from "~/components/dynamic/fields/static/SelectionUtils";
import { getToEdge } from "~/lib/graph/get/sync/getToEdge";
import { FieldAttribute, FormMetaData } from "~/lib/Type";
import { SetStoreFunction, Store } from "solid-js/store";
import {
  replaceExpressionToLabel,
  getValueFromVertexOrKey,
  isObject,
  getLabel,
  getId,
} from "../../../Utils";
import { useToast } from "~/components/custom/Toast";

export function getSelectionOptions(
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
  vertex: Vertex[],
  collection: string,
  strict?: boolean,
): { error: boolean; vertexes?: any } {
  collection = replaceExpressionToLabel(graph, setGraph, collection, vertex[0]);
  try {
    const value = evaluate(jsep(collection), {
      vertexes: vertex,
      graph,
      setGraph,
    });
    if (value) {
      return { error: false, vertexes: value };
    } else {
      return { error: true };
    }
  } catch (e) {
    console.error(e, vertex, collection);
    return { error: true };
  }
}

export function deleteRow(
  vertex: Vertex,
  isRealTime: boolean,
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
  txnId: number,
  Ws: ServerEventsDispatcher,
) {
  const { showErrorToast } = useToast();

  batch(() => {
    if (isRealTime) {
      txnId = getNewTxnId(graph, setGraph);
    }
    // delete all vertex in edges
    const inEdges = vertex.IN;
    for (const type in inEdges) {
      for (const edgeId of inEdges[type]) {
        const deleteEdgeResult = deleteEdge(txnId, edgeId, graph, setGraph);
        if (deleteEdgeResult?.error)
          showErrorToast(deleteEdgeResult.error.toString());
      }
    }
    // delete all outEdges of vertex
    const outEdge = vertex.OUT;
    for (const type in outEdge) {
      for (const edgeId of outEdge[type]) {
        const deleteEdgeResult = deleteEdge(txnId, edgeId, graph, setGraph);
        if (deleteEdgeResult?.error)
          showErrorToast(deleteEdgeResult.error.toString());
      }
    }

    // delete vertex:
    const deleteResult = deleteVertex(txnId, vertex.id, graph, setGraph);
    if (deleteResult.error) showErrorToast(deleteResult.error.toString());
    if (isRealTime) commitTxn(txnId, Ws);
  });
}

export function getChildVertex(
  graph: Store<GraphInterface>,
  path: string[],
  currentVertex: Vertex,
): {
  error: boolean;
  vertex?: Vertex;
} {
  if (path.length === 0)
    return {
      error: true,
    };

  let type = path[0];
  let filter = "";

  const filterIndex = type.indexOf("[");
  if (filterIndex > -1) {
    filter = type.slice(filterIndex);
    // modify the variable itself
    type = type.slice(0, filterIndex);
  }
  if (type.includes("$0")) {
    if (!currentVertex.L)
      return {
        error: true,
      };
    type = type.replace("$0", currentVertex.L[0]);
  }
  let vertexes = (currentVertex.OUT[type] || []).map(
    (edgeId) => graph.vertexes[graph.edges[edgeId].E],
  );

  if (filter) {
    // TODO:
    // vertexes = vertexes.filter(x=>x.P[IdAttr] === 'component')
  }
  if (vertexes.length != 1) {
    return {
      error: true,
    };
  } else {
    const newVertex = vertexes[0];
    if (newVertex) {
      if (path.length > 1) {
        return getChildVertex(graph, path.slice(1), newVertex);
      } else {
        return {
          error: false,
          vertex: newVertex,
        };
      }
    } else {
      return {
        error: true,
      };
    }
  }
}

export function getParentVertex(
  path: string[],
  currentVertex: Vertex,
  graph: Store<GraphInterface>,
): {
  error: boolean;
  vertex?: Vertex;
} {
  const type = path[path.length - 1].replace("$0", currentVertex.L[0]);
  const edges = currentVertex.IN[type];
  if (!edges || (edges && edges.length != 1)) {
    return {
      error: true,
    };
  } else {
    const edge = graph.edges[edges[0]];
    if (edge) {
      const newVertex = graph.vertexes[edge.S];
      if (newVertex) {
        if (path.length > 1) {
          return getParentVertex(path.slice(0, -1), newVertex, graph);
        } else {
          return {
            error: false,
            vertex: newVertex,
          };
        }
      } else {
        return {
          error: true,
        };
      }
    } else {
      return {
        error: true,
      };
    }
  }
}

export function getChildVertexes(
  graph: Store<GraphInterface>,
  path: string[],
  currentVertexes: Vertex[],
  strict?: boolean,
): { error: boolean; vertexes?: Vertex[] } {
  const stepVertexes = new Map<number, Vertex>();
  if (path.length == 0) {
    return { error: true };
  }
  let type = path[0];
  for (const currentVertex of currentVertexes) {
    if (type.includes("$0")) {
      if (!currentVertex.L) continue;
      type = type.replace("$0", currentVertex.L[0]);
    }
    const edgeIds = currentVertex.OUT?.[type] || [];
    if (edgeIds.length == 0) {
      // we only return error if its in middle of path
      if (strict && path.length > 1) {
        return {
          error: true,
        };
      } else {
        continue;
      }
    }

    for (const edgeId of edgeIds) {
      const edge = graph.edges[edgeId];
      if (edge) {
        const newVertex = graph.vertexes[edge.E];
        if (newVertex) {
          stepVertexes.set(newVertex.id, newVertex);
        } else {
          return {
            error: true,
          };
        }
      } else {
        return {
          error: true,
        };
      }
    }
  }

  if (path.length > 1) {
    return getChildVertexes(
      graph,
      path.slice(1),
      Array.from(stepVertexes.values()),
      strict,
    );
  } else {
    return {
      error: false,
      vertexes: Array.from(stepVertexes.values()),
    };
  }
}
// This method read all property vertexes and make an object.

export const getProps = (
  meta: Vertex,
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
) =>
  (getChildVertexes(graph, ["$0Prop"], [meta]).vertexes || []).reduce(
    (acc, curr) => {
      const key = getSelectionOptions(
        graph,
        setGraph,
        [curr],
        "T:(->$0Key::'P.key')",
      ).vertexes;
      if (key) {
        acc[key] = curr.P.value;
      }
      return acc;
    },
    {} as { [key: string]: any },
  );

export function createMeta(
  form: FormMetaData,
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
): { error: boolean; vertex?: Vertex } {
  const { attributes, ...custom } = form;

  // save attributes to vertexes
  const metaTxnId = getNewTxnId(graph, setGraph);

  const metaMainVertex = newVertex(getNewGraphId(), ["Temp"], custom);
  const { error } = addNewVertex(metaTxnId, metaMainVertex, graph, setGraph);
  if (error) {
    console.error(error);
    return { error: true };
  }
  const metaVertex = graph.vertexes[metaMainVertex.id];

  addMetaVertexes(graph, setGraph, metaTxnId, metaVertex, attributes);
  onCleanup(() => {
    revertTransaction(metaTxnId);
  });
  onCleanup(() => {
    // TODO: Remove all the meta
  });

  return { error: false, vertex: metaVertex };
}

export function createForm(
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
  txnId: Id,
  ws: ServerEventsDispatcher,
  label: string,
  properties?: {
    [key: string]: any;
  },
): {
  error: string | boolean;
  vertex?: Vertex;
} {
  if (!label) {
    return { error: "Label not found" };
  }

  const isRealTime = false;
  if (isRealTime) {
    txnId = getNewTxnId(graph, setGraph);
  }
  const newVertexObj = newVertex(getNewGraphId(), [label], properties || {});
  // TODO: Do Create Transformation for the vertex
  const addNewVertexResult = addNewVertex(txnId, newVertexObj, graph, setGraph);
  if (addNewVertexResult.error) {
    return addNewVertexResult;
  }
  if (isRealTime) commitTxn(txnId, ws);
  const vertex = graph.vertexes[newVertexObj.id];
  return {
    error: false,
    vertex: vertex,
  };
}
export function loadForm(
  graph: Store<GraphInterface>,
  id: number,
): { error: string | boolean; vertex?: Vertex } {
  if (!graph.vertexes[id]) {
    return { error: "vertex not found" };
  }
  const vertex = graph.vertexes[id];

  return {
    error: false,
    vertex: vertex,
  };
}

export const addMetaVertexes = (
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
  txnId: number,
  vertex: Vertex,
  attributes: FieldAttribute[],
) => {
  const { showErrorToast } = useToast();

  for (const attribute of attributes) {
    // if (attribute?.props?.skip) {
    //   continue;
    // }
    const attr = klona(attribute);
    if (!attr.tab) attr.tab = "main";
    if (!attr.group) attr.group = "main";
    // if(attribute.component === "Table2") attribute.group = attribute.id;
    const addAttributeResult = newRow(
      graph,
      setGraph,
      txnId,
      vertex,
      "MetaAttr",
      "MetaAttr",
      attr,
    );
    if (addAttributeResult.error) {
      showErrorToast(addAttributeResult.error.toString());
    }
    // todo discard transaction
    // if (attribute.component === "Table2" && attribute.attributes) {
    if (attribute.attributes) {
      addMetaVertexes(
        graph,
        setGraph,
        txnId,
        graph.vertexes[addAttributeResult.vertexId!],
        attribute.attributes,
      );
    }
    // todo discard transaction
  }
};

export function setValueGlobal(
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
  txnId: number,
  attribute: Vertex,
  vertex: Vertex,
  data: any,
  ws: ServerEventsDispatcher,
  isRealTime: boolean,
) {
  if (!vertex) {
    return;
  }

  // after commit, we can not use same txnId();
  if (isRealTime) {
    txnId = getNewTxnId(graph, setGraph);
  }

  mergeVertexProperties(txnId, vertex.id, graph, setGraph, {
    [attribute.P[IdAttr]]: data,
  });

  // we directly save the dataType on vertex:
  setGraph("vertexes", vertex.id, "D", {
    [attribute.P[IdAttr]]: attribute.P["dataType"],
  });

  onChangeHandler(txnId, vertex, vertex, attribute, graph, setGraph);
  if (isRealTime) commitTxn(txnId, ws);
}

export function getSublistRowsForType(
  graph: Store<GraphInterface>,
  type: string,
  vertex: Vertex,
) {
  return (getChildVertexes(graph, [`${type}`], [vertex]).vertexes || []).sort(
    (a, b) => a.P.pos - b.P.pos,
  );
}

export function getSublistRows(
  graph: Store<GraphInterface>,
  meta: Vertex,
  vertex?: Vertex,
) {
  if (!vertex) return [];
  // This should check for inward edges too
  const type = getToEdge(meta, vertex);
  return (getChildVertexes(graph, [`${type}`], [vertex]).vertexes || []).sort(
    (a, b) => a.P.pos - b.P.pos,
  );
}

export function newRow(
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
  txnId: number,
  parentVertex: Vertex,
  label: string,
  edgeType?: string,
  properties?: { [key: string]: any },
): { error: boolean; vertexId?: Id; edgeId?: Id } {
  const { showErrorToast } = useToast();

  return batch(() => {
    const vertexNew = newVertex(
      getNewGraphId(),
      [label || edgeType!],
      properties,
    );
    const insertVertex = addNewVertex(txnId, vertexNew, graph, setGraph);
    if (insertVertex.error) {
      showErrorToast(insertVertex.error.toString());
      return {
        error: true,
      };
    }

    const edgeNew = newEdge(
      getNewGraphId(),
      edgeType || label!,
      {},
      parentVertex.id,
      vertexNew.id,
    );
    const insertEdgeResult = addNewEdge(txnId, edgeNew, graph, setGraph);
    if (insertEdgeResult.error) {
      showErrorToast(insertEdgeResult.error.toString());
      return {
        error: true,
        vertexId: vertexNew.id,
      };
    }
    return {
      error: false,
      vertexId: vertexNew.id,
      edgeId: edgeNew.id,
    };
  });
}

export const addNewRow = (
  txnId: number,
  meta: Vertex,
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
  parentVertex: Vertex,
  properties: { [key: string]: any },
  isRealTime: boolean,
  Ws: ServerEventsDispatcher,
) => {
  if (isRealTime) {
    txnId = getNewTxnId(graph, setGraph);
  }
  const type = getToEdge(meta, parentVertex);
  const label = getValueFromVertexOrKey(meta.P.props || {}, "label");

  const newRowResult = newRow(
    graph,
    setGraph,
    txnId,
    parentVertex,
    label,
    type,
    properties,
  );
  if (isRealTime) commitTxn(txnId, Ws);
  return newRowResult;
};
// Select On Change Handler
export function onChangeHandler(
  txnId: number,
  formVertex: Vertex,
  vertex: Vertex,
  changedFieldAttribute: Vertex,
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
) {
  if (!changedFieldAttribute.P.props?.onchange) return;
  const isNew = formVertex.id < 0;
  try {
    let args = JSON.parse(changedFieldAttribute.P.props.onchange);
    if (Array.isArray(args)) {
      // args in proper format.
    } else if (isObject(args)) {
      // TODO: Find the form is new or edit.
      if (args.new && isNew) {
        args = args.new;
      } else if (args.edit) {
        args = args.edit;
      } else {
        return;
      }
    }

    const attribute = (
      getSelectionOptions(
        graph,
        setGraph,
        [changedFieldAttribute],
        "-MetaAttr->MetaAttr",
      ).vertexes || []
    ).find((vertex: any) => vertex.P[IdAttr] === args[0]);
    if (!attribute) {
      return;
    }
    let value = args[1];

    if (value === null) value = undefined;
    if (value === "label")
      value = getLabel(vertex.P[changedFieldAttribute.P[IdAttr]]);
    if (value === "id")
      value = getId(vertex.P[changedFieldAttribute.P[IdAttr]]);
    if (value === "clear") value = null;
    if (attribute.P.component == "Select" || attribute.P.component === "Tag") {
      setSelectionValue(txnId, vertex, graph, setGraph, attribute, value);
    } else {
      mergeVertexProperties(txnId, vertex.id, graph, setGraph, {
        [attribute.P[IdAttr]]: value,
      });
    }
  } catch (e) {
    console.log("Error In On Change ", e);
  }
}
