import jju from "jju";
import { API_PATH } from "../constant";

import {
  addNewVertex,
  deleteEdge,
  deleteVertex, Edges,
  findVertexIdsByLabel,
  getNewGraphId,
  graph,
  Id,
  newVertex,
  replaceEdgeProperties,
  replaceVertexProperties, Vertexs
} from "../lib/graph";

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

interface BaseField {
  key: string;
  type: string;
  editable?: boolean;
}

export interface SelectField extends BaseField {
  collection: string;
}
export type FieldAttribute = BaseField | SelectField

export interface FormMetaData {
  id: Id;
  title: string;
  attributes: FieldAttribute[];
  save: ["vertex", string] | ['edge', string, (result: any[])=> Id, (result: any[], row: object)=> Id];
}
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
          id: "0", title: "Collection2", save: ["edge", Edges.CollectionHasAttribute,(result)=>result[0].id, (result, row)=>row['id']], attributes: [
            { key: "id", type: "string" }, // { key: "attributes", type: "stringify" },
            { key: "attribute", type: "select", collection: "Attribute"}
          ],
        }];
    }
  }
}

export function fetchCollectionData(schema:string) {
  return findVertexIdsByLabel(schema);
}

export function addNode(schema: string, body: any) {
  const newId = getNewGraphId()
  addNewVertex(newVertex(newId, [schema], body))
  return newId;
}

export function fetchDocument(schema: string, id: Id) {
  return graph.vertexes[id];
}

export function updateNode(schema: string, id: Id, body: any) {
    replaceVertexProperties(id, body);
    return id;
}
export function updateEdge(schema: string, id: Id, body: any) {
    return replaceEdgeProperties(id, body);
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


