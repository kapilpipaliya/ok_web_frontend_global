import {
  type GraphInterface,
  type Id,
  IdAttr,
  type Vertex,
} from "~/lib/graph/graph";
import {
  commitTxn,
  getNewGraphId,
  getNewTxnId,
  revertTransaction,
} from "../transaction";
import { klona } from "klona/json";
import {
  addNewVertex,
  mergeVertexProperties,
  newVertex,
} from "~/lib/graph/mutate/vertex";
import { batch, onCleanup, untrack, useContext } from "solid-js";
import {
  getChildVertex,
  getChildVertexes,
  getSelectionOptions,
} from "../get/sync/traverse";
import type { SetStoreFunction, Store } from "solid-js/store";
import {
  componentProps,
  getCollAttrComp,
} from "~/lib/graph/get/sync/graph_functions";
import { useToast } from "~/components/Toast";
import { NewTxnIdContext } from "~/lib/contexts";
import type { FormMetaData, FieldAttribute } from "~/lib/Type";
import {
  getValueFromVertexOrKey,
  isObject,
  getLabel,
  getId,

} from "~/lib/utils";
import type { ServerEventsDispatcher } from "~/lib/websocket/ws_events_dispatcher";
import { getToEdge } from "../get/sync/traverse";
import { newEdge, addNewEdge } from "./edge";
import {
  getFormApiFromForm,
  getPkForCollection,
} from "../get/sync/graph_functions";
import { AttrsAdminTableData } from "~/lib/apiAdmin";
import { findVertexByLabelAndUniqueId } from "../get/sync/findVertex";
import { AttrsTableData } from "~/lib/api";
import { setSelectionValue } from "~/lib/graph/mutate/setSelectionValue";
import { removeUndefinedProperties } from "~/lib/removeUndefinedProperties";
import { AdminAttrKeys } from "~/lib/constants";

export function cloneRowProps(
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
  txnId: number,
  fromVertex: Vertex,
  toVertex: Vertex,
) {
  const propRows =
    getChildVertexes(graph, ["$0Prop"], [fromVertex]).vertexes || [];

  const attrPropMetaVertex = newVertex(getNewGraphId(), [], {
    name: "Prop",
  });
  const attrNameVertex = newVertex(getNewGraphId(), [], {
    name: "Name",
    component: "SelectBox",
  });

  for (const propRow of propRows) {
    const nameVertex = getChildVertex(graph, ["$0Name"], propRow);
    if (nameVertex.vertex) {
      const rowResult = addNewRow(
        txnId,
        attrPropMetaVertex,
        graph,
        setGraph,
        toVertex,
        klona(propRow.P),
        false,
        {} as any,
      );
      const rowVertex = graph.vertexes[rowResult.vertexId!];
      setSelectionValue(
        txnId,
        rowVertex,
        graph,
        setGraph,
        attrNameVertex,
        nameVertex.vertex.id,
      );
    }
  }
}

// add meta from vertex value:
export function addMeta(
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
  metaVertex: Vertex,
  data: Vertex,
) {
  if (metaVertex.P.meta) {
    const metaData = componentProps(graph, setGraph, metaVertex, data);
    const metaDataVal = removeUndefinedProperties(metaData, false, 10);
    untrack(() => {
      const newMetaData = Object.assign(
        {},
        // when component is rendered dynamically graph.vertexes[metaVertex.P.templateId] value is undefined
        graph.vertexes[metaVertex.P.templateId]?.P?.props || {},
        metaDataVal,
      );
      mergeVertexProperties(
        useContext(NewTxnIdContext),
        metaVertex.id,
        graph,
        setGraph,
        {
          props: newMetaData,
        },
      );
    });
  }
}

export function rowMetaInitialize(
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
  joinVertex: Vertex,
  meta: Vertex,
  tableColumnsTemplate: Vertex[],
) {
  const { showErrorToast } = useToast();

  const rowMetaAttrInst = getChildVertex(graph, ["AttrInst"], joinVertex);
  if (rowMetaAttrInst.error) {
    const rows = {} as { [key: Id]: Id };
    const metaTxnId = getNewTxnId(graph, setGraph);
    batch(() => {
      const metaInstanceResult = newRow(
        graph,
        setGraph,
        metaTxnId,
        joinVertex,
        "AttrInst",
      );
      if (metaInstanceResult.error) {
        showErrorToast("Error creating a row for attribute instance");
      }
      mergeVertexProperties(
        metaTxnId,
        metaInstanceResult.vertexId!,
        graph,
        setGraph,
        {
          templateId: meta.id,
        },
      );

      for (const attrColumn of tableColumnsTemplate) {
        const AttrRowResult = newRow(
          graph,
          setGraph,
          metaTxnId,
          graph.vertexes[metaInstanceResult.vertexId!],
          "MetaAttr",
        );
        if (AttrRowResult.error) {
          showErrorToast(AttrRowResult.error.toString());
        }
        const P = klona(attrColumn.P);
        P.templateId = attrColumn.id;

        if (!P.component) {
          const component = getCollAttrComp(attrColumn, graph)?.P[IdAttr];
          if (component) P.component = component;
        }
        mergeVertexProperties(
          metaTxnId,
          AttrRowResult.vertexId!,
          graph,
          setGraph,
          P,
        );
        rows[attrColumn.id] = AttrRowResult.vertexId!;
      }
      mergeVertexProperties(
        metaTxnId,
        metaInstanceResult.vertexId!,
        graph,
        setGraph,
        {
          rows,
          metaTxnId,
        },
      );
    });
    onCleanup(() => {
      // remove all AttrInst vertex.
      // TODO: This is breaking when new row is added, its interesting to fix this.
      // console.log('called', metaTxnId)
      // revertTransaction(metaTxnId);
    });
    return metaTxnId;
  }
  const rows = klona(rowMetaAttrInst.vertex!.P.rows);
  const metaTxnId = rowMetaAttrInst.vertex!.P.metaTxnId;
  batch(() => {
    for (const attrColumn of tableColumnsTemplate) {
      if (rows[attrColumn.id]) {
        continue;
      }
      const AttrRowResult = newRow(
        graph,
        setGraph,
        metaTxnId,
        graph.vertexes[rowMetaAttrInst.vertex!.id],
        "MetaAttr",
      );
      if (AttrRowResult.error) {
        showErrorToast(AttrRowResult.error.toString());
      }
      const P = klona(attrColumn.P);
      P.templateId = attrColumn.id;

      if (!P.component) {
        const component = getCollAttrComp(attrColumn, graph)?.P[IdAttr];
        if (component) P.component = component;
      }
      mergeVertexProperties(
        metaTxnId,
        AttrRowResult.vertexId!,
        graph,
        setGraph,
        P,
      );
      rows[attrColumn.id] = AttrRowResult.vertexId!;
    }
    mergeVertexProperties(
      metaTxnId,
      rowMetaAttrInst.vertex!.id,
      graph,
      setGraph,
      { rows },
    );
  });
  onCleanup(() => {
    // remove all AttrInst vertex.
    // TODO: This is breaking when new row is added, its interesting to fix this.
    // console.log('called', metaTxnId)
    // revertTransaction(metaTxnId);
  });
  return metaTxnId;
}
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
  txnId: number,
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
  id: Id,
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

export function addMetaVertexes(
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
  txnId: number,
  vertex: Vertex,
  attributes: FieldAttribute[],
) {
  const { showErrorToast } = useToast();

  for (const attribute of attributes) {
    // if (attribute?.props?.skip) {
    //   continue;
    // }
    const attr = klona(attribute);
    if (!attr.tab) attr.tab = "main";
    // @ts-ignore
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
}

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
  // @ts-ignore
  setGraph("vertexes", vertex.id, "D", {
    [attribute.P[IdAttr]]: attribute.P.dataType,
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

export function addNewRow(
  txnId: number,
  meta: Vertex,
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
  parentVertex: Vertex,
  properties: { [key: string]: any },
  isRealTime: boolean,
  Ws: ServerEventsDispatcher,
) {
  if (isRealTime) {
    txnId = getNewTxnId(graph, setGraph);
  }
  const type = getToEdge(meta, parentVertex);
  const label = meta.P.props || {}["label"];

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
}
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
  const isNew = typeof formVertex.id === "number" && formVertex.id < 0;
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
    if (attribute.P.component === "Select" || attribute.P.component === "Tag") {
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
// 'type' or 'label' can be overwritten in the meta.

export function getFormMetaData(
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
  formId: string,
) {
  let form =
    AttrsTableData[formId] ||
    (AdminAttrKeys.includes(formId) && AttrsAdminTableData[formId]);

  if (!form) {
    const formResult = getFormApiFromForm(graph, setGraph, formId);
    if (formResult.error) return formResult;
    form = formResult.form!;
  }
  return { error: false, form };
}

export function getExportCode(
  graph: Store<GraphInterface>,
  meta: Vertex,
  data: Vertex,
) {
  const getChildren = (
    meta: Vertex,
    vertex: Vertex,
    result: {
      [key: string]: any;
    },
  ) => {
    const { showErrorToast } = useToast();

    const metaVertexes = getSublistRowsForType(graph, "MetaAttr", meta);
    // const props = meta.P.props || {};
    const selectMetaVertexes = metaVertexes.filter((meta) =>
      ["SelectBox", "TagBox"].includes(meta.P.component),
    );
    const tableMetaVertexes = metaVertexes.filter((meta) =>
      ["Table"].includes(meta.P.component),
    );

    for (const metaVertex of selectMetaVertexes) {
      const metaProps = metaVertex.P.props || {};

      if (metaProps.inward) {
        // result['IN'] = {} as {[EdgeType: string]: {[primaryKey: string]: any}[]};
      } else {
        const type = getToEdge(metaVertex, vertex);
        // also can use selectedValue function;
        const childVertexes = getSublistRows(graph, metaVertex, vertex);

        for (const v of childVertexes) {
          // getCollFromCollectionExpr function is not available means Cant find a collection from meta,
          // so get Primary Key from Vertex itself.
          const label = v.L[0];
          if (AttrsTableData[label] || AdminAttrKeys.includes(label)) {
            const pksResult = {} as { [primaryKey: string]: any };
            pksResult.name = v.P.name;
            if (!result.OUT) {
              result.OUT = {} as {
                [EdgeType: string]: { [primaryKey: string]: any }[];
              };
            }
            result.OUT[type] = [pksResult];
            // getChildren(metaVertex, v, pksResult);
          } else {
            const collVertex = findVertexByLabelAndUniqueId(
              graph,
              "Coll",
              "name",
              label,
            );
            if (!collVertex) {
              showErrorToast(`Collection not defined: ${label}`);
              continue;
            }
            const pks = getPkForCollection(graph, collVertex);

            const pksResult = {} as { [primaryKey: string]: any };
            for (const pk of pks) {
              pksResult[pk] = v.P[pk];
            }
            if (pks.length === 0) {
              pksResult.name = v.P.name;
            }

            if (!result.OUT) {
              result.OUT = {} as {
                [EdgeType: string]: { [primaryKey: string]: any }[];
              };
            }

            if (!result.OUT[type]) {
              result.OUT[type] = [pksResult];
            } else {
              result.OUT[type].push(pksResult);
            }
            // getChildren(metaVertex, v, pksResult);
          }
        }
      }
    }
    for (const metaVertex of tableMetaVertexes) {
      const metaProps = metaVertex.P.props || {};

      if (metaProps.inward) {
        // not possible now
      } else {
        const type = getToEdge(metaVertex, vertex);
        const childVertexes = getSublistRows(graph, metaVertex, vertex);

        const out = childVertexes.map((v) =>
          getChildren(metaVertex, v, {
            ...klona(v),
            L: v.L[0],
            IN: undefined,
            OUT: undefined,
            id: undefined,
            D: undefined,
          }),
        );
        if (out.length > 0) {
          if (!result.OUT) {
            result.OUT = { [type]: out } as {
              [EdgeType: string]: { [primaryKey: string]: any }[];
            };
          } else result.OUT[type] = out;
        }
      }
    }

    return result;
  };

  return getChildren(meta, data, {
    ...klona(data),
    L: data.L[0],
    IN: undefined,
    OUT: undefined,
    id: undefined,
    D: undefined,
  });
}
