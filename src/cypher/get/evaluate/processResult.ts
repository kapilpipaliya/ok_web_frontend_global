import type { Record } from "neo4j-driver";
import { convertNodeToJson, convertRelationshipToJson } from "~/lib/convertNodeToJson";
import type { ContextType } from "./ContextType";

export function processResult(records: Record[], context: ContextType, nodeLabel: string, typeLabel: string, inward?: boolean) {
  return records.map((record) => {
    const vertex = convertNodeToJson(record.get(nodeLabel));
    const relationship = convertRelationshipToJson(record.get(typeLabel));
  
    if (context.nodes) {
      context.nodes[vertex.id] = vertex;
    }

    if (context.relationships) {
      context.relationships[relationship.id] = relationship;
    }

    return vertex;
  });
}
