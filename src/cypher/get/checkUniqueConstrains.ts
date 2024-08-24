

import type { Vertex } from "~/lib/graph/graph";

import { evalExpressionAsync } from "~/lib/expression_eval";

import { getDBSessionForSubdomain } from "./getSessionForSubdomain";
import { isReservedKeyword } from "./reservedKeywords";
export async function checkUniqueConstrains(vertex: Vertex) {
  "use server";
  const { dbSession } = await getDBSessionForSubdomain();

  const label = vertex.L[0];
  const name = vertex.P.name;
  const id = vertex.id;

  if (!name) {
    return { error: "Please configure the name first" };
  }

  if (label === "Form" && isReservedKeyword(name)) {
    return {
      error: `The name "${name}" is a reserved word and cannot be used`,
    };
  }

  try {
    if (await doesNameExist(session, label, name, id)) {
      return { error: "Provided name already exists" };
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
            error: `Unique constraint ${keys.map((k: Vertex) => k.P.name).join(", ")} already exists`,
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
  session: any,
  label: string,
  name: string,
  id?: string,
) {
  const query = `MATCH (v:${label}) WHERE v.name = $name ${id ? "AND v.elementId != $id" : ""} RETURN v`;
  const params = id ? { id, name } : { name };
  const result = await session.run(query, params);
  return result.records.length > 0;
}

async function doesUniqueConstraintExist(
  session: any,
  label: string,
  id: string | undefined,
  keys: Vertex[],
  vertex: Vertex,
) {
  const params: Record<string, any> = { id };
  let query = `MATCH (v:${label}) WHERE ${id ? "v.elementId != $id AND " : ""}`;

  for (const key of keys) {
    query += `v.${key.P.name} = $${key.P.name} AND `;
    params[key.P.name] = vertex.P[key.P.name];
  }

  query = query.slice(0, -5); // Remove the last ' AND '
  query += " RETURN v";

  const result = await session.run(query, params);
  return result.records.length > 0;
}
