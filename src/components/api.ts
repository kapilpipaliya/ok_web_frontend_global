import jju from 'jju';
import { API_PATH } from "../constant";
import { run } from "../db/db_utils";

export const JSONToCypherMap = (json: object) => {
  // https://stackoverflow.com/questions/20841571/how-to-solve-the-dilemma-while-handle-json-in-neo4j-cypher
  return jju.stringify(json, {quote:"'"}).replace(/"/g,'\\x22')
}

const ServerAttributeType = {
  String: "string",
  Dynamic: "dynamic",
  Boolean: "boolean",
  Integer: "integer",
  Decimal: "decimal",
  Json: "json"
};

export async function fetchAttributesTableData(schema: string): Promise<{ data: { key: string; type: string }[] }> {
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
          { key: "relation", type: ServerAttributeType.Json }
        ]
      };
    }
    case "Collection": {
      return {
        data: [
          { key: "_key", type: "string" },
          { key: "attributes", type: "stringify" }
        ]
      };
    }
  }
}

export async function fetchCollectionData(schema) {
  const data = await run(`MATCH (n:${schema}) RETURN n`);
  return {
    success: true,
    data: data['output'].map(resultItem=>resultItem['n'])
  };
}


export async function addNode(schema: string, body: any) {
  const query = `CREATE (n:${schema} ${JSONToCypherMap(body)}) return n`;
    const data = await run(query);
    return {
      success: true,
      data: data['output'].map(resultItem=>resultItem['n'])
    };
  }

export async function fetchDocument(schema: string, id: string) {
  const query = `MATCH (n:${schema} {id: '${id}'}) RETURN n`;
  const data = await run(query);
  return {
    success: true,
    data: data['output'].map(resultItem=>resultItem['n'])
  };

}

export async function updateNode(schema: string, id: string, body: any) {
  const query = `MATCH (n:${schema} {id: '${id}'})
SET n+=${JSONToCypherMap(body)}
RETURN n`;
  debugger;
  const data = await run(query);
  return {
    success: true,
    data: data['output'].map(resultItem=>resultItem['n'])
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
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ attributes })
  }).then((res) => res.json());
}

export function addFormLayout(_key, attributes) {
  return fetch(API_PATH + `/en/formLayouts`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ _key: _key, attributes })
  }).then((res) => res.json());
}

export function updateFormLayout(_key, attributes) {
  return fetch(API_PATH + `/en/formLayouts/${_key}`, {
    method: "PATCH",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ attributes })
  }).then((res) => res.json());
}
