import jsep from "jsep";
import { getRequestURL } from "vinxi/http";
import { getDriver } from "~/cypher/driver";
import { evalAsync } from "~/lib/expression_eval";
import { getSubDomain } from "~/server/getSubDomain";
import type { Vertex } from "~/lib/graph/graph";

export async function checkIfNameExistsMGCall(vertex: Vertex) {
  "use server";
  const host = getRequestURL().hostname;
  const subDomain = await getSubDomain(host);
  const session = (await getDriver(subDomain)).session();

  const label = vertex.L[0];
  const name = vertex.P.name;
  const id = vertex.id;

  if (!name) {
    return { error: true, message: "Please configure the name first" };
  }

  try {
    if (await doesNameExist(session, label, name, id)) {
      return { error: true, message: "Provided name already exists" };
    }

    const uniqueConstrains = await evalAsync(jsep(`g:'Form[${label}]->$0Unique'`), {});
    for (const uniqueConstraintVertex of uniqueConstrains) {
      const keys = await evalAsync(jsep('->$0Key'), { vertexes: [uniqueConstraintVertex] });
      if (keys.length > 0) {
        const uniqueConstraintExists = await doesUniqueConstraintExist(session, label, id, keys, vertex);
        if (uniqueConstraintExists) {
          return {
            error: true,
            message: `Unique constraint ${keys.map((k: Vertex) => k.P.name).join(", ")} already exists`
          };
        }
      }
    }

    return { error: false };
  } catch (error: any) {
    return { error: true, message: error.message };
  } finally {
    await session.close();
  }
}

async function doesNameExist(session: any, label: string, name: string, id?: string) {
  const query = `MATCH (v:${label}) WHERE v.name = $name ${id ? 'AND v.elementId != $id' : ''} RETURN v`;
  const params = id ? { name, id } : { name };
  const result = await session.run(query, params);
  return result.records.length > 0;
}

async function doesUniqueConstraintExist(session: any, label: string, id: string | undefined, keys: Vertex[], vertex: Vertex) {
  const params: Record<string, any> = { id };
  let query = `MATCH (v:${label}) WHERE ${id ? 'v.elementId != $id AND ' : ''}`;

  for (const key of keys) {
    query += `v.${key.P.name} = $${key.P.name} AND `;
    params[key.P.name] = vertex.P[key.P.name];
  }

  query = query.slice(0, -5); // Remove the last ' AND '
  query += " RETURN v";
  
  const result = await session.run(query, params);
  return result.records.length > 0;
}
