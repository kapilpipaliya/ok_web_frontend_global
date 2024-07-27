import { int } from "neo4j-driver";

import type { Vertex } from "~/lib/graph/graph";

import { convertNodeToJson } from "~/cypher/convertNodeToJson";

import { getSessionForSubdomain } from "./getSessionForSubdomain";

/**
 * @deprecated This function is deprecated and will be removed in future versions.
 * Please use the new API methods for finding vertexes.
 */
export async function findVertexesMGCall(options: {
  attribute?: string;
  id?: number | string;
  label?: string;
  value?: number | string;
}): Promise<{ error?: boolean; message?: string; vertexes?: Vertex }> {
  "use server";
  const session = await getSessionForSubdomain();

  try {
    let query: string;
    let params: Record<string, any>;

    if (options.id !== undefined) {
      query = "MATCH (v) WHERE id(v) = $id RETURN v";
      params = { id: int(options.id) };
    } else if (options.label && options.attribute && options.value !== undefined) {
      query = `MATCH (v:${options.label} {${options.attribute}: $value}) RETURN v`;
      params = { value: options.value };
    } else if (
      options.label &&
      !options.attribute
    ) {
      query = `MATCH (v:${options.label}}) RETURN v`;
      params = { value: options.value };
    } else {
      return { error: true, message: "Invalid parameters" };
    }

    const result = await session.run(query, params);
    if (result.records.length === 0) {
      return { error: true, message: "No vertex found" };
    }

    const vertexes = result.records.map(record => convertNodeToJson(record.get("v")));
    return { error: false, vertexes: vertexes[0] };

  } catch (error) {
    console.error(error);
    return { error: true, message: "An error occurred" };
  } finally {
    await session.close();
  }
}
