import { Node } from "~/cypher_api/functions/Type";
import { getDriver } from "../server/driver";
import { convertNodeToJson } from "~/lib/convertNodeToJson";
import { getRequestURL } from "vinxi/http";
import { getSubDomain } from "../server/domain_utils";
export async function findVertexMGCall(
  label: string,
  attribute: string,
  value: number | string,
) {
  "use server";
  const host = getRequestURL().hostname;
  const subDomain = await getSubDomain(host);
  const session = await (await getDriver(subDomain)).session();
  ``;
  try {
    // Cypher query to create a new vertex
    let createVertexQuery = `MATCH (v:${label} {${attribute}: $value}) RETURN v`;
    const vertexResult = await session.run(createVertexQuery, { value });

    // Extract the new vertex ID from the result
    if (vertexResult.records.length === 0) {
      return { error: true, message: "empty result" };
    }
    const newVertex = vertexResult.records[0].get("v") as Node;
    newVertex.id = newVertex.identity!;
    newVertex.L = newVertex.labels!;
    newVertex.P = newVertex.properties!;

    return {
      error: false,
      vertex: newVertex,
    };
  } catch (error) {
    console.error(error);

    return { error: true, message: "An error occurred" };
  } finally {
    // await session.close();
    // on application exit:
    // await driver.close();
  }
}

export async function findVertexByIdMGCall(id: number) {
  "use server";
  const host = getRequestURL().hostname;
  const subDomain = await getSubDomain(host);
  console.log(subDomain);

  const session = await (await getDriver(subDomain)).session();

  try {
    // Cypher query to create a new vertex
    let createVertexQuery = `MATCH (v) WHERE id(v) = $id RETURN v`;
    const vertexResult = await session.run(createVertexQuery, { id });

    // Extract the new vertex ID from the result
    if (vertexResult.records.length === 0) {
      return { error: true, message: "empty result" };
    }

    const newVertex = convertNodeToJson(vertexResult.records[0].get("v"));

    return {
      error: false,
      vertex: newVertex,
    };
  } catch (error) {
    console.error(error);

    return { error: true, message: "An error occurred" };
  } finally {
    // await session.close();
    // on application exit:
    // await driver.close();
  }
}

// TODO: Now use this function
export async function findVertexesMGCall2(options: {
  label?: string;
  attribute?: string;
  value?: number | string;
  id?: number;
}) {
  "use server";
  const host = getRequestURL().hostname;
  const subDomain = await getSubDomain(host);
  const driver = await (await getDriver(subDomain)).session();

  try {
    let query;
    let params;

    if (options.id !== undefined) {
      query = `MATCH (v) WHERE id(v) = $id RETURN v`;
      params = { id: options.id };
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

    const vertexes = vertexResult.records[0].map((v) => {
      const vertex = v.get("v");
      return {
        id: vertex.identity!,
        L: vertex.labels!,
        P: vertex.properties!,
      };
    });

    return {
      error: false,
      vertexes,
    };
  } catch (error) {
    console.error(error);

    return { error: true, message: "An error occurred" };
  } finally {
    // await session.close();
    // on application exit:
    // await driver.close();
  }
}
