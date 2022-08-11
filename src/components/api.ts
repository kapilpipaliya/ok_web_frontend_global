import { API_PATH } from "../constant";
import { run } from "../db/db_utils";

const ServerAttributeType = {
  String: "string",
  Dynamic: "dynamic",
  Boolean: "boolean",
  Integer: "integer",
  Decimal: "decimal",
  Json: "json",
}

export async function fetchAttributesData(schema) {
  return {
    success: true,
    data: [
      { key: "_id", type: ServerAttributeType.String },
      { key: "_key", type: ServerAttributeType.String },
      { key: "_rev", type: ServerAttributeType.String },
      { key: "id", type: ServerAttributeType.String },
      { key: "selector", type: ServerAttributeType.String },
      { key: "label", type: ServerAttributeType.String },
      { key: "type", type: ServerAttributeType.String },
      { key: "default", type: ServerAttributeType.Dynamic },
      { key: "required", type: ServerAttributeType.Boolean },
      { key: "internal", type: ServerAttributeType.Boolean },
      { key: "props", type: ServerAttributeType.Json },
      { key: "relation", type: ServerAttributeType.Json },
    ]
  };

  // return fetch(API_PATH + `/en/${schema}/_attributes`, {
  //   method: "GET",
  //   headers: {
  //     Accept: "application/json",
  //     "Content-Type": "application/json",
  //   },
  // }).then((res) => res.json());
}

export async function fetchCollectionData(schema) {

  const data = await run(`
    MATCH (n:${schema == "collections" ? "Collection" : "Attribute"})
    RETURN n;
  `)

  return {
    success: true,
    data
  }

  // return fetch(API_PATH + `/en/${schema}`, {
  //   method: "GET",
  //   headers: {
  //     Accept: "application/json",
  //     "Content-Type": "application/json",
  //   },
  // }).then((res) => res.json());
}

export async function fetchAttributes(schema) {
  return {
    success: true,
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
    ]
  };

  // return fetch(API_PATH + `/en/${schema}/_attributes`, {
  //   method: "GET",
  //   headers: {
  //     Accept: "application/json",
  //     "Content-Type": "application/json",
  //   },
  // }).then((res) => res.json());
}

export function addCollection(_key, attributes) {

  console.log({ _key, attributes })

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

export function fetchDocument(schema: string, id: string) {
  return fetch(API_PATH + `/en/${schema}/${id}`).then((res) => res.json());
}
