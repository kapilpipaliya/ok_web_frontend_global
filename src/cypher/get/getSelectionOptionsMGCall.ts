// TODO:
//  if possible, use Name Keys, if not found use "name"
//  key else Primary Keys will be used.
// TODO:
import type { Edge, Vertex } from "~/lib/graph/graph";
import { evalAsync } from "~/lib/expression_eval";
import jsep from "jsep";
import { replaceExpressionToLabel } from "~/cypher/get/traverse";
import type { ServerResult } from "./ServerResult";
import { mutateData } from "../mutate/mutate_api/mutateData";
import { getSessionForSubdomain } from "./getSessionForSubdomain";
import { int } from "neo4j-driver";
import { convertNodeToJson } from "~/lib/convertNodeToJson";

export async function getSelectionOptionsMGCall(
  vertex: Vertex[],
  collection: string,
  mutationData?: any,
  strict?: boolean,
): Promise<Partial<ServerResult> & { error: boolean }> {
  "use server";
  const session = await getSessionForSubdomain();
  const tx = session.beginTransaction();
  if (mutationData) {
    const mutationResult = await mutateData(mutationData, tx);
    if (mutationResult.error) {
      return { error: true };
    }
    const newId = mutationResult.clientToServerVertexIdMap.get(vertex[0].id);
    if (newId) {
      const query = "MATCH (v) WHERE id(v) = $id RETURN v";
      const params = { id: int(newId) };
      const result = await tx.run(query, params);
      if (result.records.length === 0) {
        return {
          error: true,
        };
      }
      vertex[0] = convertNodeToJson(result.records[0].get("v"));
    }
  }
  const nodes: { [key: string]: Vertex } = {};
  const relationships: { [key: string]: Edge } = {};
  collection = await replaceExpressionToLabel(collection, vertex[0]);
  try {
    const value = await evalAsync(jsep(collection), {
      vertexes: vertex,
      nodes,
      relationships,
      tx
    });

    if (value) {
      return {
        error: false,
        result: value,
        graph: {
          vertexes: nodes,
          edges: relationships,
        },
      };
    }
    return { error: true };
  } catch (e) {
    console.error(e, vertex, collection);
    return { error: true };
  } finally {
    await tx.rollback();
    await tx.close();
    await session.close();
  }
}