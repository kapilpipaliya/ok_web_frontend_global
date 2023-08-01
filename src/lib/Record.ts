import {
 commitTxn,
 getNewGraphId,
 getNewTxnId,
 graph,
 Id,
 IdAttr,
 revertTransaction,
 setGraph,
 Vertex
} from "./graph";
import { ServerEventsDispatcher } from "../utils/ws_events_dispatcher";
import { klona } from "klona/json";
import {
 addNewVertex,
 deleteVertex,
 findVertexByLabelAndUniqueId,
 mergeVertexProperties,
 newVertex,
 replaceVertexProperties
} from "./Vertex";
import { batch, createContext, onCleanup, untrack } from "solid-js";
import {
 getChildVertex,
 getChildVertexes,
 getOptionLabel,
 getParentVertex,
 getSelectionOptions,
 getToEdge
} from "./Traverse";
import { removeUndefinedProperties } from "../utils/functions";
import { ValidationRule } from "devextreme/common";
import { addNewEdge, deleteEdge, newEdge } from "./Edge";
import { A, G } from "@mobily/ts-belt";
import { setSelectionValue } from "../components/input/SelectInputField";
import { capitalizeFirstLetter, getValueFromVertexOrKey } from "../utils/utils";
import dxValidationGroup from "devextreme/ui/validation_group";
import { AttrsTableData } from "../components/api";

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
 isRealTime?: boolean;
 // postSubmit?: (data: any) => any
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
  const compProp = getChildVertex(['$0Name'], curr);
  if (compProp.vertex && compProp.vertex.P.name && curr.P.value !== undefined) {
   acc[compProp.vertex.P.name] = curr.P.value;
  }
  return acc;
 }, {} as { [key: string]: any });
}

export function getCollAttrs(
 vertexCollAttr: Vertex,
 vertexFormAttr?: Vertex
): { error: boolean; attr?: FieldAttribute } {
 const attr = Object.assign(
  {},
  removeUndefinedProperties(vertexCollAttr.P, false, 10),
  vertexFormAttr ? removeUndefinedProperties(vertexFormAttr.P, false, 10) : {}
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
   console.warn("data Type not found for attr", vertexCollAttr.P.name, "taking string dataType");
   const dataTypeVertex = findVertexByLabelAndUniqueId('DataType', 'name', 'String');
   if (!dataTypeVertex) {
    console.warn("String data Type not found");
    return { error: true };
   }
   dataType.vertex = dataTypeVertex;
   attr.dataType = dataTypeVertex.P[IdAttr];
  } else {
   const dataTypeFromComp = getParentVertex(["DataTypeComp"], formAttrComp);
   if (dataTypeFromComp.error) {
    console.warn("data Type not found from Component for attr", vertexCollAttr.P.name);
    return { error: true };
   }
   attr.dataType = dataTypeFromComp.vertex!.P[IdAttr];
  }
 } else {
  attr.dataType = dataType.vertex!.P[IdAttr];
 }

 // set props to attr
 let formProps = vertexFormAttr
  ? (getChildVertexes(["$0Prop"], [vertexFormAttr]).vertexes || []).reduce((acc, curr) => {
   const key = getOptionLabel(curr, "->$0Key:P.key");
   if (key) {
    acc[key] = curr.P.value;
   }
   return acc;
  }, {} as { [key: string]: any })
  : {};

 if (formAttrComp === collAttrComp) {
  const collProps = (getChildVertexes(["$0Prop"], [vertexCollAttr]).vertexes || []).reduce((acc, curr) => {
   const key = getOptionLabel(curr, "->$0Key:P.key");
   if (key) {
    acc[key] = curr.P.value;
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
 let comp = formAttrComp;
 if (!comp) {
  const dataTypeDefault = getChildVertex(["$0Default"], dataType.vertex!);
  if (dataTypeDefault.error) {
   console.warn("Component not configured");
   return { error: true };
  }
  comp = dataTypeDefault.vertex!;
 }

 const compProps = getCompProps(comp);
 formProps = Object.assign({}, removeUndefinedProperties(compProps, false, 10), formProps);

 const parentVertexResult = getParentVertex(["CompChild"], comp);
 if (!parentVertexResult.error) {
  const parentCompProps = (getChildVertexes(["CompProp"], [parentVertexResult.vertex!]).vertexes || []).reduce(
   (acc, curr) => {
    if (curr.P.key) {
     acc[curr.P.key] = curr.P.value;
    }
    return acc;
   },
   {} as { [key: string]: any }
  );
  formProps = Object.assign({}, removeUndefinedProperties(parentCompProps, false, 10), formProps);
  attr.component = parentVertexResult.vertex!.P[IdAttr];
 } else {
  attr.component = comp.P[IdAttr];
 }
 attr.props = formProps;
 return { error: false, attr };
}
export let isUpdatingInput = false;
export const getProps = (vertexFormAttr: Vertex): { error: boolean; attr?: FieldAttribute } => {
 const vertexCollAttrResult = getChildVertex(["Attr"], vertexFormAttr);
 if (vertexCollAttrResult.error) return { error: true };
 const vertexCollAttr = vertexCollAttrResult.vertex!;
 return getCollAttrs(vertexCollAttr, vertexFormAttr);
};
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
   (a, b) => a.P.pos - b.P.pos
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
    const key = getOptionLabel(curr, "->$0Key:P.key");
    if (key) {
     acc[key] = curr.P.value;
    }
    return acc;
   }, {} as { [key: string]: any });

   childAttrs.push({
    attributes: tableAttrs,
    component: "Table",
    [IdAttr]: vertexChild.P[IdAttr] || childCollVertex.P[IdAttr],
    props: collChildProps
   });
  }

  return {
   error: "",
   form: {
    attributes: [...attrs, ...childAttrs],
    [IdAttr]: coll.P[IdAttr],
    title: coll.P.title,
    isRealTime: coll.P.isRealTime,
    // collection used in Grid, its same like id key
    // @ts-ignore
    collection: coll.P[IdAttr]
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
 const formAttrs = formAttrsResult.vertexes!.sort((a, b) => a.P.pos - b.P.pos);

 let attrs: FieldAttribute[] = [];

 for (const vertexFormAttr of formAttrs) {
  const addPropsResult = getProps(vertexFormAttr);
  if (addPropsResult.error) continue;
  attrs.push(addPropsResult.attr!);
 }
 // @ts-ignore
 // attrs = attrs.sort((a, b) => a.pos - b.pos); // why this is required?

 const formChildren = (getChildVertexes(["FormChild"], [form]).vertexes || []).sort(
  (a, b) => a.P.pos - b.P.pos
 );

 const childAttrs = [] as FieldAttribute[];

 for (const vertexFormChild of formChildren) {
  const formChildAttrs = (getChildVertexes(["FormChildAttr"], [vertexFormChild]).vertexes || []).sort(
   (a, b) => a.P.pos - b.P.pos
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
   const key = getOptionLabel(curr, "->$0Key:P.key");
   if (key) {
    acc[key] = curr.P.value;
   }
   return acc;
  }, {} as { [key: string]: any });

  childAttrs.push({
   attributes: tableAttrs,
   component: "Table",
   [IdAttr]: collChild.vertex!.P[IdAttr] || collChildColl.vertex!.P[IdAttr],
   props: collChildProps
  });
 }

 return {
  error: "",
  form: {
   attributes: [...attrs, ...childAttrs],
   [IdAttr]: formColl.P[IdAttr],
   title: form.P.title,
   isRealTime: form.P.isRealTime,
   // collection used in Grid, its same like id key
   // @ts-ignore
   collection: formColl.P[IdAttr]
  }
 };
};

export function newRow(
 txnId: number,
 parentVertex: Vertex,
 label: string,
 edgeType?: string,
 properties?: {[key: string]: any}
): { error: boolean; vertexId?: Id; edgeId?: Id } {
 return batch(() => {
  const vertexNew = newVertex(getNewGraphId(), [label || edgeType!], properties);
  const insertVertex = addNewVertex(txnId, vertexNew);
  if (insertVertex.error) {
   alert(insertVertex.error);
   return {
    error: true
   };
  }

  const edgeNew = newEdge(getNewGraphId(), edgeType || label!, {}, parentVertex.id, vertexNew.id);
  const insertEdgeResult = addNewEdge(txnId, edgeNew);
  if (insertEdgeResult.error) {
   alert(insertEdgeResult.error);
   return {
    error: true,
    vertexId: vertexNew.id
   };
  }
  return {
   error: false,
   vertexId: vertexNew.id,
   edgeId: edgeNew.id
  };
 })
}

function getComponentProperties(metaRows: Vertex[]) {
 const metaData = metaRows.reduce((acc, curr) => {
  const key = getOptionLabel(curr, "->$0Key:P.key||:P.key");
  if (key) {
   acc[key] = curr.P.value;
  }
  return acc;
 }, {} as { [key: string]: any });
 return metaData;
}

// TODO: when meta changed realtime its not updating.
export function componentProps(metaVertex: Vertex, data: Vertex) {
 const meta = metaVertex.P.meta.split("+");
 const results = [] as { [key: string]: any }[];
 for (const metaPart of meta) {
  const metaRows = getSelectionOptions(data, metaPart).vertexes || [];
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

export function getPkForCollection(collVerex: Vertex) {
 const pks = getChildVertexes(['$0Pk'], [collVerex]).vertexes || [];
 return pks.map(pk => pk.P.name);
}
export function getNameKeyForCollection(collVertex: Vertex) {
 const pks = getChildVertexes(['$0NameKey'], [collVertex]).vertexes || [];
 return pks.map(pk => pk.P.name);
}

export function deleteRow(
 vertex: Vertex,
 isRealTime: boolean,
 txnId: number,
 Ws: ServerEventsDispatcher
) {
 batch(() => {
  if (isRealTime) {
   txnId = getNewTxnId();
  }
  // delete all vertex in edges
  const inEdges = vertex.IN;
  for (const type in inEdges) {
   for (const edgeId of inEdges[type]) {
    const deleteEdgeResult = deleteEdge(txnId, edgeId);
    if (deleteEdgeResult?.error) alert(deleteEdgeResult.error);
   }
  }
  // delete all outEdges of vertex
  const outEdge = vertex.OUT;
  for (const type in outEdge) {
   for (const edgeId of outEdge[type]) {
    const deleteEdgeResult = deleteEdge(txnId, edgeId);
    if (deleteEdgeResult?.error) alert(deleteEdgeResult.error);
   }
  }

  // delete vertex:
  const deleteResult = deleteVertex(txnId, vertex.id);
  if (deleteResult.error) alert(deleteResult.error);
  if (isRealTime) commitTxn(txnId, Ws);
 });
}

export const addMetaVertexes = (txnId: number, vertex: Vertex, attributes: FieldAttribute[]) => {
 for (const attribute of attributes) {
  // if (attribute?.props?.skip) {
  //   continue;
  // }

  const attr = klona(attribute);
  if (!attr.tab) attr.tab = "main";
  if (!attr.group) attr.group = "main";
  // if(attribute.component === "Table") attribute.group = attribute.id;

  const addAttributeResult = newRow(txnId, vertex, "MetaAttr","MetaAttr", attr);
  if (addAttributeResult.error) {
   alert(addAttributeResult.error);
  }
  // todo discard transaction

  // if (attribute.component === "Table" && attribute.attributes) {
  if (attribute.attributes) {
   addMetaVertexes(txnId, graph.vertexes[addAttributeResult.vertexId!], attribute.attributes);
  }
  // todo discard transaction
 }
};

//'setValue(component,null)'
export function getLabel(input: string) {
 input = input.replaceAll(" ", "");
 input = capitalizeFirstLetter(input);
 // TODO: letter make pascalCase letter
 return input;
}

export function getId(input: string) {
 input = input.replaceAll(" ", "");
 input = (input).toLowerCase();
 // TODO: letter make pascalCase letter
 return input;
}

export function onChangeHandler(txnId: number, formVertex: Vertex, vertex: Vertex, changedFieldAttribute: Vertex) {
 if (!changedFieldAttribute.P.props?.onchange) return;
 const isNew = formVertex.id < 0;
 try {
  let args = JSON.parse(changedFieldAttribute.P.props.onchange);
  if (Array.isArray(args)) {
   // args in proper format.
  } else if (G.isObject(args)) {
   // TODO: Find the form is new or edit.
   if (args.new && isNew) {
    args = args.new;
   } else if (args.edit) {
    args = args.edit;
   } else {
    return;
   }
  }

  const attribute = (getSelectionOptions(changedFieldAttribute, "-MetaAttr->MetaAttr").vertexes || []).find(
   (vertex) => vertex.P[IdAttr] === args[0]
  );
  if (!attribute) {
   return;
  }
  let value = args[1];

  if (value === null) value = undefined;
  if (value === "label") value = getLabel(vertex.P[changedFieldAttribute.P[IdAttr]]);
  if (value === "id") value = getId(vertex.P[changedFieldAttribute.P[IdAttr]]);
  if (value === "clear") value = null;
  if (attribute.P.component == "Select" || attribute.P.component === "Tag") {
   setSelectionValue(txnId, vertex, attribute, value);
  } else {
   mergeVertexProperties(txnId, vertex.id, {
    [attribute.P[IdAttr]]: value
   });
  }
 } catch (e) {
 }
}

export function getSublistRows(meta: Vertex, vertex?: Vertex) {
 if (!vertex) return [];
 // This should check for inward edges too
 const type = getToEdge(meta, vertex);
 return (getChildVertexes([`${type}`], [vertex]).vertexes || []).sort(
  (a, b) => a.P.pos - b.P.pos
 );
}

export function getSublistRowsForType(type: string, vertex: Vertex) {
 return (getChildVertexes([`${type}`], [vertex]).vertexes || []).sort(
  (a, b) => a.P.pos - b.P.pos
 );
}

export class Record {
 txnId: number;
 readonly isRealTime: boolean;
 vertex: Vertex;
 ws: ServerEventsDispatcher;
 meta?: Vertex;
 metaVertex: Vertex;

 constructor({
              ws,
              meta
             }: { ws: ServerEventsDispatcher, meta?: Vertex }) {

  this.txnId = getNewTxnId();
  this.isRealTime = false;
  this.ws = ws;
  this.meta = meta;
 }

 // create
 create = (label: string, properties?: {[key: string]: any}): { error: string | boolean; vertex?: Vertex } => {
  if (!label) {
  // if (!form[IdAttr]) {
   return { error: "Label not found" };
  }
  if (this.isRealTime) {
   this.txnId = getNewTxnId();
  }
  const newVertexObj = newVertex(getNewGraphId(), [label], properties || {});
  // TODO: Do Create Transformation for the vertex
  const addNewVertexResult = addNewVertex(this.txnId, newVertexObj);
  if (addNewVertexResult.error) {
   return addNewVertexResult;
  }
  if (this.isRealTime) commitTxn(this.txnId, this.ws);
  this.vertex = graph.vertexes[newVertexObj.id];
  return {
   error: false, vertex: this.vertex
  };
 };

 load = (id: number): { error: string | boolean; vertex?: Vertex } => {
  if (!graph.vertexes[id]) {
   return { error: "vertex not found" };
  }
  this.vertex = graph.vertexes[id];

  return {
   error: false, vertex: this.vertex
  };
 };

 createMeta = (form: FormMetaData) => {
  const { attributes, ...custom } = form;

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
 };

 commitTxn = () => {
  // TODO: currently we can only run this function once.
  // we need to set seperate txnId once commited. Fix this.
  commitTxn(this.txnId, this.ws);
 };

 submitForm = () => {
  // we cant have validationGroup when doing code. can we register components on the fly to enable validations?
  // @ts-ignore
  const result = validationGroup.validate();
  if (result.isValid) {
   // !!!TODO!!! Handle Error Received From server when commit
   if (!this.isRealTime) {
    commitTxn(this.txnId, this.ws);
   }
  } else {
   alert("please fix all errors");
  }
  return result.isValid;
 }
 cancelForm = () => {
  revertTransaction(this.txnId);
 }
 setValue = (attribute: Vertex, vertex: Vertex, data: any) => {
  // after commit, we can not use same txnId();
  if (this.isRealTime) {
   this.txnId = getNewTxnId();
  }
  isUpdatingInput = true;
  mergeVertexProperties(this.txnId, vertex.id, {
   [attribute.P[IdAttr]]: data
  });
  isUpdatingInput = false;
  // we directly save the dataType on vertex:
  setGraph("vertexes", vertex.id, "D", {[attribute.P[IdAttr]]: attribute.P["dataType"]});

  onChangeHandler(this.txnId, this.vertex, vertex, attribute);
  if (this.isRealTime) commitTxn(this.txnId, this.ws);
 };

 // TODO: Is this method valid? does it delete nested Rows set by this form?, check code written in NavDesigner component to clear the form.
 deleteAllRows = (edgeType: string) => {
  const vertexes = getChildVertexes([edgeType], [this.vertex]).vertexes || [];
  for (const row of vertexes) {
   deleteRow(row, this.isRealTime, this.txnId, this.ws);
  }
 };

 // setFieldValue
 // getFieldValue
 //['getMacros', 'getMacro', 'executeMacro', 'id', 'type', 'isDynamic', 'isReadOnly', 'isNew', 'getMessageService', 'save', 'toJSON', 'toString', 'removeField', 'getFields', 'getSublist', 'getSublists', 'getSublistFields', 'getValue', 'setValue', 'getText', 'setText', 'getField', 'getSublistField', 'getLineCount', 'insertLine', 'removeLine', 'moveLine', 'findSublistLineWithValue', 'cancelLine', 'commitLine', 'selectLine', 'selectNewLine', 'getCurrentSublistValue', 'getSublistValue', 'setCurrentSublistValue', 'getCurrentSublistText', 'getSublistText', 'setCurrentSublistText', 'getCurrentSublistIndex', 'hasSubrecord', 'getSubrecord', 'removeSubrecord', 'hasSublistSubrecord', 'hasCurrentSublistSubrecord', 'getCurrentSublistSubrecord', 'removeCurrentSublistSubrecord', 'getCurrentSublistField', 'setMatrixHeaderValue', 'getMatrixHeaderValue', 'getMatrixSublistValue', 'setMatrixSublistValue', 'setCurrentMatrixSublistValue', 'getCurrentMatrixSublistValue', 'getMatrixHeaderField', 'getMatrixSublistField', 'findMatrixSublistLineWithValue', 'getMatrixHeaderCount', 'on', 'off']

 // "fields": [{ "name": "tobeprinted", "value": "F" }, {
 //   "name": "tobefaxed",
 //   "value": "F",
 //   "firechange": true
 //  }
 replaceFieldValues = (properties: { [key: string]: any }) => {
  replaceVertexProperties(this.txnId, this.vertex.id, properties);
 };
 mergeFieldValues = (properties: { [key: string]: any }) => {
  mergeVertexProperties(this.txnId, this.vertex.id, properties);
 };

 getSublist = (name: string) => {
  // return Sublist class, it will return sublist config. calling .getColumn('id') on it will return Column class
 };

 // Returns all the names of all the sublists.
 getSublists = (): string[] => [];

 // record.Record
 // Cancels the currently selected line on a sublist.
 cancelLine = options => {
 };

 // record.Record
 // Commits the currently selected line on a sublist.
 commitLine = options => {
 };

 // record.Record
 // Inserts a sublist line.
 insertLine = (options: { sublistId: string; line: number; ignoreRecalc: boolean; }) => {
 };

 // record.Record
 // Removes a sublist line.
 removeLine = options => {
 };

 // record.Record
 // Selects an existing line in a sublist.
 selectLine = options => {
 };

 // record.Record
 // selectNewLine = addNewLine + selectLine
 // Selects a new line at the end of a sublist.
 selectNewLine = (options: { sublistId: string, properties: { [key: string]: any } }) => {
  const newMeta = newRow(this.txnId, this.vertex, options.sublistId, options.sublistId, options.properties);
 };

 // variables: oldValue, newValue

 addNewRowUI = (meta: Vertex, parentVertex: Vertex, properties: { [key: string]: any }) => {
  return addNewRow(this.txnId, meta, parentVertex, properties, this.isRealTime, this.ws);
 };

 getSublistRowsForType = (type: string, vertex: Vertex) => {
  return getSublistRowsForType(type, vertex);
 };
 getSublistRows = (meta: Vertex, vertex: Vertex) => {
  return getSublistRows(meta, vertex);
 };

 groupByTabsAndGroup = () => {
  const mainAttributes = getChildVertexes(["MetaAttr"], [this.metaVertex]); //.sort((a, b) => a.P.pos - b.P.pos);

  const groupByTabs = A.groupBy(mainAttributes.vertexes!, (item) => item.P.tab!) as unknown as {
   [tab: string]: Vertex[];
  };

  const groupByTabsAndGroup = {} as {
   [tab: string]: { [group: string]: Vertex[] };
  };
  for (const tab in groupByTabs) {
   groupByTabsAndGroup[tab] = A.groupBy(groupByTabs[tab]!, (item) => item.P.group!) as unknown as {
    [group: string]: Vertex[];
   };
  }
  return  groupByTabsAndGroup;
 };

 getMetaAttributes = (meta: Vertex) => getChildVertexes(["MetaAttr"], [meta]).vertexes || [];



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

export const addNewRow = (txnId: number, meta: Vertex, parentVertex: Vertex, properties: {[key: string]: any}, isRealTime: boolean, Ws: ServerEventsDispatcher) => {
  if (isRealTime) {
   txnId = getNewTxnId();
  }
  const type = getToEdge(meta, parentVertex);
  const label = getValueFromVertexOrKey(meta.P.props || {}, 'label');

  const newRowResult = newRow(txnId, parentVertex, label, type,properties);
  if (isRealTime) commitTxn(txnId, Ws);
  return newRowResult;
}

export interface IFormContext {
 cleanUpConfig: {[key: string]: any};
 validationGroup: dxValidationGroup;
 record: Record;
}

export const FormContext = createContext({} as IFormContext);
export const PageContext = createContext({} as {[key: string]: any});

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
 let form = AttrsTableData[formId];

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
  const metaVertexes = record.getSublistRowsForType("MetaAttr", meta);
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
    const childVertexes = record.getSublistRows(metaVertex, vertex);

    for (const v of childVertexes) {
     // getCollFromCollectionExpr function is not available means Cant find a collection from meta,
     // so get Primary Key from Vertex itself.
     const label = v.L[0];
     if (AttrsTableData[label]) {
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
    const childVertexes = record.getSublistRows(metaVertex, vertex);


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

export function getCollAttrComp(attrVertex: Vertex): Vertex | undefined {
 const attrComp = getChildVertex(["$0Comp"], attrVertex).vertex;
 if (attrComp) return attrComp;

 let attrDataTypeVertex = getChildVertex(["$0DataType"], attrVertex).vertex;
 if (!attrDataTypeVertex) {
  attrDataTypeVertex = findVertexByLabelAndUniqueId("DataType", "name", "String");
  if (!attrDataTypeVertex) {
   return;
  }
 }
 return getChildVertex(["$0Default"], attrDataTypeVertex).vertex;
}