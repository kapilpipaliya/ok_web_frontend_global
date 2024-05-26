import { removeUndefinedProperties } from "~/lib/functions";
import { Node } from "~/cypher_api/functions/Type";
import { SetStoreFunction, Store } from "solid-js/store";
import { GraphInterface, IdAttr } from "~/lib/graph/graph";
import {
  getChildVertexMGCall,
  getChildVertexesMGCall,
  getParentVertexMGCall,
  getSelectionOptionsMGCall,
} from "./traverse";
import { findVertexMGCall } from "~/cypher_api/functions/findVertex";
import { FieldAttribute, FormMetaData } from "~/lib/Type";
import { getDriver } from "~/cypher_api/server/driver";
import { getRequestURL } from "vinxi/http";
import { getSubDomain } from "~/cypher_api/server/domain_utils";

export async function getCompPropsMapMGCall(comp: Node) {
  const children = await getChildVertexesMGCall(["$0Prop"], [comp]);
  return (children.vertexes || []).reduce(
    (acc, curr) => {
      acc[curr.P.name] = curr;
      return acc;
    },
    {} as { [key: string]: Node },
  );
}

export async function getCompPropsMGCall(comp: Node) {
  const children = await getChildVertexesMGCall(["$0Prop"], [comp]);
  return (children.vertexes || []).reduce(
    (acc, curr) => {
      if (curr.P.name && curr.P.value !== undefined) {
        acc[curr.P.name] = curr.P.value;
      }
      return acc;
    },
    {} as { [key: string]: any },
  );
}

export async function getRowPropsMGCall(comp: Node) {
  const children = await getChildVertexesMGCall(["$0Prop"], [comp]);
  return (children.vertexes || []).reduce(
    async (acc, curr) => {
      const key = (
        await getSelectionOptionsMGCall([curr], "->$0Name::'P.name'")
      ).vertexes;
      if (key && curr.P.value !== undefined) {
        acc[key] = curr.P.value;
      }

      return acc;
    },
    {} as { [key: string]: any },
  );
}

function getComponentPropertiesMGCall(metaRows: Node[]) {
  const metaData = metaRows.reduce(
    async (acc, curr) => {
      const key = (await getSelectionOptionsMGCall([curr], "::'P.name'"))
        .vertexes; // ->$0Name:P.name||:P.name
      if (key && curr.P.value !== undefined) {
        acc[key] = curr.P.value;
      }
      return acc;
    },
    {} as { [key: string]: any },
  );
  return metaData;
}

export async function getCollAttrsMGCall(
  vertexCollAttr: Node,
): Promise<{ error: boolean; attr?: FieldAttribute }> {
  const attr = Object.assign(
    {},
    removeUndefinedProperties(vertexCollAttr.P, false, 10),
  );
  attr.metaId = vertexCollAttr.id;

  let collAttrCompResult = await getChildVertexMGCall(
    ["$0Comp"],
    vertexCollAttr,
  );
  let collAttrComp = collAttrCompResult.vertex;

  // set dataType to attr
  const dataType = await getChildVertexMGCall(["$0DataType"], vertexCollAttr);
  if (dataType.error) {
    if (!collAttrComp) {
      console.warn(
        "data Type not found for attr",
        vertexCollAttr.P.name,
        "taking string dataType",
      );
      const dataTypeVertex = await findVertexMGCall(
        "DataType",
        "name",
        "String",
      );
      if (dataTypeVertex.error) {
        console.warn("String data Type not found");
        return { error: true };
      }
      dataType.vertex = dataTypeVertex.vertex!;
      attr.dataType = dataType.vertex!.P[IdAttr];
    } else {
      const dataTypeFromComp = await getParentVertexMGCall(
        ["DataTypeComp"],
        collAttrComp,
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

  const collAttrCollResult = await getChildVertexMGCall(
    ["$0Coll"],
    vertexCollAttr,
  );
  const collAttrColl = collAttrCollResult.vertex!;

  // set props to attr
  let collProps = (
    (await getChildVertexesMGCall(["$0Prop"], [vertexCollAttr])).vertexes || []
  ).reduce(
    async (acc, curr) => {
      const key = (
        await getSelectionOptionsMGCall([curr], "->$0Name::'P.name'")
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
    const dataTypeDefault = await getChildVertexMGCall(
      ["$0Default"],
      dataType.vertex!,
    );
    if (dataTypeDefault.error) {
      console.warn("Component not configured");
      return { error: true };
    }
    collAttrComp = dataTypeDefault.vertex!;
  }

  const compProps = await getCompPropsMGCall(collAttrComp);
  collProps = Object.assign(
    {},
    removeUndefinedProperties(compProps, false, 10),
    collProps,
  );

  const parentVertexResult = await getParentVertexMGCall(
    ["CompChild"],
    collAttrComp,
  );
  if (!parentVertexResult.error) {
    const parentCompProps = (
      (await getChildVertexesMGCall(["CompProp"], [parentVertexResult.vertex!]))
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

const getCollectionOneLevelAttrsMGCall = async (
  collVertex: Node,
): Promise<{ error: string; attrs?: FieldAttribute[] }> => {
  const vertexCollAttrResult = await getChildVertexesMGCall(
    ["Attr"],
    [collVertex],
  );
  if (vertexCollAttrResult.error) {
    return { error: "No Attributes in a Coll" };
  }
  const collAttrs = vertexCollAttrResult.vertexes!.sort(
    (a, b) => a.P.pos - b.P.pos,
  );
  let attrs: FieldAttribute[] = [];

  for (const vertexCollAttr of collAttrs) {
    const addPropsResult = await getCollAttrsMGCall(vertexCollAttr);
    if (addPropsResult.error) continue;
    const attributes = await getCollectionOneLevelAttrsMGCall(vertexCollAttr);
    if (!attributes.error) {
      addPropsResult.attr!.attributes = attributes.attrs!;
    }
    attrs.push(addPropsResult.attr!);
  }
  return { error: "", attrs };
};
export async function getFormApiFromFormMGCall(
  formId: string,
): Promise<{ error: string; form?: FormMetaData }> {
  "use server";
  const host = getRequestURL().hostname;
  const subDomain = await getSubDomain(host);
  const driver = await getDriver(subDomain);
  const session = driver.session();
  const collResult = await findVertexMGCall("Coll", IdAttr, formId);
  if (collResult.error) {
    return { error: "coll not found" };
  }
  const coll = collResult.vertex!;
  const attrsResult = await getCollectionOneLevelAttrsMGCall(coll);
  if (attrsResult.error) {
    return { error: attrsResult.error };
  }

  return {
    error: "",
    form: {
      attributes: attrsResult.attrs!,
      [IdAttr]: coll.P[IdAttr],
      title: coll.P.title,
      isRealTime: coll.P.isRealTime,
      // collection used in Grid, its same like id key
      // @ts-ignore
      collection: coll.P[IdAttr],
    },
  };
}

// TODO: when meta changed realtime its not updating.
export async function componentPropsMGCall(metaVertex: Node, data: Node) {
  const meta = metaVertex.P.meta.split("+");
  const results = [] as { [key: string]: any }[];
  for (const metaPart of meta) {
    const metaRows =
      (await getSelectionOptionsMGCall([data], metaPart)).vertexes || [];
    const metaData = getComponentPropertiesMGCall(metaRows);
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

export async function getPkForCollectionMGCall(collVertex: Node) {
  const pks =
    (await getChildVertexesMGCall(["$0Pk"], [collVertex])).vertexes || [];
  return pks.map((pk) => pk.P.name);
}

export async function getNameKeyForCollectionMGCall(collVertex: Node) {
  const pks =
    (await getChildVertexesMGCall(["$0NameKey"], [collVertex])).vertexes || [];
  return pks.map((pk) => pk.P.name);
}

export async function getStringComponentMGCall(attrDataTypeVertex?: Node) {
  if (!attrDataTypeVertex) {
    const attrDataTypeVertexResult = await findVertexMGCall(
      "DataType",
      "name",
      "String",
    );
    if (attrDataTypeVertexResult.error) {
      return;
    }
    attrDataTypeVertex = attrDataTypeVertexResult.vertex!;
  }
  return (await getChildVertexMGCall(["$0Default"], attrDataTypeVertex!))
    .vertex;
}

export async function getCollAttrCompMGCall(
  attrVertex: Node,
): Promise<Node | undefined> {
  const attrComp = (await getChildVertexMGCall(["$0Comp"], attrVertex)).vertex;
  if (attrComp) return attrComp;

  let attrDataTypeVertex = (
    await getChildVertexMGCall(["$0DataType"], attrVertex)
  ).vertex;
  return getStringComponentMGCall(attrDataTypeVertex);
}

export async function getSublistRowsForTypeMGCall(type: string, vertex: Node) {
  return (
    (await getChildVertexesMGCall([`${type}`], [vertex])).vertexes || []
  ).sort((a, b) => a.P.pos - b.P.pos);
}
