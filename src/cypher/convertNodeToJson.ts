import type { Node, Relationship } from "neo4j-driver";

import type { Edge, Vertex } from "~/lib/graph/graph";

function unwrapProperties(
  properties: Record<string, any>,
): Record<string, any> {
  if (Array.isArray(properties)) {
    return properties.map((item) => unwrapProperties(item));
  }
  const unwrapped: Record<string, any> = {};

  for (const key in properties) {
    if (properties[key] && typeof properties[key] === "object") {
      if ("low" in properties[key] && "high" in properties[key]) {
        // Assuming the property is a Neo4j Integer
        unwrapped[key] = properties[key]; //.toNumber(); // Convert to JavaScript number
        // There is isDateTime function in the Neo4j driver too
      } else if (
        "year" in properties[key] &&
        "month" in properties[key] &&
        "day" in properties[key] &&
        "hour" in properties[key] &&
        "minute" in properties[key] &&
        "second" in properties[key] &&
        "nanosecond" in properties[key]
      ) {
        const date = new Date(
          properties[key].year,
          properties[key].month - 1,
          properties[key].day,
          properties[key].hour,
          properties[key].minute,
          properties[key].second,
          Math.floor(properties[key].nanosecond / 1000000),
        );
        unwrapped[key] = date.toISOString();
      } else {
        // Recursively unwrap nested objects
        unwrapped[key] = unwrapProperties(properties[key]);
      }
    } else {
      unwrapped[key] = properties[key];
    }
  }

  return unwrapped;
}

// Functions to handle database values and convert them to JSON
export function convertNodeToJson(node: Node): Vertex {
  return {
    id: node.elementId,
    IN: node.IN || {},
    L: node.labels,
    OUT: node.OUT || {},
    P: unwrapProperties(node.properties),
  };
}

export function convertRelationshipToJson(relationship: Relationship): Edge {
  return {
    E: relationship.endNodeElementId,
    // when disableLosslessIntegers is false, we get object in number property.
    id: relationship.elementId,
    // Todo: data is not handled as properly, object is returned from server
    P: unwrapProperties(relationship.properties),
    S: relationship.startNodeElementId,
    T: relationship.type,
  };
}
