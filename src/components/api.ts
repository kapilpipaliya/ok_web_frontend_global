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
import { FormMetaData } from 'ok_web_components/src/components/input/Form';
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

function saveTableDataToEdge(tableData: any[], results: { [p: string]: any }, edge: string, endIdAttribute: string) {
  const normalizedEdgesValue = tableData.reduce((acc, curr) => {
    acc[curr._id] = D.deleteKeys(klona(curr), ["_id"]);
    // if(curr[endIdAttribute]){
    //   acc[curr[endIdAttribute] = D.deleteKeys(klona(curr), ['_id']);
    // }
    return acc;
  }, {});

  const newIds = Object.keys(normalizedEdgesValue) as Array<string>;
  const existingAttributeEdgeIds = getOutEdgeOfTypeIds(results["0"].id, edge).map(x => `${x}`) as Array<string>;

  const insertedAttributeIds = A.difference(newIds, existingAttributeEdgeIds);
  let deletedAttributeIds = A.difference(existingAttributeEdgeIds, newIds);
  let updatedAttributeIds = A.intersection(newIds, existingAttributeEdgeIds);

  const endIdExist = (id_) => !!normalizedEdgesValue[id_][endIdAttribute];
  const deleteInvalidUpdate = updatedAttributeIds.filter(id_ => !endIdExist(id_));
  deletedAttributeIds = A.concat(deletedAttributeIds, deleteInvalidUpdate);
  updatedAttributeIds = A.difference(updatedAttributeIds, deleteInvalidUpdate);


  batch(() => {
    deletedAttributeIds.forEach(id => deleteEdge_(edge, id));
    insertedAttributeIds.forEach(id_ => {
      if (!endIdExist(id_)) return;
      addNewEdge(newEdge(getNewGraphId(), edge, D.deleteKeys(normalizedEdgesValue[id_], [endIdAttribute]), results["0"].id, normalizedEdgesValue[id_][endIdAttribute]));
    });
    updatedAttributeIds.forEach(id_ => {
      updateEdgeWithStartAndEnd(edge, id_, D.deleteKeys(normalizedEdgesValue[id_], [endIdAttribute]), results["0"].id, normalizedEdgesValue[id_][endIdAttribute]);
    });
  });
}

export function fetchAttributesTableData(
  schema: string
): FormMetaData | FormMetaData[] {
  switch (schema) {
    case "ServerAttributeType": {
      return [
       { id: "0", title: "ServerFormAttributeType", save: ["vertex", Vertexs.ServerAttributeType], attributes: [{ key: "id", type: ServerFormAttributeType.String }] },
        {
          id: "1", title: "FormAttributeType",
          // save: ["edge", Edges.CollectionHasAttribute,(results)=>results[0], (results, formValue)=>formValue['attribute']],
          save: ["edge", Edges.ServerToFormAttributeType],
          // idFn: (idMap)=>
          data: (id: Map<string, string>) => {
            const AttributeEdges = getOutEdgeOfTypeIds(id.get('0'), Edges.ServerToFormAttributeType).map(edge => graph.edges[edge]); // todo sort by pos
            return {ServerToFormAttributeType: AttributeEdges}
          },
          attributes: [
            // { key: "attributes", type: "stringify" },
            { key: "ServerToFormAttributeType", type: "table", edge: "ServerToFormAttributeType",defaultValue: "undefined",
              save: (results, tableData)=>{
               const edge = Edges.ServerToFormAttributeType;
                const endIdAttribute = "FormAttributeType";
                saveTableDataToEdge(tableData, results, edge, endIdAttribute);
                return [];
              },
              attributes: [
                // _id is important, used for sorting
                { key: "_id", type: ServerFormAttributeType.String, default: (control, id: string)=>id || ulid(), hidden: true },
                { key: "pos", type: ServerFormAttributeType.Integer, default: (control)=>(control as ReturnType<typeof createFormArray>).controls.length + 1, hidden: true },
                { key: "FormAttributeType", type: "select", valueKey: "id", default: (control, id: string)=>id && graph.edges[id].end, fetchOptions:  async (formGroup, inputValue: string)=>fetchCollectionData("FormAttributeType").map((id) => graph.vertexes[id]) },
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
          { key: "serverType", type: "select", valueKey: "id", fetchOptions:  async (formGroup, inputValue: string)=>fetchCollectionData("ServerAttributeType").map((id) => graph.vertexes[id]),
            onchange: (formGroup, value) => {
              formGroup.controls['formType'].setValue(null);
            } },
          { key: "formType", type: "select", valueKey: "id", fetchOptions:  async (formGroup, inputValue: string)=>{
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
    case "Collection": {
      return [{
        id: "0", title: "Collection1", save: ["vertex", Vertexs.Collection], attributes: [
          { key: "id", type: "string" }, // { key: "attributes", type: "stringify" },
        ],
      },
        {
          id: "1", title: "Collection2",
          // save: ["edge", Edges.CollectionHasAttribute,(results)=>results[0], (results, formValue)=>formValue['attribute']],
          save: ["edge", Edges.CollectionHasAttribute],
          data: (id: Map<string, string>) => {
            const AttributeEdges = getOutEdgeOfTypeIds(id.get('0'), Edges.CollectionHasAttribute).map(edge => graph.edges[edge]); // todo sort by pos
            return {CollectionHasAttribute: AttributeEdges}
          },
          attributes: [
           // { key: "attributes", type: "stringify" },
            { key: "CollectionHasAttribute", type: "table", edge: "CollectionHasAttribute",defaultValue: "undefined",
              save: (results, tableData)=>{
                const edge = Edges.CollectionHasAttribute;
                const endIdAttribute = "attribute";
                saveTableDataToEdge(tableData, results, edge, endIdAttribute);
                return [];
              },
              defaultValueFn: (control: IFormGroup, key: string) => {
                const value = graph.vertexes[control.controls.attribute.value]?.["properties"]?.[key];
                if (typeof value === "boolean") {
                  return value === true ? "true" : "false"
                } else {
                  return value;
                }
              },
              attributes: [
              // _id is important, used for sorting
              { key: "_id", type: ServerFormAttributeType.String, default: (control, id: string)=>id || ulid(), hidden: true },
              { key: "pos", type: ServerFormAttributeType.Integer, default: (control)=>(control as ReturnType<typeof createFormArray>).controls.length + 1, hidden: true },
              { key: "attribute", type: "select", valueKey: "id", default: (control, id: string)=>id && graph.edges[id].end, fetchOptions:  async (formGroup, inputValue)=>fetchCollectionData("Attribute").map((id) => graph.vertexes[id]) },
              { key: "id", type: ServerFormAttributeType.String },
              { key: "selector", type: ServerFormAttributeType.String},
              { key: "serverType", type: "select", valueKey: "id", fetchOptions:  async (formGroup, inputValue)=>fetchCollectionData("ServerAttributeType").map((id) => graph.vertexes[id]) },
              { key: "formType", type: "select", valueKey: "id", fetchOptions:  async (formGroup, inputValue)=>fetchCollectionData("FormAttributeType").map((id) => graph.vertexes[id]) },
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
          { key: "id", type: "string" }, // { key: "attributes", type: "stringify" },
          { key: "title", type: "string" },
          { key: "description", type: "string" },
        ],
      },
        {
          id: "1", title: "FormLayout2",
          save: ["edge", Edges.CollectionHasAttribute],
          data: (id: Map<string, string>) => {
            const AttributeEdges = getOutEdgeOfTypeIds(id.get('0'), Edges.CollectionHasAttribute).map(edge => graph.edges[edge]); // todo sort by pos
            return {CollectionHasAttribute: AttributeEdges}
          },
          attributes: [
           // { key: "attributes", type: "stringify" },
            { key: "CollectionHasAttribute", type: "table", edge: "CollectionHasAttribute",defaultValue: "undefined",
              save: (results, tableData)=>{
                const edge = Edges.CollectionHasAttribute;
                const endIdAttribute = "attribute";
                saveTableDataToEdge(tableData, results, edge, endIdAttribute);
                return [];
              },
              defaultValueFn: (control: IFormGroup, key: string) => {
                const value = graph.vertexes[control.controls.attribute.value]?.["properties"]?.[key];
                if (typeof value === "boolean") {
                  return value === true ? "true" : "false"
                } else {
                  return value;
                }
              },
              attributes: [
              // _id is important, used for sorting
              { key: "_id", type: ServerFormAttributeType.String, default: (control, id: string)=>id || ulid(), hidden: true },
              { key: "pos", type: ServerFormAttributeType.Integer, default: (control)=>(control as ReturnType<typeof createFormArray>).controls.length + 1, hidden: true },
              { key: "attribute", type: "select", valueKey: "id", default: (control, id: string)=>id && graph.edges[id].end, fetchOptions:  async (formGroup, inputValue)=>fetchCollectionData("Attribute").map((id) => graph.vertexes[id]) },
              { key: "id", type: ServerFormAttributeType.String },
              { key: "selector", type: ServerFormAttributeType.String},
              { key: "serverType", type: "select", valueKey: "id", fetchOptions:  async (formGroup, inputValue)=>fetchCollectionData("ServerAttributeType").map((id) => graph.vertexes[id]) },
              { key: "formType", type: "select", valueKey: "id", fetchOptions:  async (formGroup, inputValue)=>fetchCollectionData("FormAttributeType").map((id) => graph.vertexes[id]) },
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


