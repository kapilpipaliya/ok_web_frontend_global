import jsep from "jsep";
import { getRequestURL } from "vinxi/http";

import { getDriver } from "~/cypher/driver";
import { evalAsync } from "~/lib/expression_eval";
import type { Vertex } from "~/lib/graph/graph";
import { getSubDomain } from "~/server/getSubDomain";

export const checkIfNameExistsMGCall = async (
  vertex: Vertex,
) => {
  "use server";
  const host = getRequestURL().hostname;
  const subDomain = await getSubDomain(host);
  const session = (await getDriver(subDomain)).session();

  const label = vertex.L[0];
  const name = vertex.P.name;
  const id = vertex.id;

  const buildUniqueCheckQuery = (label: string, name: string, id?: string) => {
    let baseQuery = `MATCH (v:${label}) WHERE v.name = $name`;
    if (id) {
      baseQuery += ` AND v.elementId != $id`;
    }
    baseQuery += ` RETURN v`;
    return baseQuery;
  };


  const buildUniqueConstrainCheckQuery = (keys: Vertex[]) => {
    let baseQuery = `MATCH (v:${label}) WHERE `;
    const params: Record<string, string> = {};
    if (id) {
      baseQuery += `v.elementId != $id AND `;
    }
    for(const key of keys) {
      baseQuery += `v.${key.P.name} = $${key.P.name} AND `;
      params[key.P.name] = vertex.P[key.P.name];
    }
    baseQuery = baseQuery.slice(0, -4);
    baseQuery += ` RETURN v`;
    return { params, query: baseQuery };
  };

  try {
    const checkQuery = buildUniqueCheckQuery(label, name, id);
    const params = id ? { id, name } : { name };
    const result = await session.run(checkQuery, params);
    const nameExists = result.records.length > 0;

    if (nameExists) {
      return { error: true, message: "Provided name already exists" };
    }

    const uniqueConstrains = await evalAsync(jsep(`g:'Form[${label}]->$0Unique'`), {});
    if (uniqueConstrains.length > 0) {
      for (const uniqueConstraintVertex of uniqueConstrains) {
        const keys = await evalAsync(jsep('->$0Key'), {vertexes: [uniqueConstraintVertex]});
        if (keys.length > 0) {
          const {params, query} = buildUniqueConstrainCheckQuery(keys);
          const result = await session.run(query, params);
          const uniquConstrainExists = result.records.length > 0;
          if (uniquConstrainExists) {
            return { error: true, message: `Unique constraint ${keys.map((k: Vertex) => k.P.name).join(", ")} already exists` };
          }
        }
      }
    }
    return { error: false };
  } catch (error: any) {
    return { error: true, message: error.message };
  } finally {
    await session.close();
  }
};
