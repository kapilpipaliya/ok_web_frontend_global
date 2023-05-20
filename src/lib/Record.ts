import {
 commitTxn,
 getNewGraphId,
 getNewTxnId,
 graph,
 IdAttr,
 revertTransaction,
 Vertex
} from "./graph";
import { ServerEventsDispatcher } from "../components/ws_events_dispatcher";
import { klona } from "klona/json";
import {
 addNewVertex,
 findVertexByLabelAndUniqueId,
 mergeVertexProperties,
 newVertex,
 replaceVertexProperties
} from "./Vertex";
import { onCleanup } from "solid-js";
import {
 getChildVertex,
 getChildVertexes,
 getOptionLabel,
 getParentVertex
} from "./Traverse";
import { deleteRow, newRow } from "../components/input/TableInputField";
import { onChangeHandler } from "../components/dynamicForm";
import { klona } from "klona";
import { removeUndefinedProperties } from "../utils/functions";
import { ValidationRule } from "devextreme/common";

export interface FieldAttribute {
 name: string;
 tab?: string;
 group?: string;
 dataType?: string;
 meta?: string;
 component: string;
 displayName?: string;
 props?: {
  [key: string]: any;
  validationRules?: Array<ValidationRule>;
 };
 // postSubmit?: (formValues: IFormGroup, formGroup: IFormGroup, tableItemFormGroup: IFormGroup, values: FormResult)=>void
 attributes?: FieldAttribute[];
}

export interface FormMetaData {
 name: string; // required to create new vertex
 title: string;
 attributes: FieldAttribute[];
 local?: boolean;
 // postSubmit?: (data: any) => any
}

export function getCollAttrs(
 vertexCollAttr: Vertex,
 vertexFormAttr?: Vertex
): { error: boolean; attr?: FieldAttribute } {
 const attr = Object.assign(
  {},
  removeUndefinedProperties(vertexCollAttr.properties, false, 10),
  vertexFormAttr ? removeUndefinedProperties(vertexFormAttr.properties, false, 10) : {}
 );

 // find components for all levels
 const collAttrComp = getChildVertex(["$0Comp"], vertexCollAttr).vertex;
 const formAttrComp = vertexFormAttr
  ? getChildVertex(["$0Comp"], vertexFormAttr).vertex || collAttrComp
  : collAttrComp;

 // set dataType to attr
 const dataType = getChildVertex(["$0DataType"], vertexCollAttr);
 if (dataType.error) {
  if (!formAttrComp) {
   console.warn("data Type not found");
   return { error: true };
  }
  const dataTypeFromComp = getParentVertex(["DataTypeComp"], formAttrComp);
  if (dataTypeFromComp.error) {
   console.warn("data Type not found from Component");
   return { error: true };
  }
  attr.dataType = dataTypeFromComp.vertex!.properties[IdAttr];
 } else {
  attr.dataType = dataType.vertex!.properties[IdAttr];
 }

 // set props to attr
 let formProps = vertexFormAttr
  ? (getChildVertexes(["$0Prop"], [vertexFormAttr]).vertexes || []).reduce((acc, curr) => {
   const key = getOptionLabel(curr, "->$0Key:properties.key");
   if (key) {
    acc[key] = curr.properties.value;
   }
   return acc;
  }, {} as { [key: string]: any })
  : {};

 if (formAttrComp === collAttrComp) {
  const collProps = (getChildVertexes(["$0Prop"], [vertexCollAttr]).vertexes || []).reduce((acc, curr) => {
   const key = getOptionLabel(curr, "->$0Key:properties.key");
   if (key) {
    acc[key] = curr.properties.value;
   }
   return acc;
  }, {} as { [key: string]: any });
  formProps = Object.assign(
   {},
   removeUndefinedProperties(collProps, false, 10),
   removeUndefinedProperties(formProps, false, 10)
  );
 }

 // merge default component props
 const comp = formAttrComp;
 if (!comp) {
  console.warn("Component not configured");
  return { error: true };
 }

 const compProps = (getChildVertexes(["CompProp"], [comp]).vertexes || []).reduce((acc, curr) => {
  if (curr.properties.key) {
   acc[curr.properties.key] = curr.properties.value;
  }
  return acc;
 }, {} as { [key: string]: any });
 formProps = Object.assign({}, removeUndefinedProperties(compProps, false, 10), formProps);

 const parentVertexResult = getParentVertex(["CompChild"], comp);
 if (!parentVertexResult.error) {
  const parentCompProps = (getChildVertexes(["CompProp"], [parentVertexResult.vertex!]).vertexes || []).reduce(
   (acc, curr) => {
    if (curr.properties.key) {
     acc[curr.properties.key] = curr.properties.value;
    }
    return acc;
   },
   {} as { [key: string]: any }
  );
  formProps = Object.assign({}, removeUndefinedProperties(parentCompProps, false, 10), formProps);
  attr.component = parentVertexResult.vertex!.properties[IdAttr];
 } else {
  attr.component = comp.properties[IdAttr];
 }
 attr.props = formProps;
 return { error: false, attr };
}

export const getProps = (vertexFormAttr: Vertex): { error: boolean; attr?: FieldAttribute } => {
 const vertexCollAttrResult = getChildVertex(["$0Attr"], vertexFormAttr);
 if (vertexCollAttrResult.error) return { error: true };
 const vertexCollAttr = vertexCollAttrResult.vertex!;
 return getCollAttrs(vertexCollAttr, vertexFormAttr);
};
const getCollectionOneLevelAttrs = (collVertex: Vertex): { error: string; attrs?: FieldAttribute[] } => {
 const vertexCollAttrResult = getChildVertexes(["$0Attr"], [collVertex]);
 if (vertexCollAttrResult.error) {
  return { error: "No Attributes in a Coll" };
 }
 const collAttrs = vertexCollAttrResult.vertexes!.sort((a, b) => a.properties.pos - b.properties.pos);
 let attrs: FieldAttribute[] = [];

 for (const vertexCollAttr of collAttrs) {
  const addPropsResult = getCollAttrs(vertexCollAttr);
  if (addPropsResult.error) continue;
  attrs.push(addPropsResult.attr!);
 }
 return { error: "", attrs };
};
export const getFormApiFromForm = (formId: string): { error: string; form?: FormMetaData } => {
 const form = graph.vertexes[formId] || findVertexByLabelAndUniqueId("Form", IdAttr, formId);
 if (!form) {
  const coll = findVertexByLabelAndUniqueId("Coll", IdAttr, formId);
  if (!coll) {
   return { error: "form and coll not found" };
  }
  let attrs: FieldAttribute[];
  const attrsResult = getCollectionOneLevelAttrs(coll);
  if (attrsResult.error) {
   return { error: attrsResult.error };
  }
  attrs = attrsResult.attrs!;

  // calculate children
  const collChildren = (getChildVertexes(["$0Child"], [coll]).vertexes || []).sort(
   (a, b) => a.properties.pos - b.properties.pos
  );

  const childAttrs = [] as FieldAttribute[];

  for (const vertexChild of collChildren) {
   const childCollVertex = getChildVertex(["$0Coll"], vertexChild).vertex;
   if (!childCollVertex) continue;

   let tableAttrs: FieldAttribute[];
   const attrsResult = getCollectionOneLevelAttrs(vertexChild);
   if (attrsResult.error) {
    return { error: attrsResult.error };
   }
   tableAttrs = attrsResult.attrs!;
   // @ts-ignore
   tableAttrs = tableAttrs.sort((a, b) => a.pos - b.pos);

   // table properties:
   const collChildProps = (getChildVertexes(["$0Prop"], [vertexChild]).vertexes || []).reduce((acc, curr) => {
    const key = getOptionLabel(curr, "->$0Key:properties.key");
    if (key) {
     acc[key] = curr.properties.value;
    }
    return acc;
   }, {} as { [key: string]: any });

   childAttrs.push({
    attributes: tableAttrs,
    component: "Table",
    [IdAttr]: vertexChild.properties[IdAttr] || childCollVertex.properties[IdAttr],
    props: collChildProps
   });
  }

  return {
   error: "",
   form: {
    attributes: [...attrs, ...childAttrs],
    [IdAttr]: coll.properties[IdAttr],
    title: coll.properties.title,
    local: coll.properties.local,
    // collection used in Grid, its same like id key
    // @ts-ignore
    collection: coll.properties[IdAttr]
   }
  };
 }

 const formCollResult = getParentVertex(["CollForm"], form);
 if (formCollResult.error) {
  return { error: "Please Configure Collection in a Form" };
 }
 const formColl = formCollResult.vertex!;

 const formAttrsResult = getChildVertexes(["FormAttr"], [form]);
 if (formAttrsResult.error) {
  return { error: "No Attributes in a Form" };
 }
 const formAttrs = formAttrsResult.vertexes!.sort((a, b) => a.properties.pos - b.properties.pos);

 let attrs: FieldAttribute[] = [];

 for (const vertexFormAttr of formAttrs) {
  const addPropsResult = getProps(vertexFormAttr);
  if (addPropsResult.error) continue;
  attrs.push(addPropsResult.attr!);
 }
 // @ts-ignore
 // attrs = attrs.sort((a, b) => a.pos - b.pos); // why this is required?

 const formChildren = (getChildVertexes(["FormChild"], [form]).vertexes || []).sort(
  (a, b) => a.properties.pos - b.properties.pos
 );

 const childAttrs = [] as FieldAttribute[];

 for (const vertexFormChild of formChildren) {
  const formChildAttrs = (getChildVertexes(["FormChildAttr"], [vertexFormChild]).vertexes || []).sort(
   (a, b) => a.properties.pos - b.properties.pos
  );

  let tableAttrs: FieldAttribute[] = [];
  for (const vertexFormChildAttr of formChildAttrs) {
   const addPropsResult = getProps(vertexFormChildAttr);
   if (addPropsResult.error) continue;
   tableAttrs.push(addPropsResult.attr!);
  }
  // @ts-ignore
  tableAttrs = tableAttrs.sort((a, b) => a.pos - b.pos);

  const collChild = getChildVertex(["$0Coll"], vertexFormChild);
  if (collChild.error) {
   continue;
  }

  const collChildColl = getChildVertex(["CollChildColl"], collChild.vertex!);
  if (collChildColl.error) {
   continue;
  }
  // currently we save table property on Collection only, not overwrite by form layout
  const collChildProps = (getChildVertexes(["$0Prop"], [collChild.vertex!]).vertexes || []).reduce((acc, curr) => {
   const key = getOptionLabel(curr, "->$0Key:properties.key");
   if (key) {
    acc[key] = curr.properties.value;
   }
   return acc;
  }, {} as { [key: string]: any });

  childAttrs.push({
   attributes: tableAttrs,
   component: "Table",
   [IdAttr]: collChild.vertex!.properties[IdAttr] || collChildColl.vertex!.properties[IdAttr],
   props: collChildProps
  });
 }

 return {
  error: "",
  form: {
   attributes: [...attrs, ...childAttrs],
   [IdAttr]: formColl.properties[IdAttr],
   title: form.properties.title,
   local: form.properties.local,
   // collection used in Grid, its same like id key
   // @ts-ignore
   collection: formColl.properties[IdAttr]
  }
 };
};
export const addMetaVertexes = (txnId: number, vertex: Vertex, attributes: FieldAttribute[]) => {
 for (const attribute of attributes) {
  // if (attribute?.props?.skip) {
  //   continue;
  // }

  const addAttributeResult = newRow(txnId, vertex, "MetaAttr");
  if (addAttributeResult.error) {
   alert(addAttributeResult.error);
  }
  // todo discard transaction

  const attr = klona(attribute);
  if (!attr.tab) attr.tab = "main";
  if (!attr.group) attr.group = "main";
  // if(attribute.component === "Table") attribute.group = attribute.id;

  mergeVertexProperties(txnId, addAttributeResult.vertexId!, attr);

  if (attribute.component === "Table" && attribute.attributes) {
   addMetaVertexes(txnId, graph.vertexes[addAttributeResult.vertexId!], attribute.attributes);
  }
  // todo discard transaction
 }
};

export class Record {
 txnId: number;
 readonly isRealTime: boolean;
 readonly form: FormMetaData;
 vertex: Vertex;
 ws: ServerEventsDispatcher;
 meta?: Vertex;
 metaVertex: Vertex;

 constructor({
              form,
              ws,
              meta
             }: { form: FormMetaData, ws: ServerEventsDispatcher, meta?: Vertex }) {
  this.form = klona(form);
  this.txnId = getNewTxnId();
  this.isRealTime = false;
  this.ws = ws;
  this.meta = meta;
 }

 create(): { error: string | boolean; vertex?: Vertex } {
  if (!this.form[IdAttr]) {
   return { error: "Name Key not found" };
  }
  if (this.isRealTime) {
   this.txnId = getNewTxnId();
  }
  const newVertexObj = newVertex(getNewGraphId(), [this.form.name], {});
  // TODO: Do Create Transformation for the vertex
  const addNewVertexResult = addNewVertex(this.txnId, newVertexObj);
  if (addNewVertexResult.error) {
   return addNewVertexResult;
  }
  if (!this.form.local && this.isRealTime) commitTxn(this.txnId, this.ws);
  this.vertex = graph.vertexes[newVertexObj.id];
  this.createMeta();
  return {
   error: false, vertex: this.vertex
  };
 }

 load(id: number): { error: string | boolean; vertex?: Vertex } {

  if (!graph.vertexes[id]) {
   return { error: "vertex not found" };
  }
  this.vertex = graph.vertexes[id];
  this.createMeta();
  return {
   error: false, vertex: this.vertex
  };
 }

 createMeta() {
  const { attributes, ...custom } = this.form;

  // save attributes to vertexes
  const metaTxnId = getNewTxnId();
  if (this.meta) {
   this.metaVertex = this.meta;
  } else {
   const metaMainVertex = newVertex(getNewGraphId(), ["Temp"], custom);
   const { error } = addNewVertex(metaTxnId, metaMainVertex);
   if (error) {
    alert(error);
    return;
   }
   this.metaVertex = graph.vertexes[metaMainVertex.id];
  }


  addMetaVertexes(metaTxnId, this.metaVertex, attributes);
  onCleanup(() => {
   revertTransaction(metaTxnId);
  });
  onCleanup(() => {
   if (!this.meta) {
    // TODO: Remove all the meta
   }
  });
 }

 setValue(attribute: Vertex, data: any) {
  // after commit, we can not use same txnId();
  if (this.isRealTime) {
   this.txnId = getNewTxnId();
  }
  mergeVertexProperties(this.txnId, this.vertex.id, {
   [attribute.properties[IdAttr]]: data
  });
  onChangeHandler(this.txnId, this.vertex, this.vertex, attribute);
  if (!this.form.local && this.isRealTime) commitTxn(this.txnId, this.ws);
 };

 deleteAllRows(edgeType: string) {
  const vertexes = getChildVertexes([edgeType], [this.vertex]).vertexes || [];
  for (const row of vertexes) {
   deleteRow(row, this.isRealTime, this.txnId, this.ws);
  }
 }

 // setFieldValue
 // getFieldValue
 //['getMacros', 'getMacro', 'executeMacro', 'id', 'type', 'isDynamic', 'isReadOnly', 'isNew', 'getMessageService', 'save', 'toJSON', 'toString', 'removeField', 'getFields', 'getSublist', 'getSublists', 'getSublistFields', 'getValue', 'setValue', 'getText', 'setText', 'getField', 'getSublistField', 'getLineCount', 'insertLine', 'removeLine', 'moveLine', 'findSublistLineWithValue', 'cancelLine', 'commitLine', 'selectLine', 'selectNewLine', 'getCurrentSublistValue', 'getSublistValue', 'setCurrentSublistValue', 'getCurrentSublistText', 'getSublistText', 'setCurrentSublistText', 'getCurrentSublistIndex', 'hasSubrecord', 'getSubrecord', 'removeSubrecord', 'hasSublistSubrecord', 'hasCurrentSublistSubrecord', 'getCurrentSublistSubrecord', 'removeCurrentSublistSubrecord', 'getCurrentSublistField', 'setMatrixHeaderValue', 'getMatrixHeaderValue', 'getMatrixSublistValue', 'setMatrixSublistValue', 'setCurrentMatrixSublistValue', 'getCurrentMatrixSublistValue', 'getMatrixHeaderField', 'getMatrixSublistField', 'findMatrixSublistLineWithValue', 'getMatrixHeaderCount', 'on', 'off']

 // "fields": [{ "name": "tobeprinted", "value": "F" }, {
 //   "name": "tobefaxed",
 //   "value": "F",
 //   "firechange": true
 //  }
 replaceFieldValues(properties: { [key: string]: any }) {
  replaceVertexProperties(this.txnId, this.vertex.id, properties);
 }

 getSublist(name: string) {
  // return Sublist class, it will return sublist config. calling .getColumn('id') on it will return Column class
 }

 // Returns all the names of all the sublists.
 getSublists(): string[] {
  return [];
 }

 // record.Record
 // Cancels the currently selected line on a sublist.
 cancelLine(options) {
 }

 // record.Record
 // Commits the currently selected line on a sublist.
 commitLine(options) {
 }

 // record.Record
 // Inserts a sublist line.
 insertLine(options: { sublistId: string; line: number; ignoreRecalc: boolean; }) {
 }

 // record.Record
 // Removes a sublist line.
 removeLine(options) {
 }

 // record.Record
 // Selects an existing line in a sublist.
 selectLine(options) {
 }

 // record.Record
 // selectNewLine = addNewLine + selectLine
 // Selects a new line at the end of a sublist.
 selectNewLine(options: { sublistId: string, properties: { [key: string]: any } }) {
  const newMeta = newRow(this.txnId, this.vertex, options.sublistId);
  if (options.properties) {
   replaceVertexProperties(this.txnId, newMeta.vertexId!, options.properties);
  }
 }


 // variables: oldValue, newValue
}

class SublistLine {

}

class Emitter {
 emit(event: any) {

 }

 on(options: {}) {
 }

 off(options: {}) {
 }
}