import { int, } from "neo4j-driver";

import { convertNodeToJson } from "~/lib/convertNodeToJson";

import type { ContextType } from "./ContextType";

import { getSessionForSubdomain } from "../getSessionForSubdomain";

export async function findVertexMGCallId(
  {
    id,
    label,
    limit,
    name,
    skip,
  }: {
    id?: string;
    label?: string;
    limit?: number;
    name?: string;
    skip?: number;
  },
  context: ContextType = {},
) {
  let query: string | undefined;
  const params = {} as { id: any; name?: string };

  if (id) {
    query = "MATCH (n) WHERE id(n) = $id RETURN n";
    params.id = int(id);
  } else if (label) {
    if (label === "ALL_LABELS") {
      query = "MATCH (n) RETURN DISTINCT labels(n)";
    } else if (name) {
      query = `MATCH (n:${label}) WHERE n.name = $name RETURN n`;
      params.name = name;
    } else {
      query = `MATCH (n:${label}) RETURN n`;
    }
  }

  if (name || skip || limit) {
    if (skip) {
      query += ` SKIP ${skip}`;
    }

    if (limit) {
      query += ` LIMIT ${limit}`;
    }
  }
  if (!query) {
    return { error: "Either 'id' or 'label' must be provided." };
  }
  const session = context.tx ? null : (context.session || await getSessionForSubdomain());
  try {
    const result = await (context.tx ? context.tx.run(query, params) : session!.run(query, params));
    if (label === "ALL_LABELS") {
      return result.records.map(record => record.get(0)[0]);
    }
    return result.records.map((record) => {
      const vertex = convertNodeToJson(record.get("n"));
      if (context.nodes) {
        context.nodes[vertex.id] = vertex;
      }
      return vertex;
    });
  } catch (error: any) {
    throw error;
  } finally {
    if (!context.session && session) {
      await session.close();
    }
  }
}