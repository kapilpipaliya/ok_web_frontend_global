import { int } from "neo4j-driver";
import { getRequestURL } from "vinxi/http";

import type { Vertex } from "~/lib/graph/graph";

import { getDriver } from "~/cypher/driver";
import { convertNodeToJson } from "~/lib/convertNodeToJson";
import { getSubDomain } from "~/server/getSubDomain";

export async function findVertexesMGCall(options: {
  attribute?: string;
  id?: number | string;
  label?: string;
  value?: number | string;
}): Promise<{ error?: boolean; message?: string; vertexes?: Vertex }> {
  "use server";
  const host = getRequestURL().hostname;
  const subDomain = await getSubDomain(host);
  const driver = await (await getDriver(subDomain)).session();

  try {
    let query;
    let params;

    if (options.id !== undefined) {
      query = "MATCH (v) WHERE id(v) = $id RETURN v";
      params = { id: int(options.id) };
    } else if (
      options.label &&
      options.attribute &&
      options.value !== undefined
    ) {
      query = `MATCH (v:${options.label} {${options.attribute}: $value}) RETURN v`;
      params = { value: options.value };
    } else if (
      options.label &&
      options.attribute &&
      options.value !== undefined
    ) {
      query = `MATCH (v:${options.label}}) RETURN v`;
      params = { value: options.value };
    } else {
      return { error: true, message: "Invalid parameters" };
    }

    const vertexResult = await driver.run(query, params);
    if (vertexResult.records.length === 0) {
      return {
        error: true,
      };
    }
    const vertexes = convertNodeToJson(vertexResult.records[0].get("v"));

    return {
      error: false,
      vertexes,
    };
  } catch (error) {
    console.error(error);

    return { error: true, message: "An error occurred" };
  }
}
