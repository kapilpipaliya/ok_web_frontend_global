import type { Node, Relationship } from "neo4j-driver";
import type { Vertex, Edge } from "~/lib/graph/graph";

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
        unwrapped[key] = properties[key].toNumber(); // Convert to JavaScript number
      } else if (
        "date" in properties[key] &&
        "month" in properties[key] &&
        "year" in properties[key]
      ) {
        unwrapped[key] =
          `${properties[key].year}-${properties[key].month}-${properties[key].date}`;
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
    // @ts-ignore
    id: node.identity.toString(),
    L: node.labels,
    P: unwrapProperties(node.properties),
    // @ts-ignore
    OUT: node.OUT || {},
    // @ts-ignore
    IN: node.IN || {},
  };
}

export function convertRelationshipToJson(relationship: Relationship): Edge {
  return {
    // @ts-ignore
    id: relationship.identity.toString(),
    T: relationship.type,
    // @ts-ignore
    S: relationship.start.toNumber(),
    // @ts-ignore
    E: relationship.end.toNumber(),
    // when disableLosslessIntegers is false, we get object in number property.
    // Todo: data is not handled as properly, object is returned from server
    P: unwrapProperties(relationship.properties),
  };
}
