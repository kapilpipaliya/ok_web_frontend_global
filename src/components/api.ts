import jju from "jju";
import { API_PATH } from "../constant";

import {
  addNewVertex, deleteEdge,
  deleteVertex,
  findVertexIdsByLabel,
  getNewGraphId,
  graph, Id,
  newVertex, replaceEdgeProperties,
  replaceVertexProperties
} from "../db/graph";

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
  Json: "json",
};

export async function fetchAttributesTableData(
  schema: string
): Promise<{ data: { key: string; type: string }[] }> {
  switch (schema) {
    case "FormAttributeType": {
      return { data: [{ key: "id", type: ServerFormAttributeType.String }] };
    }
    case "Attribute": {
      return {
        data: [
          { key: "id", type: ServerFormAttributeType.String },
          { key: "selector", type: ServerFormAttributeType.String },
          { key: "label", type: ServerFormAttributeType.String },
          { key: "type", type: ServerFormAttributeType.String },
          { key: "default", type: ServerFormAttributeType.Dynamic },
          { key: "required", type: ServerFormAttributeType.Boolean },
          { key: "internal", type: ServerFormAttributeType.Boolean },
          { key: "props", type: ServerFormAttributeType.Json },
          { key: "relation", type: ServerFormAttributeType.Json },
        ],
      };
    }
    case "Collection": {
      return {
        data: [
          { key: "id", type: "string" },
          { key: "attributes", type: "stringify" },
        ],
      };
    }
  }
}

export async function fetchCollectionData(schema) {
  return {
    success: true,
    data: findVertexIdsByLabel(schema),
  };
}

export async function addNode(schema: string, body: any) {
  const newId = getNewGraphId();
  return {
    success: true,
    id: newId,
    data: addNewVertex(newVertex(newId, [schema], body)),
  };
}

export async function fetchDocument(schema: string, id: Id) {
  return {
    success: true,
    data: graph.vertexes[id],
  };
}

export async function updateNode(schema: string, id: Id, body: any) {
  return {
    success: true,
    data: replaceVertexProperties(id, body),
  };
}
export async function updateEdge(schema: string, id: Id, body: any) {
  return {
    success: true,
    data: replaceEdgeProperties(id, body),
  };
}

export async function deleteNode(schema: string, id: Id) {
  return {
    success: true,
    data: deleteVertex(id),
  };
}
export async function deleteEdge_(schema: string, id: string) {
  return {
    success: true,
    data: deleteEdge(id),
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
