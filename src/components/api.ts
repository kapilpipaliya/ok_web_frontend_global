import { API_PATH } from "../constant";

export function fetchAttributesData(schema) {
  return fetch(API_PATH + `/en/${schema}/_attributes`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  }).then((res) => res.json());
}

export function fetchCollectionData(schema) {
  return fetch(API_PATH + `/en/${schema}`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  }).then((res) => res.json());
}

export function fetchAttributes(schema) {
  return fetch(API_PATH + `/en/${schema}/_attributes`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  }).then((res) => res.json());
}

export function fetchDocument(schema: string, id: string) {
  return fetch(API_PATH + `/en/${schema}/${id}`).then((res) => res.json());
}
