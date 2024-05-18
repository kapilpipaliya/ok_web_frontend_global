import neo4j from "neo4j-driver";
import { DBConnection } from "~/cypher_api/functions/dbs";
import { Node } from "~/cypher_api/functions/Type";

export async function findVertexMGCall(
  dbConn: DBConnection,
  label: string,
  attribute: string,
  value: number | string,
) {
  "use server";
  dbConn.session ||= dbConn.driver.session({
    defaultAccessMode: neo4j.session.WRITE,
  });

  try {
    // Cypher query to create a new vertex
    let createVertexQuery = `MATCH (v:${label} {${attribute}: $value}) RETURN v`;
    const vertexResult = await dbConn.session.run(createVertexQuery, { value });

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

export async function findVertexByIdMGCall(dbConn: DBConnection, id: number) {
  "use server";
  dbConn.session ||= dbConn.driver.session({
    defaultAccessMode: neo4j.session.WRITE,
  });

  try {
    // Cypher query to create a new vertex
    let createVertexQuery = `MATCH (v) WHERE id(v) = $id RETURN v`;
    const vertexResult = await dbConn.session.run(createVertexQuery, { id });

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

// TODO: Now use this function
export async function findVertexesMGCall2(
  dbConn: DBConnection,
  options: { label?: string; attribute?: string; value?: number | string; id?: number }
) {
  "use server";
  dbConn.session ||= dbConn.driver.session({
    defaultAccessMode: neo4j.session.WRITE,
  });

  try {
    let query;
    let params;

    if (options.id !== undefined) {
      query = `MATCH (v) WHERE id(v) = $id RETURN v`;
      params = { id: options.id };
    } else if (options.label && options.attribute && options.value !== undefined) {
      query = `MATCH (v:${options.label} {${options.attribute}: $value}) RETURN v`;
      params = { value: options.value };
    } else if (options.label && options.attribute && options.value !== undefined) {
      query = `MATCH (v:${options.label}}) RETURN v`;
      params = { value: options.value };
    } else {
      return { error: true, message: "Invalid parameters" };
    }

    const vertexResult = await dbConn.session.run(query, params);

    const vertexes = vertexResult.records[0].map((v) => {
      const vertex = v.get("v");
      return {
        id: vertex.identity!,
        L : vertex.labels!,
        P: vertex.properties!
      }
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
