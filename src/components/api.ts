import jju from "jju";
import { API_PATH } from "../constant";
import { ulid } from 'ulid'

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
  replaceVertexProperties, Vertexs
} from "../lib/graph";
import { batch, createUniqueId } from "solid-js";
import { createFormArray } from "solid-forms";
import { FormMetaData } from 'ok_web_components/src/components/input/Form';
import { klona } from "klona/json";
import { A } from "@mobily/ts-belt";

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

export function fetchAttributesTableData(
  schema: string
): FormMetaData | FormMetaData[] {
  switch (schema) {
    case "ServerAttributeType": {
      return [{ id: "0", title: "ServerFormAttributeType", save: ["vertex", Vertexs.ServerAttributeType], attributes: [{ key: "id", type: ServerFormAttributeType.String }] }];
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
          { key: "type", type: ServerFormAttributeType.String },
          { key: "default", type: ServerFormAttributeType.Dynamic },
          { key: "required", type: ServerFormAttributeType.Boolean },
          { key: "internal", type: ServerFormAttributeType.Boolean },
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
          // idFn: (idMap)=>
          data: (id: Map<string, string>) => {
            const AttributeEdges = getOutEdgeOfTypeIds(id.get('0'), Edges.CollectionHasAttribute).map(edge => graph.edges[edge]); // todo sort by pos
            return {CollectionHasAttribute: AttributeEdges}
          },
          attributes: [
           // { key: "attributes", type: "stringify" },
            { key: "CollectionHasAttribute", type: "table", edge: "CollectionHasAttribute",defaultValue: "undefined",
              save: (results: {[key: string]: any}, tableData: any[])=>{
                const normalizedEdgesValue = tableData.reduce((acc, curr)=>{
                  acc[curr._id] = klona(curr);
                  return acc;
                }, {});

                const newIds = Object.keys(normalizedEdgesValue) as Array<string>;
                const existingAttributeEdgeIds = getOutEdgeOfTypeIds(results["0"].id, Edges.CollectionHasAttribute).map(x=>`${x}`) as Array<string>;

                const insertedAttributeIds = A.difference(newIds, existingAttributeEdgeIds);
                const deletedAttributeIds = A.difference(existingAttributeEdgeIds, newIds);
                const updatedAttributeIds = A.intersection(newIds, existingAttributeEdgeIds);


                batch(() => {
                  deletedAttributeIds.forEach(id=>deleteEdge_(Edges.CollectionHasAttribute, id));
                  insertedAttributeIds.forEach(id => {
                    if(!normalizedEdgesValue[id].attribute) return;
                    addNewEdge(newEdge(getNewGraphId(), Edges.CollectionHasAttribute, klona(normalizedEdgesValue[id]), results["0"].id, normalizedEdgesValue[id].attribute));
                  });
                  updatedAttributeIds.forEach(id=>{
                    updateEdge(Edges.CollectionHasAttribute,id, klona(normalizedEdgesValue[id]))})
                })

                return [];
              },
              attributes: [
              // _id is important, used for sorting
              { key: "_id", type: ServerFormAttributeType.String, default: (control, id: string)=>id || ulid(), hidden: true },
              { key: "pos", type: ServerFormAttributeType.Integer, default: (control)=>(control as ReturnType<typeof createFormArray>).controls.length + 1, hidden: true },
              { key: "attribute", type: "select", valueKey: "id", fetchOptions:  async (inputValue: string)=>fetchCollectionData("Attribute").map((id) => graph.vertexes[id]) },
              { key: "id", type: ServerFormAttributeType.String },
              { key: "selector", type: ServerFormAttributeType.String},
              { key: "type", type: ServerFormAttributeType.String },
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
export function updateEdge(schema: string, id: Id, body: any) {
    replaceEdgeProperties(id, body);
    return id;
}
export function updateEdgeWithStartAndEnd(schema: string, id: Id, body: any, start: Id, end: Id) {
    replaceEdgeProperties(id, body);
    // TODO write function to replace from and start Ids for edge.
    // when replace start and end txn become complex.
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


