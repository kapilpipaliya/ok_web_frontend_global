
import {
  Node,
  Relationship,
} from "neo4j-driver";
import { Vertex, Edge } from "~/lib/graph/graph";

// Functions to handle database values and convert them to JSON
export function convertNodeToJson(node: Node): Vertex {
  return {
    // @ts-ignore
    id: node.identity.toString(),
    L: node.labels,
    P: node.properties,
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
    P: relationship.properties,
  };
}
