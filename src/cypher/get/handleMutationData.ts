import type { Vertex } from "~/lib/graph/graph";
import { mutateData } from "../mutate/mutate_api/mutateData";
import { int } from "neo4j-driver";
import { convertNodeToJson } from "~/lib/convertNodeToJson";
import type { TransactionPromise } from "neo4j-driver-core";


export async function handleMutationData(
  mutationData: any,
  vertex: Vertex[],
  tx: TransactionPromise,
) {
  const mutationResult = await mutateData(mutationData, tx);
  if (mutationResult.error) {
    return mutationResult;
  }
  const newId = mutationResult.clientToServerVertexIdMap.get(vertex[0].id);
  if (newId) {
    const query = "MATCH (v) WHERE id(v) = $id RETURN v";
    const params = { id: int(newId) };
    const result = await tx.run(query, params);
    if (result.records.length === 0) {
      return true;
    }
    vertex[0] = convertNodeToJson(result.records[0].get("v"));
  }
  return mutationResult;
}
