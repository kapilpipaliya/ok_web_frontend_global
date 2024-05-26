import { isIntegerId } from "~/cypher_api/server/driver";
import { Node, Relationship } from "neo4j-driver";
import { Vertex, Edge } from "~/lib/graph/graph";

// Functions to handle database values and convert them to JSON
export function convertNodeToJson(node: Node): Vertex {
  return {
    // @ts-ignore
    id: !isIntegerId ? node.identity.toNumber() : node.identity,
    L: node.labels,
    P: node.properties,
    OUT: {},
    IN: {},
  };
}
export function convertRelationshipToJson(relationship: Relationship): Edge {
  return {
    // @ts-ignore
    id: !isIntegerId ? relationship.identity.toNumber() : relationship.identity,
    T: relationship.type,
    // @ts-ignore
    S: !isIntegerId ? relationship.start.toNumber() : relationship.start,
    // @ts-ignore
    E: !isIntegerId ? relationship.end.toNumber() : relationship.end,
    // when disableLosslessIntegers is false, we get object in number property.
    // Todo: data is not handled as properly, object is returned from server
    P: relationship.properties,
  };
}
