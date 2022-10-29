import jju from "jju";

export const API_PATH = "http://49.12.190.36:3006/api/v1";
import {
  addNewEdge,
  addNewVertex,
  deleteEdge,
  deleteVertex,
  findVertexIdsByLabel,
  getNewGraphId, getOutEdgeOfType, getOutEdgeOfTypeIds,
  graph,
  newEdge,
  newVertex,
  replaceEdgeProperties,
  replaceVertexProperties, updateEdgeStartAndEnd,
} from "../lib/graph";
import { batch, createUniqueId } from "solid-js";
import { createFormArray, IFormGroup } from "solid-forms";
import { FormMetaData, FormResult, ServerFormAttributeType, VertexLabels, EdgeLabels, Id } from 'ok_web_components/src/components/input/Form';
import { klona } from "klona/json";
import { A, D } from "@mobily/ts-belt";
import { Icon } from '@iconify-icon/solid';

export const JSONToCypherMap = (json: object) => {
  // https://stackoverflow.com/questions/20841571/how-to-solve-the-dilemma-while-handle-json-in-neo4j-cypher
  return jju.stringify(json, { quote: "'" }).replace(/"/g, "\\x22");
};

function saveTableDataToEdge(tableData: any[], results: FormResult, edge: string, endIdAttribute: string) {
  const normalizedEdgesValue = tableData.reduce((acc, curr) => {
    acc[curr.id] = D.deleteKeys(klona(curr), ["id", '_id']);
    return acc;
  }, {});

  const newIds = Object.keys(normalizedEdgesValue) as Array<string>;
  const existingAttributeEdgeIds = getOutEdgeOfTypeIds(results.get("0").id, edge).map(x => `${x}`) as Array<string>;

  const insertedAttributeIds = A.difference(newIds, existingAttributeEdgeIds);
  let deletedAttributeIds = A.difference(existingAttributeEdgeIds, newIds);
  let updatedAttributeIds = A.intersection(newIds, existingAttributeEdgeIds);

  const endIdExist = (id) => !!normalizedEdgesValue[id]['properties'][endIdAttribute];
  const deleteInvalidUpdate = updatedAttributeIds.filter(id => !endIdExist(id));
  deletedAttributeIds = A.concat(deletedAttributeIds, deleteInvalidUpdate);
  updatedAttributeIds = A.difference(updatedAttributeIds, deleteInvalidUpdate);

  const insertAndUpdatedIds = A.difference(newIds, deletedAttributeIds);
  const result = {};

  batch(() => {
    deletedAttributeIds.forEach(id => deleteEdge_(edge, id));
    insertedAttributeIds.forEach(id => {
      if (!endIdExist(id)) {
        result[id] = id;
        return;
      }
      result[id] = addNewEdge(newEdge(getNewGraphId(), edge, D.deleteKeys(normalizedEdgesValue[id]['properties'], [endIdAttribute]), results.get("0").id, normalizedEdgesValue[id]['properties'][endIdAttribute]));
    });
    updatedAttributeIds.forEach(id => {
      result[id] = updateEdgeWithStartAndEnd(edge, id, D.deleteKeys(normalizedEdgesValue[id]['properties'], [endIdAttribute]), results.get("0").id, normalizedEdgesValue[id]['properties'][endIdAttribute]);
    });
  });

  return insertAndUpdatedIds.map(id=>result[id]);
}
function saveFormLayoutTableDataToEdge(tableData: any[], results: FormResult, edge: string) {
  const normalizedEdgesValue = tableData.reduce((acc, curr) => {
    acc[curr.end] = klona(curr);
    return acc;
  }, {});

  const newIds = Object.keys(normalizedEdgesValue) as Array<string>;
  const existingAttributeEdgeIds = getOutEdgeOfTypeIds(results.get("0").id, edge).map(x => `${x}`) as Array<string>;

  const insertedAttributeIds = A.difference(newIds, existingAttributeEdgeIds);
  let deletedAttributeIds = A.difference(existingAttributeEdgeIds, newIds);
  let updatedAttributeIds = A.intersection(newIds, existingAttributeEdgeIds);

  const endIdExist = (id) => !!normalizedEdgesValue[id]['end'];
  const deleteInvalidUpdate = updatedAttributeIds.filter(id => !endIdExist(id));
  deletedAttributeIds = A.concat(deletedAttributeIds, deleteInvalidUpdate);
  updatedAttributeIds = A.difference(updatedAttributeIds, deleteInvalidUpdate);

  const insertAndUpdatedIds = A.difference(newIds, deletedAttributeIds);
  const result = {};

  batch(() => {
    deletedAttributeIds.forEach(id => deleteEdge_(edge, id));

    insertedAttributeIds.forEach(id => {
      if (!endIdExist(id)) {
        result[id] = id;
        return;
      }
      result[id] = addNewEdge(newEdge(getNewGraphId(), edge, normalizedEdgesValue[id]['properties'], results.get("0").id, id));
    });
    updatedAttributeIds.forEach(id => {
      result[id] = updateEdgeWithStartAndEnd(edge, id, normalizedEdgesValue[id]['properties'], results.get("0").id, id);
    });
  });

  return insertAndUpdatedIds.map(id=>result[id]);
}

function tableOverwriteDefaultValueFn() {
  return (control: IFormGroup, key: string) => {
    const value = graph.vertexes[control.controls.attribute.value]?.["properties"]?.[key];
    if (typeof value === "boolean") {
      return value === true ? "true" : "false";
    } else if (key === "serverType") {
      return value ? graph.vertexes[value]["properties"]["id"] : "";
    } else if (key === "formType") {
      return value ? graph.vertexes[value]["properties"]["id"] : "";
    } else if (key === "props") {
      return <span title={JSON.stringify(value)}><Icon icon="ion:information-circle-outline" /></span>;
    } else if (key === "relation") {
      return <span title={JSON.stringify(value)}><Icon icon="ion:information-circle-outline" /></span>;
    } else {
      return JSON.stringify(value);
    }
  };
}

export function fetchAttributesTableData(
  schema: string
): FormMetaData[] {
  switch (schema) {
    case "ServerAttributeType": {
      return [
       { id: "0", title: "ServerFormAttributeType", save: ["vertex", VertexLabels.ServerAttributeType],
         attributes: [
           { key: "id", type: ServerFormAttributeType.String },
           { key: "default", type: ServerFormAttributeType.Select, valueKey: "properties.id", fetchOptions:  async (formValues, formGroup, inputValue: string)=>fetchCollectionData("FormAttributeType").map((id) => graph.vertexes[id]), },
         ] },
        {
          id: "1", title: "FormAttributeType",
          // save: ["edge", EdgeLabels.CollectionHasAttribute,(id)=>id, (results, formValue)=>formValue['attribute']],
          save: ["edge", EdgeLabels.ServerToFormAttributeType],
          data: (id) => {
            const AttributeEdges = getOutEdgeOfTypeIds(id, EdgeLabels.ServerToFormAttributeType).map(edge => graph.edges[edge]); // todo sort by pos
            return {properties: {ServerToFormAttributeType: AttributeEdges.map(edge=>({...edge, properties: {...edge.properties, formAttributeType: edge.end}, _id: edge.id}))}}
          },
          attributes: [
            // { key: "attributes", type: "stringify" },
            { key: "ServerToFormAttributeType", type: ServerFormAttributeType.Table, edge: "ServerToFormAttributeType",defaultValue: "undefined",
              save: (results, tableData)=>{
               const edge = EdgeLabels.ServerToFormAttributeType;
                const endIdAttribute = "formAttributeType";
                return saveTableDataToEdge(tableData, results, edge, endIdAttribute);
              },
              attributes: [
                { key: "pos", type: ServerFormAttributeType.Integer, default: (formValues, control)=>(control as ReturnType<typeof createFormArray>).controls.length + 1, hidden: true },
                { key: "formAttributeType", type: ServerFormAttributeType.Select, valueKey: "properties.id", fetchOptions:  async (formValues, formGroup, inputValue: string)=>fetchCollectionData("FormAttributeType").map((id) => graph.vertexes[id]) },
              ], },
          ],
        }
      ];
    }
    case "FormAttributeType": {
      return [{ id: "0", title: "FormAttributeType", save: ["vertex", VertexLabels.FormAttributeType], attributes: [{ key: "id", type: ServerFormAttributeType.String }] }];
    }
    case "Attribute": {
      return [{
        id: "0", title: "Attribute", save: ["vertex", VertexLabels.Attribute], attributes: [
          { key: "id", type: ServerFormAttributeType.String },
          // { key: "selector", type: ServerFormAttributeType.String },
          { key: "serverType", type: ServerFormAttributeType.Select, valueKey: "properties.id", fetchOptions:  async (formValues, formGroup, inputValue: string)=>fetchCollectionData("ServerAttributeType").map((id) => graph.vertexes[id]),
            onchange: (formGroup, value) => {
              formGroup.controls['formType'].setValue(null);
            } },
          { key: "formType", type: ServerFormAttributeType.Select, valueKey: "properties.id", fetchOptions:  async (formValues, formGroup, inputValue: string)=>{
            const serverTypeValue = formGroup.controls['serverType'].value;
            if(!serverTypeValue) return [];
            return getOutEdgeOfTypeIds(serverTypeValue,  EdgeLabels.ServerToFormAttributeType).map(id=> graph.vertexes[graph.edges[id].end])
            } },
          { key: "label", type: ServerFormAttributeType.String },
          // { key: "internal", type: ServerFormAttributeType.Boolean },
          { key: "unique", type: ServerFormAttributeType.Boolean },
          { key: "required", type: ServerFormAttributeType.Boolean },
          { key: "readonly", type: ServerFormAttributeType.Boolean },
          { key: "disabled", type: ServerFormAttributeType.Boolean },
          // { key: "internal", type: ServerFormAttributeType.Boolean },
          { key: "default", type: ServerFormAttributeType.Object }, // TODO: make a function, that accept value and based on serverType display different component (and convert to value in new type).
          { key: "onChange", type: ServerFormAttributeType.JsCode },
          { key: "props", type: ServerFormAttributeType.JsCode },
          { key: "code", type: ServerFormAttributeType.JsCode, props: {placeholder: "write attributes for non base field"} },
        ],
      }];
    }
    // TODO: Collection has only one attribute. Add validation for that.
    case "Collection": {
      return [{
        id: "0", title: "Collection1", save: ["vertex", VertexLabels.Collection], attributes: [
          { key: "id", type: ServerFormAttributeType.String }, // { key: "attributes", type: "stringify" },
        ],
      },
        {
          id: "1", title: "Collection2",
          // save: ["edge", Edges.CollectionHasAttribute,(id)=>id, (results, formValue)=>formValue['attribute']],
          save: ["edge", EdgeLabels.CollectionHasAttribute],
          data: (id) => {
            const AttributeEdges = getOutEdgeOfTypeIds(id, EdgeLabels.CollectionHasAttribute).map(edge => graph.edges[edge]); // todo sort by pos
            return {properties: {CollectionHasAttribute: AttributeEdges.map(edge=>({...edge, properties: {...edge.properties, attribute: edge.end}, _id: edge.id}))}}
          },
          attributes: [
           // { key: "attributes", type: "stringify" },
            { key: "CollectionHasAttribute", type: ServerFormAttributeType.Table, edge: "CollectionHasAttribute",defaultValue: "undefined",
              save: (results, tableData)=>{
                const edge = EdgeLabels.CollectionHasAttribute;
                const endIdAttribute = "attribute";
                return saveTableDataToEdge(tableData, results, edge, endIdAttribute);
              },
              defaultValueFn: tableOverwriteDefaultValueFn(),
              attributes: [
              { key: "pos", type: ServerFormAttributeType.Integer, default: (formValues, control)=>(control as ReturnType<typeof createFormArray>).controls.length + 1, hidden: true },
              { key: "attribute", type: ServerFormAttributeType.Select, valueKey: "properties.id",noOverWrite: true, default: (formValues, control, id: string)=>id && graph.edges[id].end, fetchOptions:  async (formValues, formGroup, inputValue)=>fetchCollectionData("Attribute").map((id) => graph.vertexes[id]) },

              { key: "id", type: ServerFormAttributeType.String },
              // { key: "selector", type: ServerFormAttributeType.String},
              { key: "serverType", type: ServerFormAttributeType.Select, valueKey: "properties.id", noInput: true, fieldOptions: {disabled: true}, fetchOptions:  async (formValues, formGroup, inputValue)=>fetchCollectionData("ServerAttributeType").map((id) => graph.vertexes[id]) },
              { key: "formType", type: ServerFormAttributeType.Select, valueKey: "properties.id", fetchOptions:  async (formValues, formGroup, inputValue)=>{
                const serverTypeValue = graph.vertexes[formGroup.controls.attribute.value]?.["properties"]['serverType'];
                if(serverTypeValue) {
                  return (graph.vertexes[serverTypeValue].out_edges['ServerToFormAttributeType'] || []).map(edgeId => graph.edges[edgeId].end).map(id=>graph.vertexes[id]);
                } else {
                  return [];
                }
               }
              },
              { key: "label", type: ServerFormAttributeType.String },
              // { key: "internal", type: ServerFormAttributeType.Boolean },
              { key: "unique", type: ServerFormAttributeType.Boolean },
              { key: "required", type: ServerFormAttributeType.Boolean },
              { key: "readonly", type: ServerFormAttributeType.Boolean },
              { key: "disabled", type: ServerFormAttributeType.Boolean },
              { key: "default", type: ServerFormAttributeType.Object }, // TODO: make a function, that accept value and based on serverType display different component (and convert to value in new type).
              { key: "onChange", type: ServerFormAttributeType.JsCode },
              { key: "props", type: ServerFormAttributeType.JsCode },
              { key: "code", type: ServerFormAttributeType.JsCode },
            ], },
          ],
        }];
    }
    case "FormLayoutItem": {
      return [{
        id: "0", title: "FormLayoutItem1", save: ["vertex", VertexLabels.FormLayoutItem], attributes: [
          { key: "id", type: ServerFormAttributeType.String }, // { key: "attributes", type: "stringify" },
          // TODO: make title required
          { key: "title", type: ServerFormAttributeType.String },
          { key: "description", type: ServerFormAttributeType.String },
          { key: "labelType", type: ServerFormAttributeType.Select, valueKey: "id", fetchOptions:  async () => [{id: 'vertex'}, {id: 'edge' }] },
          { key: "labelName", type: ServerFormAttributeType.String },
          { key: "from", type: ServerFormAttributeType.JsCode, label: "From Function", props: {placeholder: "(results: FormResult, formValue: object)=> Id"} },
          { key: "to", type: ServerFormAttributeType.JsCode, label: "To Function", props: {placeholder: "(results: FormResult, formValue: object)=> Id"} },
          // { key: "buttongroup", type: "buttongroup", buttons: [{design: "Default", children: "OK", class: "mr-2"}, {design: "Negative", children: "Cancel"}] },
        ],
      },
        {
          id: "1", title: "", save: ["edge", EdgeLabels.FormLayoutItemHasCollection, (results)=>results.get('0')?.id, (results, formValue)=>formValue['collection']],
          data: (id)=>{
            if(id){
              const formVertex = graph.vertexes[id];
              const collectionEdges = formVertex.out_edges[EdgeLabels.FormLayoutItemHasCollection]
              if(collectionEdges && collectionEdges[0]) {
                const edge = graph.edges[collectionEdges[0]];
                return {...edge, properties: {collection: edge.end}}
              } else {
                return {properties: {}}
              }
            }
          },
          attributes: [
            { key: "collection", type: ServerFormAttributeType.Select, valueKey: "properties.id", fetchOptions:  async (formValues, formGroup, inputValue)=>fetchCollectionData("Collection").map((id) => graph.vertexes[id]) },
          ],
        },
        {
          id: "2", title: "Attributes",
          save: ["edge", EdgeLabels.FormLayoutItemHasAttribute],
          data: (id) => {
            const AttributeEdges = getOutEdgeOfTypeIds(id, EdgeLabels.FormLayoutItemHasAttribute).map(edge => graph.edges[edge]); // todo sort by pos
            return {properties: {FormLayoutItemHasAttribute: AttributeEdges.map(edge=>({...edge, properties: {...edge.properties, attribute: edge.end}, _id: edge.id}))}}
          },
          attributes: [
           // { key: "attributes", type: "stringify" },
            { key: "FormLayoutItemHasAttribute", type: ServerFormAttributeType.Table, edge: "FormLayoutItemHasAttribute",defaultValue: "undefined",
              save: (results, tableData)=>{
                const edge = EdgeLabels.FormLayoutItemHasAttribute;
                const endIdAttribute = "attribute";
                return saveTableDataToEdge(tableData, results, edge, endIdAttribute);
              },
              defaultValueFn: tableOverwriteDefaultValueFn(),
              attributes: [
              { key: "pos", type: ServerFormAttributeType.Integer, default: (formValues, control)=>(control as ReturnType<typeof createFormArray>).controls.length + 1, hidden: true },
              { key: "attribute", type: ServerFormAttributeType.Select, valueKey: "properties.id", default: (formValues, control, id: string)=>id && graph.edges[id].end, fetchOptions:  async (formValues, formGroup, inputValue)=>fetchCollectionData("Attribute").map((id) => graph.vertexes[id]) },

              { key: "id", type: ServerFormAttributeType.String },
              // { key: "selector", type: ServerFormAttributeType.String},
              { key: "serverType", type: ServerFormAttributeType.Select, valueKey: "properties.id", noInput: true, fieldOptions: {disabled: true}, fetchOptions:  async (formValues, formGroup, inputValue)=>fetchCollectionData("ServerAttributeType").map((id) => graph.vertexes[id]) },
              { key: "formType", type: ServerFormAttributeType.Select, valueKey: "properties.id", fetchOptions:  async (formValues, formGroup, inputValue)=>{
                  const serverTypeValue = graph.vertexes[formGroup.controls.attribute.value]?.["properties"]['serverType'];
                  if(serverTypeValue) {
                    return (graph.vertexes[serverTypeValue].out_edges['ServerToFormAttributeType'] || []).map(edgeId => graph.edges[edgeId].end).map(id=>graph.vertexes[id]);
                  } else {
                    return [];
                  }
                } },
              { key: "label", type: ServerFormAttributeType.String },
              // { key: "internal", type: ServerFormAttributeType.Boolean },
              { key: "unique", type: ServerFormAttributeType.Boolean },
              { key: "required", type: ServerFormAttributeType.Boolean },
              { key: "readonly", type: ServerFormAttributeType.Boolean },
              { key: "disabled", type: ServerFormAttributeType.Boolean },
              { key: "default", type: ServerFormAttributeType.Object }, // TODO: make a function, that accept value and based on serverType display different component (and convert to value in new type).
              { key: "onChange", type: ServerFormAttributeType.JsCode },
              { key: "props", type: ServerFormAttributeType.JsCode },
              { key: "code", type: ServerFormAttributeType.JsCode },
            ], },
          ],
        }];
    }
    case "FormLayout": {
      return [{
        id: "0", title: "FormLayout1", save: ["vertex", VertexLabels.FormLayout], attributes: [
          { key: "id", type: ServerFormAttributeType.String },
          { key: "title", type: ServerFormAttributeType.String },
          { key: "description", type: ServerFormAttributeType.String },
          // { key: "forms", type: "table_forms" },
          // { key: "buttongroup", type: "buttongroup", buttons: [{design: "Default", children: "OK", class: "mr-2"}, {design: "Negative", children: "Cancel"}] },
        ],
      },
        {
          id: "1", title: "Forms",
          save: ["edge", EdgeLabels.FormLayoutHasItem],
          data: (id) => {
            const AttributeEdges = getOutEdgeOfTypeIds(id, EdgeLabels.FormLayoutHasItem).map(edge => graph.edges[edge]); // todo sort by pos
            return {properties: {FormLayoutItem: AttributeEdges.map(edge=>({...edge, properties: {...edge.properties}, _id: edge.id}))}}
            // return {properties: {FormLayoutItem: AttributeEdges}}
          },
          attributes: [
            // { key: "attributes", type: "stringify" },
            { key: "FormLayoutItem", type: ServerFormAttributeType.TableForm, form: "FormLayoutItem",defaultValue: "undefined",
              noSort: true,
              save: (results, tableData)=> {
                const edge = EdgeLabels.FormLayoutHasItem;
                return saveFormLayoutTableDataToEdge(tableData, results, edge);
              },
              postSubmit: (formValues, formGroup, tableItemFormGroup, values)=>{
                // tableItemFormGroup =  FormLayoutHasItem
                // values = all the form values
                tableItemFormGroup.controls['end'].setValue(values.get("0").id)
              },
              attributes: [
                { key: "pos", type: ServerFormAttributeType.Integer, default: (formValues, control)=>(control as ReturnType<typeof createFormArray>).controls.length + 1, hidden: true },
              ], },
          ],
        }];
    }
  }
}

export function fetchCollectionData(schema:string) {
  return findVertexIdsByLabel(schema);
}
export function fetchDocument(schema: string, id: Id) {
  return graph.vertexes[id];
}
export function fetchEdge(schema: string, id: Id) {
  return graph.edges[id];
}

export function addNode(schema: string, body: any) {
  const newId = getNewGraphId()
  addNewVertex(newVertex(newId, [schema], body))
  return newId;
}
export function addEdge(schema: string, body: any, start: Id, end: Id) {
  const newId = getNewGraphId()
  addNewEdge(newEdge(newId, schema, body, start, end));
  return newId;
}
export function updateNode(schema: string, id: Id, body: any) {
    replaceVertexProperties(id, body);
    return id;
}
// deprecated: use updateEdgeWithStartAndEnd instead
export function updateEdge(schema: string, id: Id, body: any) {
    replaceEdgeProperties(id, body);
    return id;
}
export function updateEdgeWithStartAndEnd(schema: string, id: Id, body: any, start: Id, end: Id) {
    replaceEdgeProperties(id, body);
    updateEdgeStartAndEnd(id, start, end);
    return id;
}

export function deleteNode(schema: string, id: Id) {
    return deleteVertex(id);
}
export function deleteEdge_(schema: string, id: string) {
    return deleteEdge(id);
}
export function addCollection(_key, attributes) {
  console.log({ _key, attributes });

  // return fetch(API_PATH + `/en/collections`, {
  //   method: "POST",
  //   headers: {
  //     Accept: "application/json",
  //     "Content-Type": "application/json",
  //   },
  //   body: JSON.stringify({ _key: _key, attributes }),
  // }).then((res) => res.json());
}

export function updateCollection(_key, attributes) {
  return fetch(API_PATH + `/en/collections/${_key}`, {
    method: "PATCH",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ attributes }),
  }).then((res) => res.json());
}

export function addFormLayout(_key, attributes) {
  return fetch(API_PATH + `/en/formLayouts`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ _key: _key, attributes }),
  }).then((res) => res.json());
}

export function updateFormLayout(_key, attributes) {
  return fetch(API_PATH + `/en/formLayouts/${_key}`, {
    method: "PATCH",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ attributes }),
  }).then((res) => res.json());
}


