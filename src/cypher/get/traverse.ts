import {getOutEdges} from "~/cypher/get/getOutEdges";
import type {Id, Vertex} from "~/lib/graph/graph";
import type {TransactionPromise} from "neo4j-driver-core";
import {getSelectionOptionsBase} from "~/cypher/get/getSelectionOptionsBase";


export async function getChildVertexMGCall(
  path: string[],
  currentVertex: Vertex,
): Promise<{ error: boolean; vertex?: Vertex }> {
  if (path.length === 0)
    return {
      error: true,
    };

  let type = path[0];
  let filter = "";

  const filterIndex = type.indexOf("[");
  if (filterIndex > -1) {
    filter = type.slice(filterIndex);
    // modify the variable itself
    type = type.slice(0, filterIndex);
  }
  if (type.includes("$0")) {
    if (!currentVertex.L)
      return {
        error: true,
      };
    type = type.replace("$0", currentVertex.L[0]);
  }
  // let vertexes = (currentVertex.OUT[type] || []).map((edgeId) => graph.vertexes[graph.edges[edgeId].E]);
  const vertexesRes = await getOutEdges(currentVertex.id, type);
  if (vertexesRes.error) return vertexesRes;

  const vertexes = vertexesRes.pairs!;

  if (filter) {
    // TODO:
    // vertexes = vertexes.filter(x=>x.P[IdAttr] === 'component')
  }
  if (vertexes.length !== 1) {
    return {
      error: true,
    };
  }
  const newVertex = vertexes[0][1];
  if (newVertex) {
    if (path.length > 1) {
      return getChildVertexMGCall(path.slice(1), newVertex);
    }
    return {
      error: false,
      vertex: newVertex,
    };
  }
  return {
    error: true,
  };
}

export async function getParentVertexMGCall(
  path: string[],
  currentVertex: Vertex,
): Promise<{ error: boolean; vertex?: Vertex }> {
  const type = path[path.length - 1].replace("$0", currentVertex.L[0]);
  const pairsResult = await getOutEdges(currentVertex.id, type, {
    isInward: true,
  });

  if (
    pairsResult.error ||
    (pairsResult.pairs && pairsResult.pairs.length !== 1)
  ) {
    return {
      error: true,
    };
  }
  const newVertex = pairsResult.pairs?.[0][1];
  if (newVertex) {
    if (path.length > 1) {
      return getParentVertexMGCall(path.slice(0, -1), newVertex);
    }
    return {
      error: false,
      vertex: newVertex,
    };
  }
  return {
    error: true,
  };
}

export async function getChildVertexesMGCall(
  path: string[],
  currentVertexes: Vertex[],
  strict?: boolean,
): Promise<{ error: boolean; vertexes?: Vertex[] }> {
  const stepVertexes = new Map<Id, Vertex>();
  if (path.length === 0) {
    return { error: true };
  }
  let type = path[0];
  for (const currentVertex of currentVertexes) {
    if (type.includes("$0")) {
      if (!currentVertex.L) continue;
      type = type.replace("$0", currentVertex.L[0]);
    }
    const outEdgesResult = await getOutEdges(currentVertex.id, type);
    if (outEdgesResult.error) return outEdgesResult;
    const outVertexes = outEdgesResult.pairs!;

    if (outVertexes.length === 0) {
      // we only return error if its in middle of path
      if (strict && path.length > 1) {
        return {
          error: true,
        };
      }
      continue;
    }

    for (const newVertex of outVertexes) {
      stepVertexes.set(newVertex[1].id, newVertex[1]);
    }
  }

  if (path.length > 1) {
    return getChildVertexesMGCall(
      path.slice(1),
      Array.from(stepVertexes.values()),
      strict,
    );
  }
  return {
    error: false,
    vertexes: Array.from(stepVertexes.values()),
  };
}

export async function replaceExpressionToLabel(
  collection: string,
  vertex: Vertex,
  tx: TransactionPromise
) {
  if (!collection) return "";
  // example: `{->$0Coll::'P.${IdAttr}'}` will get a collection from expression
  if (collection.includes("{{") && collection.includes("}}")) {
    collection = collection.replace(
      /{{.*}}/,
      (
        await getSelectionOptionsBase(
          [vertex],
          collection.match(/{{(.*)}}/)?.[1]! || "",
          tx
        )
      ).result || "",
    );
  }
  return collection;
}

