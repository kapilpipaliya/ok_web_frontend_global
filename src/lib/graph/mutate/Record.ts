import {
  getNewGraphId,
  getNewTxnId,
  GraphInterface,
  Id,
  IdAttr,
  Vertex,
} from "../graph";
import { klona } from "klona/json";
import {
  findVertexByLabelAndUniqueId,
  mergeVertexProperties,
  newVertex,
} from "./Vertex";
import { batch, onCleanup, untrack } from "solid-js";
import {
  addNewRow,
  AdminAttrKeys,
  AttrsTableData,
  getChildVertex,
  getChildVertexes,
  getParentVertex,
  getSelectionOptions,
  getSublistRows,
  getSublistRowsForType,
  newRow,
  Record,
} from "../../Utils";
import { getToEdge } from "../get/sync/getToEdge";
import { removeUndefinedProperties } from "../../functions";
import { setSelectionValue } from "../../../components/dynamic/fields/static/SelectionUtils";
import { AttrsAdminTableData } from "../../apiAdmin";
import { FieldAttribute, FormMetaData } from "../../Type";
import { SetStoreFunction, Store } from "solid-js/store";

export function getCompPropsMap(graph: Store<GraphInterface>, comp: Vertex) {
  return (getChildVertexes(graph, ["$0Prop"], [comp]).vertexes || []).reduce(
    (acc, curr) => {
      acc[curr.P.name] = curr;
      return acc;
    },
    {} as { [key: string]: Vertex },
  );
}

export function getCompProps(graph: Store<GraphInterface>, comp: Vertex) {
  return (getChildVertexes(graph, ["$0Prop"], [comp]).vertexes || []).reduce(
    (acc, curr) => {
      if (curr.P.name && curr.P.value !== undefined) {
        acc[curr.P.name] = curr.P.value;
      }
      return acc;
    },
    {} as { [key: string]: any },
  );
}

export function getRowProps(
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
  comp: Vertex,
) {
  return (getChildVertexes(graph, ["$0Prop"], [comp]).vertexes || []).reduce(
    (acc, curr) => {
      const key = getSelectionOptions(
        graph,
        setGraph,
        [curr],
        "->$0Name::'P.name'",
      ).vertexes;
      if (key && curr.P.value !== undefined) {
        acc[key] = curr.P.value;
      }

      return acc;
    },
    {} as { [key: string]: any },
  );
}

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

function getComponentProperties(
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
  metaRows: Vertex[],
) {
  const metaData = metaRows.reduce(
    (acc, curr) => {
      const key = getSelectionOptions(
        graph,
        setGraph,
        [curr],
        "::'P.name'",
      ).vertexes; // ->$0Name:P.name||:P.name
      if (key && curr.P.value !== undefined) {
        acc[key] = curr.P.value;
      }
      return acc;
    },
    {} as { [key: string]: any },
  );
  return metaData;
}

export function getCollAttrs(
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
  vertexCollAttr: Vertex,
): { error: boolean; attr?: FieldAttribute } {
  const attr = Object.assign(
    {},
    removeUndefinedProperties(vertexCollAttr.P, false, 10),
  );
  attr.metaId = vertexCollAttr.id;

  let collAttrComp = getChildVertex(graph, ["$0Comp"], vertexCollAttr).vertex;

  // set dataType to attr
  const dataType = getChildVertex(graph, ["$0DataType"], vertexCollAttr);
  if (dataType.error) {
    if (!collAttrComp) {
      console.warn(
        "data Type not found for attr",
        vertexCollAttr.P.name,
        "taking string dataType",
      );
      const dataTypeVertex = findVertexByLabelAndUniqueId(
        "DataType",
        "name",
        "String",
        graph,
      );
      if (!dataTypeVertex) {
        console.warn("String data Type not found");
        return { error: true };
      }
      dataType.vertex = dataTypeVertex;
      attr.dataType = dataTypeVertex.P[IdAttr];
    } else {
      const dataTypeFromComp = getParentVertex(
        ["DataTypeComp"],
        collAttrComp,
        graph,
      );
      if (dataTypeFromComp.error) {
        console.warn(
          "data Type not found from Component for attr",
          vertexCollAttr.P.name,
        );
        return { error: true };
      }
      attr.dataType = dataTypeFromComp.vertex!.P[IdAttr];
    }
  } else {
    attr.dataType = dataType.vertex!.P[IdAttr];
  }

  const collAttrColl = getChildVertex(graph, ["$0Coll"], vertexCollAttr).vertex;

  // set props to attr
  let collProps = (
    getChildVertexes(graph, ["$0Prop"], [vertexCollAttr]).vertexes || []
  ).reduce(
    (acc, curr) => {
      const key = getSelectionOptions(
        graph,
        setGraph,
        [curr],
        "->$0Name::'P.name'",
      ).vertexes;
      if (key && curr.P.value !== undefined) {
        acc[key] = curr.P.value;
      }
      return acc;
    },
    {} as { [key: string]: any },
  );
  if (collAttrColl) {
    collProps.collection = collAttrColl["P"]?.["name"];
  }

  // merge default component props
  if (!collAttrComp) {
    const dataTypeDefault = getChildVertex(
      graph,
      ["$0Default"],
      dataType.vertex!,
    );
    if (dataTypeDefault.error) {
      console.warn("Component not configured");
      return { error: true };
    }
    collAttrComp = dataTypeDefault.vertex!;
  }

  const compProps = getCompProps(graph, collAttrComp);
  collProps = Object.assign(
    {},
    removeUndefinedProperties(compProps, false, 10),
    collProps,
  );

  const parentVertexResult = getParentVertex(
    ["CompChild"],
    collAttrComp,
    graph,
  );
  if (!parentVertexResult.error) {
    const parentCompProps = (
      getChildVertexes(graph, ["CompProp"], [parentVertexResult.vertex!])
        .vertexes || []
    ).reduce(
      (acc, curr) => {
        if (curr.P.name && curr.P.value !== undefined) {
          acc[curr.P.name] = curr.P.value;
        }
        return acc;
      },
      {} as { [key: string]: any },
    );
    collProps = Object.assign(
      {},
      removeUndefinedProperties(parentCompProps, false, 10),
      collProps,
    );
    attr.component = parentVertexResult.vertex!.P[IdAttr];
  } else {
    attr.component = collAttrComp.P[IdAttr];
  }
  attr.props = collProps;
  return { error: false, attr };
}

const getCollectionOneLevelAttrs = (
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
  collVertex: Vertex,
): { error: string; attrs?: FieldAttribute[] } => {
  const vertexCollAttrResult = getChildVertexes(graph, ["Attr"], [collVertex]);
  if (vertexCollAttrResult.error) {
    return { error: "No Attributes in a Coll" };
  }
  const collAttrs = vertexCollAttrResult.vertexes!.sort(
    (a, b) => a.P.pos - b.P.pos,
  );
  let attrs: FieldAttribute[] = [];

  for (const vertexCollAttr of collAttrs) {
    const addPropsResult = getCollAttrs(graph, setGraph, vertexCollAttr);
    if (addPropsResult.error) continue;
    const attributes = getCollectionOneLevelAttrs(
      graph,
      setGraph,
      vertexCollAttr,
    );
    if (!attributes.error) {
      addPropsResult.attr!.attributes = attributes.attrs!;
    }
    attrs.push(addPropsResult.attr!);
  }
  return { error: "", attrs };
};
export const getFormApiFromForm = (
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
  formId: string,
): { error: string; form?: FormMetaData } => {
  const coll = findVertexByLabelAndUniqueId("Coll", IdAttr, formId, graph);
  if (!coll) {
    return { error: "coll not found" };
  }
  const attrsResult = getCollectionOneLevelAttrs(graph, setGraph, coll);
  if (attrsResult.error) {
    return { error: attrsResult.error };
  }

  return {
    error: "",
    form: {
      ...coll.P,
      attributes: attrsResult.attrs!,
      // collection used in Grid, its same like id key
      // @ts-ignore
      collection: coll.P[IdAttr],
    },
  };
};

// TODO: when meta changed realtime its not updating.
export function componentProps(
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
  metaVertex: Vertex,
  data: Vertex,
) {
  const meta = metaVertex.P.meta.split("+");
  const results = [] as { [key: string]: any }[];
  for (const metaPart of meta) {
    const metaRows =
      getSelectionOptions(graph, setGraph, [data], metaPart).vertexes || [];
    const metaData = getComponentProperties(graph, setGraph, metaRows);
    results.push(metaData);
  }
  return results.reduce(
    (acc, curr) => {
      Object.assign(acc, curr);
      return acc;
    },
    {} as { [key: string]: any },
  );
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
      mergeVertexProperties(getNewTxnId(), metaVertex.id, graph, setGraph, {
        props: newMetaData,
      });
    });
  }
}

export function getPkForCollection(
  graph: Store<GraphInterface>,
  collVertex: Vertex,
) {
  const pks = getChildVertexes(graph, ["$0Pk"], [collVertex]).vertexes || [];
  return pks.map((pk) => pk.P.name);
}

export function getNameKeyForCollection(
  graph: Store<GraphInterface>,
  collVertex: Vertex,
) {
  const pks =
    getChildVertexes(graph, ["$0NameKey"], [collVertex]).vertexes || [];
  return pks.map((pk) => pk.P.name);
}

// 'type' or 'label' can be overwritten in the meta.

export function rowMetaInitialize(
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
  joinVertex: Vertex,
  meta: Vertex,
  tableColumnsTemplate: Vertex[],
) {
  const rowMetaAttrInst = getChildVertex(graph, ["AttrInst"], joinVertex);
  if (rowMetaAttrInst.error) {
    const rows = {} as { [key: Id]: Id };
    const metaTxnId = getNewTxnId();
    batch(() => {
      const metaInstanceResult = newRow(
        graph,
        setGraph,
        metaTxnId,
        joinVertex,
        "AttrInst",
      );
      if (metaInstanceResult.error) {
        alert("Error creating a row for attribute instance");
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
          alert(AttrRowResult.error);
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
  } else {
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
          alert(AttrRowResult.error);
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
}

export const getFormMetaData = (
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
  formId: string,
) => {
  let form =
    AttrsTableData[formId] ||
    (AdminAttrKeys.includes(formId) && AttrsAdminTableData[formId]);

  if (!form) {
    const formResult = getFormApiFromForm(graph, setGraph, formId);
    if (formResult.error) return formResult;
    form = formResult.form!;
  }
  return { error: false, form };
};

export const getExportCode = (graph: Store<GraphInterface>, record: Record) => {
  const getChildren = (
    meta: Vertex,
    vertex: Vertex,
    result: {
      [key: string]: any;
    },
  ) => {
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
            pksResult["name"] = v.P["name"];
            if (!result["OUT"]) {
              result["OUT"] = {} as {
                [EdgeType: string]: { [primaryKey: string]: any }[];
              };
            }
            result["OUT"][type] = [pksResult];
            // getChildren(metaVertex, v, pksResult);
          } else {
            const collVertex = findVertexByLabelAndUniqueId(
              "Coll",
              "name",
              label,
              graph,
            );
            if (!collVertex) {
              alert(`Collection not defined: ${label}`);
              continue;
            }
            const pks = getPkForCollection(graph, collVertex);

            const pksResult = {} as { [primaryKey: string]: any };
            for (const pk of pks) {
              pksResult[pk] = v.P[pk];
            }
            if (pks.length === 0) {
              pksResult["name"] = v.P["name"];
            }

            if (!result["OUT"]) {
              result["OUT"] = {} as {
                [EdgeType: string]: { [primaryKey: string]: any }[];
              };
            }

            if (!result["OUT"][type]) {
              result["OUT"][type] = [pksResult];
            } else {
              result["OUT"][type].push(pksResult);
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
          if (!result["OUT"]) {
            result["OUT"] = { [type]: out } as {
              [EdgeType: string]: { [primaryKey: string]: any }[];
            };
          } else result["OUT"][type] = out;
        }
      }
    }

    return result;
  };

  return getChildren(record.metaVertex, record.vertex, {
    ...klona(record.vertex),
    L: record.vertex.L[0],
    IN: undefined,
    OUT: undefined,
    id: undefined,
    D: undefined,
  });
};

export function getStringComponent(
  graph: Store<GraphInterface>,
  attrDataTypeVertex?: Vertex,
) {
  if (!attrDataTypeVertex) {
    attrDataTypeVertex = findVertexByLabelAndUniqueId(
      "DataType",
      "name",
      "String",
      graph,
    );
    if (!attrDataTypeVertex) {
      return;
    }
  }
  return getChildVertex(graph, ["$0Default"], attrDataTypeVertex).vertex;
}

export function getCollAttrComp(
  attrVertex: Vertex,
  graph: Store<GraphInterface>,
): Vertex | undefined {
  const attrComp = getChildVertex(graph, ["$0Comp"], attrVertex).vertex;
  if (attrComp) return attrComp;

  let attrDataTypeVertex = getChildVertex(
    graph,
    ["$0DataType"],
    attrVertex,
  ).vertex;
  return getStringComponent(graph, attrDataTypeVertex);
}
