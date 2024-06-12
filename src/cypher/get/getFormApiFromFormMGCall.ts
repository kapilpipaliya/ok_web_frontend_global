import { IdAttr, type Vertex } from "~/lib/graph/graph";
import {
  getChildVertexMGCall,
  getChildVertexesMGCall,
  getParentVertexMGCall,

} from "./traverse";
import type { FieldAttribute, IFormMetaData } from "~/lib/FormMetadataType";
import { getDriver } from "~/cypher/driver";
import { getRequestURL } from "vinxi/http";
import { getSubDomain } from "~/server/domain_utils";
import { findVertexesMGCall } from "~/cypher/get/findVertex";
import { removeUndefinedProperties } from "~/lib/removeUndefinedProperties";
import {getSelectionOptionsMGCall} from "~/cypher/get/getSelectionOptionsMGCall";


export async function getCompPropsMGCall(comp: Vertex) {
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


export async function getCollAttrsMGCall(
  vertexCollAttr: Vertex,
): Promise<{ error: boolean; attr?: FieldAttribute }> {
  const attr = Object.assign(
    {},
    removeUndefinedProperties(vertexCollAttr.P, false, 10),
  );
  attr.metaId = vertexCollAttr.id;

  const collAttrCompResult = await getChildVertexMGCall(
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
      const dataTypeVertex = await findVertexesMGCall({
        label: "DataType",
        value: "String",
        attribute: "name",
      });
      if (dataTypeVertex.error) {
        console.warn("String data Type not found");
        return { error: true };
      }
      dataType.vertex = dataTypeVertex.vertexes!;
      attr.dataType = dataType.vertex?.P[IdAttr];
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
      attr.dataType = dataTypeFromComp.vertex?.P[IdAttr];
    }
  } else {
    attr.dataType = dataType.vertex?.P[IdAttr];
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
    collProps.collection = collAttrColl.P?.name;
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
    attr.component = parentVertexResult.vertex?.P[IdAttr];
  } else {
    attr.component = collAttrComp.P[IdAttr];
  }
  attr.props = collProps;
  return { error: false, attr };
}

const getCollectionOneLevelAttrsMGCall = async (
  collVertex: Vertex,
): Promise<{ error: string; attrs?: FieldAttribute[] }> => {
  const vertexCollAttrResult = await getChildVertexesMGCall(
    ["Attr"],
    [collVertex],
  );
  if (vertexCollAttrResult.error) {
    return { error: "No Attributes in a Coll" };
  }
  const collAttrs = vertexCollAttrResult.vertexes?.sort(
    (a, b) => a.P.pos - b.P.pos,
  );
  const attrs: FieldAttribute[] = [];

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
): Promise<{ error: string; form?: IFormMetaData }> {
  "use server";
  const host = getRequestURL().hostname;
  const subDomain = await getSubDomain(host);
  const driver = await getDriver(subDomain);
  const session = driver.session();
  const collResult = await findVertexesMGCall({
    label: "Coll",
    attribute: IdAttr,
    value: formId,
  });
  if (collResult.error) {
    return { error: "coll not found" };
  }

  const coll = collResult.vertexes!;
  const attrsResult = await getCollectionOneLevelAttrsMGCall(coll);
  if (attrsResult.error) {
    return { error: attrsResult.error };
  }

  return JSON.parse(
    JSON.stringify({
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
    }),
  );
}
