import { klona } from "klona/json";
import { AdminAttrKeys, AttrsTableData } from "~/lib/Utils";
import {
  getChildVertex,
  getChildVertexes,
  getParentVertex,
  getSelectionOptions,
  getSublistRows,
  getSublistRowsForType,
} from "~/lib/graph/get/sync/graph_fns";
import { removeUndefinedProperties } from "~/lib/functions";
import { AttrsAdminTableData } from "~/lib/apiAdmin";
import { FieldAttribute, FormMetaData } from "~/lib/Type";
import { SetStoreFunction, Store } from "solid-js/store";
import { GraphInterface, IdAttr, Vertex } from "~/lib/graph/graph";
import { findVertexByLabelAndUniqueIdAsync } from "./findVertex";
import { getToEdgeAsync } from "./getToEdge";
import { useToast } from "~/components/custom/Toast";

export async function getCompPropsMapAsync(
  graph: Store<GraphInterface>,
  comp: Vertex,
) {
  return (getChildVertexes(graph, ["$0Prop"], [comp]).vertexes || []).reduce(
    (acc, curr) => {
      acc[curr.P.name] = curr;
      return acc;
    },
    {} as { [key: string]: Vertex },
  );
}

export async function getCompPropsAsync(
  graph: Store<GraphInterface>,
  comp: Vertex,
) {
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

export async function getRowPropsAsync(
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

export async function getCollAttrsAsync(
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
  vertexCollAttr: Vertex,
): Promise<{ error: boolean; attr?: FieldAttribute }> {
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
      const dataTypeVertex = await findVertexByLabelAndUniqueIdAsync(
        graph,
        "DataType",
        "name",
        "String",
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

  const compProps = getCompPropsAsync(graph, collAttrComp);
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

const getCollectionOneLevelAttrsAsync = async (
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
  collVertex: Vertex,
): Promise<{ error: string; attrs?: FieldAttribute[] }> => {
  const vertexCollAttrResult = getChildVertexes(graph, ["Attr"], [collVertex]);
  if (vertexCollAttrResult.error) {
    return { error: "No Attributes in a Coll" };
  }
  const collAttrs = vertexCollAttrResult.vertexes!.sort(
    (a, b) => a.P.pos - b.P.pos,
  );
  let attrs: FieldAttribute[] = [];

  for (const vertexCollAttr of collAttrs) {
    const addPropsResult = await getCollAttrsAsync(
      graph,
      setGraph,
      vertexCollAttr,
    );
    if (addPropsResult.error) continue;
    const attributes = await getCollectionOneLevelAttrsAsync(
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
export const getFormApiFromFormAsync = async (
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
  formId: string,
): Promise<{ error: string; form?: FormMetaData }> => {
  const coll = await findVertexByLabelAndUniqueIdAsync(
    graph,
    "Coll",
    IdAttr,
    formId,
  );
  if (!coll) {
    return { error: "coll not found" };
  }
  const attrsResult = await getCollectionOneLevelAttrsAsync(
    graph,
    setGraph,
    coll,
  );
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
export async function componentPropsAsync(
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

export async function getPkForCollectionAsync(
  graph: Store<GraphInterface>,
  collVertex: Vertex,
) {
  const pks = getChildVertexes(graph, ["$0Pk"], [collVertex]).vertexes || [];
  return pks.map((pk) => pk.P.name);
}

export async function getNameKeyForCollectionAsync(
  graph: Store<GraphInterface>,
  collVertex: Vertex,
) {
  const pks =
    getChildVertexes(graph, ["$0NameKey"], [collVertex]).vertexes || [];
  return pks.map((pk) => pk.P.name);
}

// 'type' or 'label' can be overwritten in the meta.

export const getFormMetaDataAsync = async (
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
  formId: string,
) => {
  let form =
    AttrsTableData[formId] ||
    (AdminAttrKeys.includes(formId) && AttrsAdminTableData[formId]);

  if (!form) {
    const formResult = await getFormApiFromFormAsync(graph, setGraph, formId);
    if (formResult.error) return formResult;
    form = formResult.form!;
  }
  return { error: "", form };
};

export const getExportCodeAsync = async (
  graph: Store<GraphInterface>,
  meta: Vertex,
  data: Vertex,
) => {
  const getChildren = async (
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
        const type = await getToEdgeAsync(metaVertex, vertex);
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
            const collVertex = await findVertexByLabelAndUniqueIdAsync(
              graph,
              "Coll",
              "name",
              label,
            );
            if (!collVertex) {
              showErrorToast(`Collection not defined: ${label}`);
              continue;
            }
            const pks = await getPkForCollectionAsync(graph, collVertex);

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
        const type = await getToEdgeAsync(metaVertex, vertex);
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

  return getChildren(meta, data, {
    ...klona(data),
    L: data.L[0],
    IN: undefined,
    OUT: undefined,
    id: undefined,
    D: undefined,
  });
};

export async function getStringComponentAsync(
  graph: Store<GraphInterface>,
  attrDataTypeVertex?: Vertex,
) {
  if (!attrDataTypeVertex) {
    attrDataTypeVertex = await findVertexByLabelAndUniqueIdAsync(
      graph,
      "DataType",
      "name",
      "String",
    );
    if (!attrDataTypeVertex) {
      return;
    }
  }
  return getChildVertex(graph, ["$0Default"], attrDataTypeVertex).vertex;
}

export async function getCollAttrCompAsync(
  attrVertex: Vertex,
  graph: Store<GraphInterface>,
): Promise<Vertex | undefined> {
  const attrComp = getChildVertex(graph, ["$0Comp"], attrVertex).vertex;
  if (attrComp) return attrComp;

  let attrDataTypeVertex = getChildVertex(
    graph,
    ["$0DataType"],
    attrVertex,
  ).vertex;
  return getStringComponentAsync(graph, attrDataTypeVertex);
}
