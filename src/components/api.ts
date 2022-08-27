import jju from "jju";
import { API_PATH } from "../constant";

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
import { createUniqueId } from "solid-js";
import { createFormArray } from "solid-forms";
import { FormMetaData } from 'ok_web_components/src/components/input/Form';
import { klona } from "klona/json";

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
        id: "0", title: "Collection", save: ["vertex", Vertexs.Collection], attributes: [
          { key: "id", type: "string" }, // { key: "attributes", type: "stringify" },
        ],
      }];
    }
    case "Collection2": {
      return [{
        id: "0", title: "Collection1", save: ["vertex", Vertexs.Collection], attributes: [
          { key: "id", type: "string" }, // { key: "attributes", type: "stringify" },
        ],
      },
        {
          id: "1", title: "Collection2",
          save: ["edge", Edges.CollectionHasAttribute,(results)=>results[0].id, (results, formValue)=>formValue['attribute']],
          // idFn: (idMap)=>
          data: (id: Map<string, string>) => {
            const AttributeEdges = getOutEdgeOfTypeIds(id.get('0'), Edges.CollectionHasAttribute).map(edge => graph.edges[edge]); // todo sort by pos
            return {CollectionHasAttribute: AttributeEdges}
          },
          attributes: [
           // { key: "attributes", type: "stringify" },
            { key: "CollectionHasAttribute", type: "table", edge: "CollectionHasAttribute",defaultValue: "undefined",
              save: (results: {[key: string]: any}, tableData: any[])=>{
                tableData.forEach(row => {
                  addNewEdge(newEdge(getNewGraphId(), Edges.CollectionHasAttribute, klona(row), results["0"].id, row.attribute));
                })
              },
              attributes: [
              // _id is important, used for sorting
              { key: "_id", type: ServerFormAttributeType.String, default: (control, id: string)=>id || createUniqueId(), hidden: true },
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


