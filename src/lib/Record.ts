import {
 getNewGraphId,
 getNewTxnId,
 graph,
 Id,
 IdAttr,
 Vertex
} from "./graph";
import { klona } from "klona/json";
import {
 findVertexByLabelAndUniqueId,
 mergeVertexProperties, newVertex
} from "./Vertex";
import { batch, onCleanup, untrack } from "solid-js";
import {
 getChildVertex,
 getChildVertexes,
 getSelectionOptions,
 AdminAttrKeys,
 AttrsTableData,
 getParentVertex, addNewRow, getSublistRows, getSublistRowsForType,
} from "./Utils";
import { getToEdge } from "./CommonUtils/getToEdge";
import { removeUndefinedProperties } from "../utils/functions";
import { Record } from "./Utils";
import { newRow } from "./Utils";
import {setSelectionValue} from "../components/input/SelectionUtils";
import {AttrsAdminTableData} from "./apiAdmin";
import {FieldAttribute, FormMetaData} from "./Type";

export function getCompPropsMap(comp: Vertex) {
 return (getChildVertexes(["$0Prop"], [comp]).vertexes || []).reduce((acc, curr) => {
   acc[curr.P.name] = curr;
  return acc;
 }, {} as { [key: string]: Vertex });
}

export function getCompProps(comp: Vertex) {
 return (getChildVertexes(["$0Prop"], [comp]).vertexes || []).reduce((acc, curr) => {
  if (curr.P.name && curr.P.value !== undefined) {
   acc[curr.P.name] = curr.P.value;
  }
  return acc;
 }, {} as { [key: string]: any });
}

export function getRowProps(comp: Vertex) {
 return (getChildVertexes(["$0Prop"], [comp]).vertexes || []).reduce((acc, curr) => {

  const key = getSelectionOptions([curr], "->$0Name::'P.name'").vertexes;
  if (key && curr.P.value !== undefined) {
   acc[key] = curr.P.value;
  }

  return acc;
 }, {} as { [key: string]: any });
}
export function cloneRowProps(txnId: number, fromVertex: Vertex, toVertex: Vertex) {
 const propRows = (getChildVertexes(["$0Prop"], [fromVertex]).vertexes || []);

 const attrPropMetaVertex = newVertex(getNewGraphId(), [], {
  name: "Prop",
 });
 const attrNameVertex = newVertex(getNewGraphId(), [], {
  name: "Name",
  component: "SelectBox",
 });

 for (const propRow of propRows) {
  const nameVertex = getChildVertex(["$0Name"], propRow);
  if (nameVertex.vertex) {
   const rowResult = addNewRow(
     txnId,
     attrPropMetaVertex,
     toVertex,
     klona(propRow.P),
     false,
     {} as any
   );
   const rowVertex = graph.vertexes[rowResult.vertexId!];
   setSelectionValue(txnId, rowVertex, attrNameVertex, nameVertex.vertex.id);
  }
 }
}

function getComponentProperties(metaRows: Vertex[]) {
 const metaData = metaRows.reduce((acc, curr) => {
  const key = getSelectionOptions([curr], "::'P.name'").vertexes; // ->$0Name:P.name||:P.name
  if (key && curr.P.value !== undefined) {
   acc[key] = curr.P.value;
  }
  return acc;
 }, {} as { [key: string]: any });
 return metaData;
}

export function getCollAttrs(vertexCollAttr: Vertex): { error: boolean; attr?: FieldAttribute } {
 const attr = Object.assign({}, removeUndefinedProperties(vertexCollAttr.P, false, 10));
 attr.metaId = vertexCollAttr.id;

 let collAttrComp = getChildVertex(["$0Comp"], vertexCollAttr).vertex;

 // set dataType to attr
 const dataType = getChildVertex(["$0DataType"], vertexCollAttr);
 if (dataType.error) {
  if (!collAttrComp) {
   console.warn("data Type not found for attr", vertexCollAttr.P.name, "taking string dataType");
   const dataTypeVertex = findVertexByLabelAndUniqueId('DataType', 'name', 'String');
   if (!dataTypeVertex) {
    console.warn("String data Type not found");
    return { error: true };
   }
   dataType.vertex = dataTypeVertex;
   attr.dataType = dataTypeVertex.P[IdAttr];
  } else {
   const dataTypeFromComp = getParentVertex(["DataTypeComp"], collAttrComp);
   if (dataTypeFromComp.error) {
    console.warn("data Type not found from Component for attr", vertexCollAttr.P.name);
    return { error: true };
   }
   attr.dataType = dataTypeFromComp.vertex!.P[IdAttr];
  }
 } else {
  attr.dataType = dataType.vertex!.P[IdAttr];
 }

 const collAttrColl = getChildVertex(["$0Coll"], vertexCollAttr).vertex;

 // set props to attr
  let collProps = (getChildVertexes(["$0Prop"], [vertexCollAttr]).vertexes || []).reduce((acc, curr) => {
   const key = getSelectionOptions([curr], "->$0Name::'P.name'").vertexes;
   if (key && curr.P.value !== undefined) {
    acc[key] = curr.P.value;
   }
   return acc;
  }, {} as { [key: string]: any });
  if (collAttrColl) {
   collProps.collection = collAttrColl['P']?.['name'];
  }

 // merge default component props
 if (!collAttrComp) {
  const dataTypeDefault = getChildVertex(["$0Default"], dataType.vertex!);
  if (dataTypeDefault.error) {
   console.warn("Component not configured");
   return { error: true };
  }
  collAttrComp = dataTypeDefault.vertex!;
 }

 const compProps = getCompProps(collAttrComp);
 collProps = Object.assign({}, removeUndefinedProperties(compProps, false, 10), collProps);


 const parentVertexResult = getParentVertex(["CompChild"], collAttrComp);
 if (!parentVertexResult.error) {
  const parentCompProps = (getChildVertexes(["CompProp"], [parentVertexResult.vertex!]).vertexes || []).reduce(
   (acc, curr) => {
    if (curr.P.name && curr.P.value !== undefined) {
     acc[curr.P.name] = curr.P.value;
    }
    return acc;
   },
   {} as { [key: string]: any }
  );
  collProps = Object.assign({}, removeUndefinedProperties(parentCompProps, false, 10), collProps);
  attr.component = parentVertexResult.vertex!.P[IdAttr];
 } else {
  attr.component = collAttrComp.P[IdAttr];
 }
 attr.props = collProps;
 return { error: false, attr };
}

const getCollectionOneLevelAttrs = (collVertex: Vertex): { error: string; attrs?: FieldAttribute[] } => {
 const vertexCollAttrResult = getChildVertexes(["Attr"], [collVertex]);
 if (vertexCollAttrResult.error) {
  return { error: "No Attributes in a Coll" };
 }
 const collAttrs = vertexCollAttrResult.vertexes!.sort((a, b) => a.P.pos - b.P.pos);
 let attrs: FieldAttribute[] = [];

 for (const vertexCollAttr of collAttrs) {
  const addPropsResult = getCollAttrs(vertexCollAttr);
  if (addPropsResult.error) continue;
  const attributes = getCollectionOneLevelAttrs(vertexCollAttr);
  if (!attributes.error) {
   addPropsResult.attr!.attributes = attributes.attrs!;
  }
  attrs.push(addPropsResult.attr!);
 }
 return { error: "", attrs };
};
export const getFormApiFromForm = (formId: string): { error: string; form?: FormMetaData } => {
  const coll = findVertexByLabelAndUniqueId("Coll", IdAttr, formId);
  if (!coll) {
   return { error: "coll not found" };
  }
  const attrsResult = getCollectionOneLevelAttrs(coll);
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
    collection: coll.P[IdAttr]
   }
  };
};
// TODO: when meta changed realtime its not updating.
export function componentProps(metaVertex: Vertex, data: Vertex) {
 const meta = metaVertex.P.meta.split("+");
 const results = [] as { [key: string]: any }[];
 for (const metaPart of meta) {
  const metaRows = getSelectionOptions([data], metaPart).vertexes || [];
  const metaData = getComponentProperties(metaRows);
  results.push(metaData);
 }
 return results.reduce((acc, curr) => {
  Object.assign(acc, curr);
  return acc;
 }, {} as { [key: string]: any });
}

// add meta from vertex value:
export function addMeta(metaVertex: Vertex, data: Vertex) {
 if (metaVertex.P.meta) {
  const metaData = componentProps(metaVertex, data);
  const metaDataVal = removeUndefinedProperties(metaData, false, 10);
  untrack(() => {
   const newMetaData = Object.assign(
    {},
    // when component is rendered dynamically graph.vertexes[metaVertex.P.templateId] value is undefined
    graph.vertexes[metaVertex.P.templateId]?.P?.props || {},
    metaDataVal
   );
   mergeVertexProperties(getNewTxnId(), metaVertex.id, {
    props: newMetaData
   });
  });
 }
}

export function getPkForCollection(collVertex: Vertex) {
 const pks = getChildVertexes(['$0Pk'], [collVertex]).vertexes || [];
 return pks.map(pk => pk.P.name);
}
export function getNameKeyForCollection(collVertex: Vertex) {
 const pks = getChildVertexes(['$0NameKey'], [collVertex]).vertexes || [];
 return pks.map(pk => pk.P.name);
}

// 'type' or 'label' can be overwritten in the meta.


export function rowMetaInitialize(joinVertex: Vertex, meta: Vertex, tableColumnsTemplate: Vertex[]) {
 const rowMetaAttrInst = getChildVertex(["AttrInst"], joinVertex);
 if (rowMetaAttrInst.error) {
  const rows = {} as {[key: Id]: Id};
  const metaTxnId = getNewTxnId();
  batch(() => {
   const metaInstanceResult = newRow(metaTxnId, joinVertex, "AttrInst");
   if (metaInstanceResult.error) {
    alert("Error creating a row for attribute instance");
   }
   mergeVertexProperties(metaTxnId, metaInstanceResult.vertexId!, {
    templateId: meta.id
   });

   for (const attrColumn of tableColumnsTemplate) {
    const AttrRowResult = newRow(metaTxnId, graph.vertexes[metaInstanceResult.vertexId!], "MetaAttr");
    if (AttrRowResult.error) {
     alert(AttrRowResult.error);
    }
    const P = klona(attrColumn.P);
    P.templateId = attrColumn.id;

    if (!P.component) {
     const component = getCollAttrComp(attrColumn)?.P[IdAttr];
     if(component) P.component = component;
    }
    mergeVertexProperties(metaTxnId, AttrRowResult.vertexId!, P);
    rows[attrColumn.id] = AttrRowResult.vertexId!;
   }
   mergeVertexProperties(metaTxnId, metaInstanceResult.vertexId!, {rows, metaTxnId});
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
    const AttrRowResult = newRow(metaTxnId, graph.vertexes[rowMetaAttrInst.vertex!.id], "MetaAttr");
    if (AttrRowResult.error) {
     alert(AttrRowResult.error);
    }
    const P = klona(attrColumn.P);
    P.templateId = attrColumn.id;

    if (!P.component) {
     const component = getCollAttrComp(attrColumn)?.P[IdAttr];
     if(component) P.component = component;
    }
    mergeVertexProperties(metaTxnId, AttrRowResult.vertexId!, P);
    rows[attrColumn.id] = AttrRowResult.vertexId!;
   }
   mergeVertexProperties(metaTxnId, rowMetaAttrInst.vertex!.id, {rows});
  });
  onCleanup(() => {
   // remove all AttrInst vertex.
   // TODO: This is breaking when new row is added, its interesting to fix this.
   // console.log('called', metaTxnId)
   // revertTransaction(metaTxnId);
  });
  return metaTxnId
 }
}

export const getFormMetaData = (formId: string) => {
 let form = AttrsTableData[formId] || (AdminAttrKeys.includes(formId) && AttrsAdminTableData[formId]);

 if (!form) {
  const formResult = getFormApiFromForm(formId);
  if (formResult.error) return formResult;
  form = formResult.form!;
 }
 return { error: false, form };
};

export const getExportCode = (record: Record) => {
 const getChildren = (meta: Vertex, vertex: Vertex, result: {
  [key: string]: any
 }) => {
  const metaVertexes = getSublistRowsForType("MetaAttr", meta);
  // const props = meta.P.props || {};

  const selectMetaVertexes = metaVertexes.filter(meta => ["SelectBox", "TagBox"].includes(meta.P.component));
  const tableMetaVertexes = metaVertexes.filter(meta => ["Table"].includes(meta.P.component));


  for (const metaVertex of selectMetaVertexes) {
   const metaProps = metaVertex.P.props || {};

   if (metaProps.inward) {
    // result['IN'] = {} as {[EdgeType: string]: {[primaryKey: string]: any}[]};

   } else {
    const type = getToEdge(metaVertex, vertex);
    // also can use selectedValue function;
    const childVertexes = getSublistRows(metaVertex, vertex);

    for (const v of childVertexes) {
     // getCollFromCollectionExpr function is not available means Cant find a collection from meta,
     // so get Primary Key from Vertex itself.
     const label = v.L[0];
     if (AttrsTableData[label] || AdminAttrKeys.includes(label)) {
      const pksResult = {} as { [primaryKey: string]: any };
      pksResult["name"] = v.P["name"];
      if (!result["OUT"]) {
       result["OUT"] = {} as {
        [EdgeType: string]: { [primaryKey: string]: any }[]
       };
      }
      result["OUT"][type] = [pksResult];
      // getChildren(metaVertex, v, pksResult);
     } else {
      const collVertex = findVertexByLabelAndUniqueId("Coll", "name", label);
      if (!collVertex) {
       alert(`Collection not defined: ${label}`);
       continue;
      }
      const pks = getPkForCollection(collVertex);

      const pksResult = {} as { [primaryKey: string]: any };
      for (const pk of pks) {
       pksResult[pk] = v.P[pk];
      }
      if (pks.length === 0) {
       pksResult["name"] = v.P["name"];
      }

      if (!result["OUT"]) {
       result["OUT"] = {} as {
        [EdgeType: string]: { [primaryKey: string]: any }[]
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
    const childVertexes = getSublistRows(metaVertex, vertex);


    const out = childVertexes.map(v => getChildren(metaVertex, v, {
     ...klona(v),
     L: v.L[0],
     IN: undefined,
     OUT: undefined,
     id: undefined,
     D: undefined
    }));
    if (out.length > 0) {
     if (!result["OUT"]) {
      result["OUT"] = { [type]: out } as {
       [EdgeType: string]: { [primaryKey: string]: any }[]
      };
     } else
      result["OUT"][type] = out;
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
  D: undefined
 });
}

export function getStringComponent(attrDataTypeVertex?: Vertex) {
 if (!attrDataTypeVertex) {
  attrDataTypeVertex = findVertexByLabelAndUniqueId("DataType", "name", "String");
  if (!attrDataTypeVertex) {
   return;
  }
 }
 return getChildVertex(["$0Default"], attrDataTypeVertex).vertex;
}

export function getCollAttrComp(attrVertex: Vertex): Vertex | undefined {
 const attrComp = getChildVertex(["$0Comp"], attrVertex).vertex;
 if (attrComp) return attrComp;

 let attrDataTypeVertex = getChildVertex(["$0DataType"], attrVertex).vertex;
 return getStringComponent(attrDataTypeVertex);
}