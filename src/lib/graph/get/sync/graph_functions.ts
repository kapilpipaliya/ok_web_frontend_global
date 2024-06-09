import {
  getChildVertex,
  getChildVertexes,
  getParentVertex,
  getSelectionOptions,
} from "./traverse";
import type { FieldAttribute, IFormMetaData } from "~/lib/FormMetadataType";
import type { SetStoreFunction, Store } from "solid-js/store";
import { type GraphInterface, IdAttr, type Vertex } from "~/lib/graph/graph";
import { findVertexByLabelAndUniqueId } from "~/lib/graph/get/sync/findVertex";
import { removeUndefinedProperties } from "~/lib/removeUndefinedProperties";

export function isIdArrayIncludesID(value: Array<any>, id: any) {
  for (const element of value) {
    if (element === id) {
      return true;
    }
  }

  return false;
}

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
      attr.dataType = dataTypeFromComp.vertex?.P[IdAttr];
    }
  } else {
    attr.dataType = dataType.vertex?.P[IdAttr];
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
    collProps.collection = collAttrColl.P?.name;
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
    attr.component = parentVertexResult.vertex?.P[IdAttr];
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
  const collAttrs = vertexCollAttrResult.vertexes?.sort(
    (a, b) => a.P.pos - b.P.pos,
  );
  const attrs: FieldAttribute[] = [];

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
export function getFormApiFromForm(
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
  formId: string,
): { error: string; form?: IFormMetaData } {
  const coll = findVertexByLabelAndUniqueId(graph, "Coll", IdAttr, formId);
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
}

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

export function getStringComponent(
  graph: Store<GraphInterface>,
  attrDataTypeVertex?: Vertex,
) {
  if (!attrDataTypeVertex) {
    attrDataTypeVertex = findVertexByLabelAndUniqueId(
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

export function getCollAttrComp(
  attrVertex: Vertex,
  graph: Store<GraphInterface>,
): Vertex | undefined {
  const attrComp = getChildVertex(graph, ["$0Comp"], attrVertex).vertex;
  if (attrComp) return attrComp;

  const attrDataTypeVertex = getChildVertex(
    graph,
    ["$0DataType"],
    attrVertex,
  ).vertex;
  return getStringComponent(graph, attrDataTypeVertex);
} // This method read all property vertexes and make an object.

export function getProps(
  meta: Vertex,
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
) {
  return (getChildVertexes(graph, ["$0Prop"], [meta]).vertexes || []).reduce(
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
}
