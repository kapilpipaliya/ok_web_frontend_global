import jju from "jju";

import { ulid } from 'ulid'
export const API_PATH = "http://49.12.190.36:3006/api/v1";
import {
  addNewEdge,
  addNewVertex,
  deleteEdge,
  deleteVertex, Edges,
  findVertexIdsByLabel,
  getNewGraphId, getOutEdgeOfType, getOutEdgeOfTypeIds,
  graph,
  Id, newEdge,
  newVertex,
  replaceEdgeProperties,
  replaceVertexProperties, updateEdgeStartAndEnd, Vertexs
} from "../lib/graph";
import { batch, createUniqueId } from "solid-js";
import { createFormArray, IFormGroup } from "solid-forms";
import { FormMetaData, FormResult } from 'ok_web_components/src/components/input/Form';
import { klona } from "klona/json";
import { A, D } from "@mobily/ts-belt";
import { Icon } from '@iconify-icon/solid';

export const JSONToCypherMap = (json: object) => {
  // https://stackoverflow.com/questions/20841571/how-to-solve-the-dilemma-while-handle-json-in-neo4j-cypher
  return jju.stringify(json, { quote: "'" }).replace(/"/g, "\\x22");
};

const ServerFormAttributeType = {
  String: "string",
  Dynamic: "dynamic",
  Boolean: "boolean",
  Integer: "integer",
  Decimal: "decimal",
  Object: "object",
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
       { id: "0", title: "ServerFormAttributeType", save: ["vertex", Vertexs.ServerAttributeType],
         attributes: [
           { key: "id", type: ServerFormAttributeType.String },
           { key: "default", type: "select", valueKey: "id", fetchOptions:  async (formValues, formGroup, inputValue: string)=>fetchCollectionData("FormAttributeType").map((id) => graph.vertexes[id]), },
         ] },
        {
          id: "1", title: "FormAttributeType",
          // save: ["edge", Edges.CollectionHasAttribute,(id)=>id, (results, formValue)=>formValue['attribute']],
          save: ["edge", Edges.ServerToFormAttributeType],
          data: (id) => {
            const AttributeEdges = getOutEdgeOfTypeIds(id, Edges.ServerToFormAttributeType).map(edge => graph.edges[edge]); // todo sort by pos
            return {properties: {ServerToFormAttributeType: AttributeEdges.map(edge=>({...edge, properties: {...edge.properties, formAttributeType: edge.end}, _id: edge.id}))}}
          },
          attributes: [
            // { key: "attributes", type: "stringify" },
            { key: "ServerToFormAttributeType", type: "table", edge: "ServerToFormAttributeType",defaultValue: "undefined",
              save: (results, tableData)=>{
               const edge = Edges.ServerToFormAttributeType;
                const endIdAttribute = "formAttributeType";
                return saveTableDataToEdge(tableData, results, edge, endIdAttribute);
              },
              attributes: [
                { key: "pos", type: ServerFormAttributeType.Integer, default: (formValues, control)=>(control as ReturnType<typeof createFormArray>).controls.length + 1, hidden: true },
                { key: "formAttributeType", type: "select", valueKey: "id", fetchOptions:  async (formValues, formGroup, inputValue: string)=>fetchCollectionData("FormAttributeType").map((id) => graph.vertexes[id]) },
              ], },
          ],
        }
      ];
    }
    case "FormAttributeType": {
      return [{ id: "0", title: "FormAttributeType", save: ["vertex", Vertexs.FormAttributeType], attributes: [{ key: "id", type: ServerFormAttributeType.String }] }];
    }
    case "Attribute": {
      return [{
        id: "0", title: "Attribute", save: ["vertex", Vertexs.Attribute], attributes: [
          { key: "id", type: ServerFormAttributeType.String },
          { key: "selector", type: ServerFormAttributeType.String },
          { key: "label", type: ServerFormAttributeType.String },
          { key: "serverType", type: "select", valueKey: "id", fetchOptions:  async (formValues, formGroup, inputValue: string)=>fetchCollectionData("ServerAttributeType").map((id) => graph.vertexes[id]),
            onchange: (formGroup, value) => {
              formGroup.controls['formType'].setValue(null);
            } },
          { key: "formType", type: "select", valueKey: "id", fetchOptions:  async (formValues, formGroup, inputValue: string)=>{
            const serverTypeValue = formGroup.controls['serverType'].value;
            if(!serverTypeValue) return [];
            return getOutEdgeOfTypeIds(serverTypeValue,  Edges.ServerToFormAttributeType).map(id=> graph.vertexes[graph.edges[id].end])
            } },
          { key: "required", type: ServerFormAttributeType.Boolean },
          { key: "internal", type: ServerFormAttributeType.Boolean },
          { key: "default", type: ServerFormAttributeType.Object }, // TODO: make a function, that accept value and based on serverType display different component.
          { key: "props", type: ServerFormAttributeType.Object },
          { key: "relation", type: ServerFormAttributeType.Object },
        ],
      }];
    }
    // TODO: Collection has only one attribute. Add validation for that.
    case "Collection": {
      return [{
        id: "0", title: "Collection1", save: ["vertex", Vertexs.Collection], attributes: [
          { key: "id", type: "string" }, // { key: "attributes", type: "stringify" },
        ],
      },
        {
          id: "1", title: "Collection2",
          // save: ["edge", Edges.CollectionHasAttribute,(id)=>id, (results, formValue)=>formValue['attribute']],
          save: ["edge", Edges.CollectionHasAttribute],
          data: (id) => {
            const AttributeEdges = getOutEdgeOfTypeIds(id, Edges.CollectionHasAttribute).map(edge => graph.edges[edge]); // todo sort by pos
            return {properties: {CollectionHasAttribute: AttributeEdges.map(edge=>({...edge, properties: {...edge.properties, attribute: edge.end}, _id: edge.id}))}}
          },
          attributes: [
           // { key: "attributes", type: "stringify" },
            { key: "CollectionHasAttribute", type: "table", edge: "CollectionHasAttribute",defaultValue: "undefined",
              save: (results, tableData)=>{
                const edge = Edges.CollectionHasAttribute;
                const endIdAttribute = "attribute";
                return saveTableDataToEdge(tableData, results, edge, endIdAttribute);
              },
              defaultValueFn: tableOverwriteDefaultValueFn(),
              attributes: [
              { key: "pos", type: ServerFormAttributeType.Integer, default: (formValues, control)=>(control as ReturnType<typeof createFormArray>).controls.length + 1, hidden: true },
              { key: "attribute", type: "select", valueKey: "id",noOverWrite: true, default: (formValues, control, id: string)=>id && graph.edges[id].end, fetchOptions:  async (formValues, formGroup, inputValue)=>fetchCollectionData("Attribute").map((id) => graph.vertexes[id]) },
              { key: "id", type: ServerFormAttributeType.String },
              { key: "selector", type: ServerFormAttributeType.String},
              { key: "serverType", type: "select", valueKey: "id", noInput: true, options: {disabled: true}, fetchOptions:  async (formValues, formGroup, inputValue)=>fetchCollectionData("ServerAttributeType").map((id) => graph.vertexes[id]) },
              { key: "formType", type: "select", valueKey: "id", fetchOptions:  async (formValues, formGroup, inputValue)=>{
                const serverTypeValue = graph.vertexes[formGroup.controls.attribute.value]?.["properties"]['serverType'];
                if(serverTypeValue) {
                  return (graph.vertexes[serverTypeValue].out_edges['ServerToFormAttributeType'] || []).map(edgeId => graph.edges[edgeId].end).map(id=>graph.vertexes[id]);
                } else {
                  return [];
                }
               }
              },
              { key: "label", type: ServerFormAttributeType.String },
              { key: "internal", type: ServerFormAttributeType.Boolean },
              { key: "unique", type: ServerFormAttributeType.Boolean },
              { key: "required", type: ServerFormAttributeType.Boolean },
              { key: "readonly", type: ServerFormAttributeType.Boolean },
              { key: "props", type: ServerFormAttributeType.Object },
              { key: "relation", type: ServerFormAttributeType.Object },
            ], },
          ],
        }];
    }
    case "FormLayoutItem": {
      return [{
        id: "0", title: "FormLayoutItem1", save: ["vertex", Vertexs.FormLayoutItem], attributes: [
          // { key: "id", type: "string" }, // { key: "attributes", type: "stringify" },
          // TODO: make title required
          { key: "title", type: "string" },
          { key: "description", type: "string" },
          // { key: "buttongroup", type: "buttongroup", buttons: [{design: "Default", children: "OK", class: "mr-2"}, {design: "Negative", children: "Cancel"}] },
        ],
      },
        {
          id: "1", title: "", save: ["edge", Edges.FormLayoutItemHasCollection, (results)=>results.get('0')?.id, (results, formValue)=>formValue['collection']],
          data: (id)=>{
            if(id){
              const formVertex = graph.vertexes[id];
              const collectionEdges = formVertex.out_edges[Edges.FormLayoutItemHasCollection]
              if(collectionEdges && collectionEdges[0]) {
                const edge = graph.edges[collectionEdges[0]];
                return {...edge, properties: {collection: edge.end}}
              } else {
                return {properties: {}}
              }
            }
          },
          attributes: [
            { key: "collection", type: "select", valueKey: "id", fetchOptions:  async (formValues, formGroup, inputValue)=>fetchCollectionData("Collection").map((id) => graph.vertexes[id]) },
          ],
        },
        {
          id: "2", title: "Attributes",
          save: ["edge", Edges.FormLayoutItemHasAttribute],
          data: (id) => {
            const AttributeEdges = getOutEdgeOfTypeIds(id, Edges.FormLayoutItemHasAttribute).map(edge => graph.edges[edge]); // todo sort by pos
            return {properties: {FormLayoutItemHasAttribute: AttributeEdges.map(edge=>({...edge, properties: {...edge.properties, attribute: edge.end}, _id: edge.id}))}}
          },
          attributes: [
           // { key: "attributes", type: "stringify" },
            { key: "FormLayoutItemHasAttribute", type: "table", edge: "FormLayoutItemHasAttribute",defaultValue: "undefined",
              save: (results, tableData)=>{
                const edge = Edges.FormLayoutItemHasAttribute;
                const endIdAttribute = "attribute";
                return saveTableDataToEdge(tableData, results, edge, endIdAttribute);
              },
              defaultValueFn: tableOverwriteDefaultValueFn(),
              attributes: [
              { key: "pos", type: ServerFormAttributeType.Integer, default: (formValues, control)=>(control as ReturnType<typeof createFormArray>).controls.length + 1, hidden: true },
              { key: "attribute", type: "select", valueKey: "id", default: (formValues, control, id: string)=>id && graph.edges[id].end, fetchOptions:  async (formValues, formGroup, inputValue)=>fetchCollectionData("Attribute").map((id) => graph.vertexes[id]) },
              { key: "id", type: ServerFormAttributeType.String },
              { key: "selector", type: ServerFormAttributeType.String},
              { key: "serverType", type: "select", valueKey: "id", noInput: true, options: {disabled: true}, fetchOptions:  async (formValues, formGroup, inputValue)=>fetchCollectionData("ServerAttributeType").map((id) => graph.vertexes[id]) },
              { key: "formType", type: "select", valueKey: "id", fetchOptions:  async (formValues, formGroup, inputValue)=>{
                  const serverTypeValue = graph.vertexes[formGroup.controls.attribute.value]?.["properties"]['serverType'];
                  if(serverTypeValue) {
                    return (graph.vertexes[serverTypeValue].out_edges['ServerToFormAttributeType'] || []).map(edgeId => graph.edges[edgeId].end).map(id=>graph.vertexes[id]);
                  } else {
                    return [];
                  }
                } },
              { key: "label", type: ServerFormAttributeType.String },
              { key: "internal", type: ServerFormAttributeType.Boolean },
              { key: "unique", type: ServerFormAttributeType.Boolean },
              { key: "required", type: ServerFormAttributeType.Boolean },
              { key: "readonly", type: ServerFormAttributeType.Boolean },
              { key: "props", type: ServerFormAttributeType.Object },
              { key: "relation", type: ServerFormAttributeType.Object },
            ], },
          ],
        }];
    }
    case "FormLayout": {
      return [{
        id: "0", title: "FormLayout1", save: ["vertex", Vertexs.FormLayout], attributes: [
          { key: "id", type: "string" },
          { key: "title", type: "string" },
          { key: "description", type: "string" },
          // { key: "forms", type: "table_forms" },
          // { key: "buttongroup", type: "buttongroup", buttons: [{design: "Default", children: "OK", class: "mr-2"}, {design: "Negative", children: "Cancel"}] },
        ],
      },
        {
          id: "1", title: "Forms",
          save: ["edge", Edges.FormLayoutHasItem],
          data: (id) => {
            const AttributeEdges = getOutEdgeOfTypeIds(id, Edges.FormLayoutHasItem).map(edge => graph.edges[edge]); // todo sort by pos
            return {properties: {FormLayoutItem: AttributeEdges.map(edge=>({...edge, properties: {...edge.properties}, _id: edge.id}))}}
            // return {properties: {FormLayoutItem: AttributeEdges}}
          },
          attributes: [
            // { key: "attributes", type: "stringify" },
            { key: "FormLayoutItem", type: "table_forms", form: "FormLayoutItem",defaultValue: "undefined",
              noSort: true,
              save: (results, tableData)=> {
                const edge = Edges.FormLayoutHasItem;
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


