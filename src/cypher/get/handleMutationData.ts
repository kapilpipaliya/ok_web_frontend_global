import type { Transaction } from "neo4j-driver";

import type { Vertex } from "~/lib/graph/graph";

import { convertNodeToJson } from "~/cypher/convertNodeToJson";

import { mutateData } from "../mutate/mutation_handlers/mutateData";

export async function handleMutationData(
  mutationData: any,
  vertex: Vertex[],
  tx: Transaction,
) {
  const mutationResult = await mutateData(mutationData, tx);
  if (mutationResult.error) {
    return mutationResult;
  }
  const newId = mutationResult.clientToServerVertexIdMap.get(vertex[0].id);
  if (newId) {
    const query = "MATCH (v) WHERE elementId(v) = $id RETURN v";
    const params = { id: newId };
    const result = await tx.run(query, params);
    if (result.records.length === 0) {
      return true;
    }
    vertex[0] = convertNodeToJson(result.records[0].get("v"));
  }
  return mutationResult;
}
