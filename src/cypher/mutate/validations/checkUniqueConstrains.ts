import type { Vertex } from "~/lib/graph/graph";

import { evalExpressionAsync } from "~/lib/expression_eval";

import { isReservedKeyword } from "../../constants/reservedKeywords";
import { getDBSessionForSubdomain } from "../../session/getSessionForSubdomain";

export async function checkUniqueConstrains(vertex: Vertex) {
  "use server";
  const { dbSession } = await getDBSessionForSubdomain();

  const label = vertex.L[0];
  const key = vertex.P.key;
  const id = vertex.id;

  if (!key) {
    return { error: "Please configure the key first" };
  }

  if (label === "Form" && isReservedKeyword(key)) {
    return {
      error: `The key "${key}" is a reserved word and cannot be used`,
    };
  }

  try {
    if (await doesNameExist(dbSession, label, key, id)) {
      return { error: "Provided key already exists" };
    }

    const uniqueConstrains = await evalExpressionAsync(
      `g:'Form[${label}]'->$0Unique`,
      {},
    );
    if (!Array.isArray(uniqueConstrains)) {
      return { error: false };
    }
    for (const uniqueConstraintVertex of uniqueConstrains) {
      const keys = await evalExpressionAsync("->$0Key", {
        vertexes: [uniqueConstraintVertex],
      });
      if (keys.length > 0) {
        const uniqueConstraintExists = await doesUniqueConstraintExist(
          dbSession,
          label,
          id,
          keys,
          vertex,
        );
        if (uniqueConstraintExists) {
          return {
            error: `Unique constraint ${keys.map((k: Vertex) => k.P.key).join(", ")} already exists`,
          };
        }
      }
    }

    return { error: false };
  } catch (error: any) {
    return { error: error.message };
  } finally {
    await dbSession.close();
  }
}

async function doesNameExist(
  dbSession: any,
  label: string,
  key: string,
  id?: string,
) {
  const query = `MATCH (v:${label}) WHERE v.key = $key ${id ? "AND v.elementId <> $id" : ""} RETURN v`;
  const params = id ? { id, key } : { key };
  const result = await dbSession.run(query, params);
  return result.records.length > 0;
}

async function doesUniqueConstraintExist(
  dbSession: any,
  label: string,
  id: string | undefined,
  keys: Vertex[],
  vertex: Vertex,
) {
  const params: Record<string, any> = { id };
  let query = `MATCH (v:${label}) WHERE ${id ? "v.elementId <> $id AND " : ""}`;

  for (const key of keys) {
    query += `v.${key.P.key} = $${key.P.key} AND `;
    params[key.P.key] = vertex.P[key.P.key];
  }

  query = query.slice(0, -5); // Remove the last ' AND '
  query += " RETURN v";

  const result = await dbSession.run(query, params);
  return result.records.length > 0;
}
