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
    acc[curr.ID] = D.deleteKeys(klona(curr), ["ID", '_id']);
    // if(curr[endIdAttribute]){
    //   acc[curr[endIdAttribute] = D.deleteKeys(klona(curr), ['_id']);
    // }
    return acc;
  }, {});

  const newIds = Object.keys(normalizedEdgesValue) as Array<string>;
  const existingAttributeEdgeIds = getOutEdgeOfTypeIds(results.get("0").id, edge).map(x => `${x}`) as Array<string>;

  const insertedAttributeIds = A.difference(newIds, existingAttributeEdgeIds);
  let deletedAttributeIds = A.difference(existingAttributeEdgeIds, newIds);
  let updatedAttributeIds = A.intersection(newIds, existingAttributeEdgeIds);

  const endIdExist = (id_) => !!normalizedEdgesValue[id_][endIdAttribute];
  const deleteInvalidUpdate = updatedAttributeIds.filter(id_ => !endIdExist(id_));
  deletedAttributeIds = A.concat(deletedAttributeIds, deleteInvalidUpdate);
  updatedAttributeIds = A.difference(updatedAttributeIds, deleteInvalidUpdate);

  const insertAndUpdatedIds = A.difference(newIds, deletedAttributeIds);
  const result = {};

  batch(() => {
    deletedAttributeIds.forEach(id => deleteEdge_(edge, id));
    insertedAttributeIds.forEach(id_ => {
      if (!endIdExist(id_)) {
        result[id_] = id_;
        return;
      }
      result[id_] = addNewEdge(newEdge(getNewGraphId(), edge, D.deleteKeys(normalizedEdgesValue[id_], [endIdAttribute]), results.get("0").id, normalizedEdgesValue[id_][endIdAttribute]));
    });
    updatedAttributeIds.forEach(id_ => {
      result[id_] = updateEdgeWithStartAndEnd(edge, id_, D.deleteKeys(normalizedEdgesValue[id_], [endIdAttribute]), results.get("0").id, normalizedEdgesValue[id_][endIdAttribute]);
    });
  });

  return insertAndUpdatedIds.map(_id=>result[_id]);
}

export function fetchAttributesTableData(
  schema: string
): FormMetaData[] {
  switch (schema) {
    case "ServerAttributeType": {
      return [
       { id: "0", title: "ServerFormAttributeType", save: ["vertex", Vertexs.ServerAttributeType], attributes: [{ key: "id", type: ServerFormAttributeType.String }] },
        {
          id: "1", title: "FormAttributeType",
          // save: ["edge", Edges.CollectionHasAttribute,(id)=>id, (results, formValue)=>formValue['attribute']],
          save: ["edge", Edges.ServerToFormAttributeType],
          data: (id) => {
            const AttributeEdges = getOutEdgeOfTypeIds(id, Edges.ServerToFormAttributeType).map(edge => graph.edges[edge]); // todo sort by pos
            return {properties: {ServerToFormAttributeType: AttributeEdges.map(edge=>({...edge, properties: {...edge.properties, FormAttributeType: edge.end, _id: edge.id, ID: edge.id}}))}}
          },
          attributes: [
            // { key: "attributes", type: "stringify" },
            { key: "ServerToFormAttributeType", type: "table", edge: "ServerToFormAttributeType",defaultValue: "undefined",
              save: (results, tableData)=>{
               const edge = Edges.ServerToFormAttributeType;
                const endIdAttribute = "FormAttributeType";
                return saveTableDataToEdge(tableData, results, edge, endIdAttribute);
              },
              attributes: [
                // _id is important, used for sorting
                { key: "_id", type: ServerFormAttributeType.String, default: (formValues, control, id: string)=>id || ulid(), hidden: true },
                { key: "ID", type: ServerFormAttributeType.String, default: (formValues, control, id: string)=>id || ulid(), hidden: true },
                { key: "pos", type: ServerFormAttributeType.Integer, default: (formValues, control)=>(control as ReturnType<typeof createFormArray>).controls.length + 1, hidden: true },
                { key: "FormAttributeType", type: "select", valueKey: "id", fetchOptions:  async (formValues, formGroup, inputValue: string)=>fetchCollectionData("FormAttributeType").map((id) => graph.vertexes[id]) },
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
            return {properties: {CollectionHasAttribute: AttributeEdges}}
          },
          attributes: [
           // { key: "attributes", type: "stringify" },
            { key: "CollectionHasAttribute", type: "table", edge: "CollectionHasAttribute",defaultValue: "undefined",
              save: (results, tableData)=>{
                const edge = Edges.CollectionHasAttribute;
                const endIdAttribute = "attribute";
                return saveTableDataToEdge(tableData, results, edge, endIdAttribute);
              },
              defaultValueFn: (control: IFormGroup, key: string) => {
                const value = graph.vertexes[control.controls.attribute.value]?.["properties"]?.[key];
                if (typeof value === "boolean") {
                  return value === true ? "true" : "false"
                } else if (key === "serverType") {
                  // TODO
                } else if (key === "formType") {
                  // TODO
                } else {
                  return JSON.stringify(value);
                }
              },
              attributes: [
              // _id is important, used for sorting
              { key: "_id", type: ServerFormAttributeType.String, default: (formValues, control, id: string)=>id || ulid(), hidden: true },
              { key: "pos", type: ServerFormAttributeType.Integer, default: (formValues, control)=>(control as ReturnType<typeof createFormArray>).controls.length + 1, hidden: true },
              { key: "attribute", type: "select", valueKey: "id",noOverWrite: true, default: (formValues, control, id: string)=>id && graph.edges[id].end, fetchOptions:  async (formValues, formGroup, inputValue)=>fetchCollectionData("Attribute").map((id) => graph.vertexes[id]) },
              { key: "id", type: ServerFormAttributeType.String },
              { key: "selector", type: ServerFormAttributeType.String},
              { key: "serverType", type: "select", valueKey: "id", options: {disabled: true}, fetchOptions:  async (formValues, formGroup, inputValue)=>fetchCollectionData("ServerAttributeType").map((id) => graph.vertexes[id]) },
              { key: "formType", type: "select", valueKey: "id", fetchOptions:  async (formValues, formGroup, inputValue)=>fetchCollectionData("FormAttributeType").map((id) => graph.vertexes[id]) },
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
          { key: "id", type: "string" }, // { key: "attributes", type: "stringify" },
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
              const edge = graph.edges[collectionEdges[0]];
              return {...edge, properties: {collection: edge.end}}
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
            return {properties: {FormLayoutItemHasAttribute: AttributeEdges}}
          },
          attributes: [
           // { key: "attributes", type: "stringify" },
            { key: "FormLayoutItemHasAttribute", type: "table", edge: "FormLayoutItemHasAttribute",defaultValue: "undefined",
              save: (results, tableData)=>{
                const edge = Edges.FormLayoutItemHasAttribute;
                const endIdAttribute = "attribute";
                return saveTableDataToEdge(tableData, results, edge, endIdAttribute);
              },
              defaultValueFn: (control: IFormGroup, key: string) => {
                const value = graph.vertexes[control.controls.attribute.value]?.["properties"]?.[key];
                if (typeof value === "boolean") {
                  return value === true ? "true" : "false"
                } else if(typeof value === "string"){
                  return value;
                } else {
                  return JSON.stringify(value);
                }
              },
              attributes: [
              // _id is important, used for sorting
              { key: "_id", type: ServerFormAttributeType.String, default: (formValues, control, id: string)=>id || ulid(), hidden: true },
              { key: "pos", type: ServerFormAttributeType.Integer, default: (formValues, control)=>(control as ReturnType<typeof createFormArray>).controls.length + 1, hidden: true },
              { key: "attribute", type: "select", valueKey: "id", default: (formValues, control, id: string)=>id && graph.edges[id].end, fetchOptions:  async (formValues, formGroup, inputValue)=>fetchCollectionData("Attribute").map((id) => graph.vertexes[id]) },
              { key: "id", type: ServerFormAttributeType.String },
              { key: "selector", type: ServerFormAttributeType.String},
              { key: "serverType", type: "select", valueKey: "id", fetchOptions:  async (formValues, formGroup, inputValue)=>fetchCollectionData("ServerAttributeType").map((id) => graph.vertexes[id]) },
              { key: "formType", type: "select", valueKey: "id", fetchOptions:  async (formValues, formGroup, inputValue)=>fetchCollectionData("FormAttributeType").map((id) => graph.vertexes[id]) },
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
            return {properties: {FormLayoutItem: AttributeEdges}}
          },
          attributes: [
            // { key: "attributes", type: "stringify" },
            { key: "FormLayoutItem", type: "table_forms", form: "FormLayoutItem",defaultValue: "undefined",
              postSubmit: (formValues, formGroup, tableItemFormGroup, values)=>{
              tableItemFormGroup.controls['id'].setValue(values.get("0").id)
              // get id and set it to the control
              },
              save: (results, tableData)=> {
                const edge = Edges.FormLayoutHasItem;
                // const endIdAttribute = "attribute";
                // return saveTableDataToEdge(tableData, results, edge, endIdAttribute);
                // TODO just check if any id is deleted then delete the edge.
                return [];
              },
              attributes: [
                // _id is important, used for sorting
                { key: "_id", type: ServerFormAttributeType.String, default: (formValues, control, id: string)=>id || ulid(), hidden: true },
                { key: "id", type: ServerFormAttributeType.String, default: (formValues, control, id: string)=>id || null, hidden: true },
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


