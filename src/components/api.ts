import jju from "jju";
import { API_PATH } from "../constant";

import {
  addNewVertex,
  deleteVertex,
  findVertexIdsByLabel,
  getNewGraphId,
  graph,
  newVertex,
  replaceVertexProperties,
} from "../db/graph";

export const JSONToCypherMap = (json: object) => {
  // https://stackoverflow.com/questions/20841571/how-to-solve-the-dilemma-while-handle-json-in-neo4j-cypher
  return jju.stringify(json, { quote: "'" }).replace(/"/g, "\\x22");
};

const ServerAttributeType = {
  String: "string",
  Dynamic: "dynamic",
  Boolean: "boolean",
  Integer: "integer",
  Decimal: "decimal",
  Json: "json",
};

export async function fetchAttributesTableData(
  schema: string
): Promise<{ data: { key: string; type: string }[] }> {
  switch (schema) {
    case "AttributesType": {
      return { data: [{ key: "id", type: ServerAttributeType.String }] };
    }
    case "Attribute": {
      return {
        data: [
          { key: "id", type: ServerAttributeType.String },
          { key: "selector", type: ServerAttributeType.String },
          { key: "label", type: ServerAttributeType.String },
          { key: "type", type: ServerAttributeType.String },
          { key: "default", type: ServerAttributeType.Dynamic },
          { key: "required", type: ServerAttributeType.Boolean },
          { key: "internal", type: ServerAttributeType.Boolean },
          { key: "props", type: ServerAttributeType.Json },
          { key: "relation", type: ServerAttributeType.Json },
        ],
      };
    }
    case "Collection": {
      return {
        data: [
          { key: "_key", type: "string" },
          { key: "attributes", type: "stringify" },
        ],
      };
    }
  }
}

export async function fetchCollectionData(schema) {
  return {
    success: true,
    data: findVertexIdsByLabel(schema)
  };
}

export async function addNode(schema: string, body: any) {
  return {
    success: true,
    data: addNewVertex(newVertex(getNewGraphId(), [schema], body)),
  };
}

export async function fetchDocument(schema: string, id: number) {
  return {
    success: true,
    data: graph.vertexes[id],
  };
}

export async function updateNode(schema: string, id: number, body: any) {
  return {
    success: true,
    data: replaceVertexProperties(id, body),
  };
}
export async function deleteNode(schema: string, id: number) {
  return {
    success: true,
    data: deleteVertex(id),
  };
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
