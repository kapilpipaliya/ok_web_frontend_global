import { evalAsync } from "~/lib/expression_eval";
import jsep from "jsep";
import { getOutEdges } from "~/cypher_api/functions/get/getOutEdges";
import { getInEdge, getToEdge } from "~/lib/graph/get/sync/traverse";
import type { Edge, Id, Vertex } from "~/lib/graph/graph";

export async function getSelectedVertexValueMGCall(
  vertex: Vertex,
  meta: Vertex,
) {
  if (!vertex?.L) return [];
  const type = getToEdge(meta, vertex);
  const vertexResult = await getOutEdges(vertex.id, type);
  return (vertexResult.pairs || []).map((pair) => pair[1].id);
}

export async function getParentVertexValueMGCall(
  vertex: Vertex,
  meta: Vertex,
): Promise<Id[]> {
  const type = getInEdge(meta, vertex);
  if (!type) {
    return [];
  }
  const vertexResult = await getOutEdges(vertex.id, type, {
    isInward: true,
  });
  return (vertexResult.pairs || []).map((pair) => pair[1].id);
}

export async function getParentVertexesMGCall(
  path: string[],
  currentVertexes: Vertex[],
): Promise<{ error: boolean; vertexes?: Vertex[] }> {
  const stepVertexes = new Map<Id, Vertex>();
  if (path.length === 0) {
    return { error: true };
  }
  let type = path[path.length - 1];
  for (const currentVertex of currentVertexes) {
    if (type.includes("$0")) {
      if (!currentVertex.L) continue;
      type = type.replace("$0", currentVertex.L[0]);
    }

    const pairsResult = await getOutEdges(currentVertex.id, type, {
      isInward: true,
    });
    if (pairsResult.error) {
      continue;
    }

    for (const [edge, newVertex] of pairsResult.pairs!) {
      stepVertexes.set(newVertex.id, newVertex);
    }
  }

  if (path.length > 1) {
    return getParentVertexesMGCall(
      path.slice(0, -1),
      Array.from(stepVertexes.values()),
    );
  }
  return {
    error: false,
    vertexes: Array.from(stepVertexes.values()),
  };
}

export function calculateFilterMGCall(input: string) {
  let isMultiple = true;
  let filterIndex = input.indexOf("[");
  let filter = "";
  let type = "";
  if (filterIndex > 0) {
    isMultiple = true;
    filter = input.slice(filterIndex + 1).replace("]", "");
    type = input.slice(0, filterIndex);
  } else {
    filterIndex = input.indexOf("(");
    if (filterIndex > 0) {
      isMultiple = false;
      filter = input.slice(filterIndex + 1).replace(")", "");
      type = input.slice(0, filterIndex);
    } else {
      type = input;
    }
  }
  return [type, filter, isMultiple] as const;
}

export async function getTreeDataMGCall(
  treeLevels: { [key: string]: any },
  vertexes: Vertex[] = [],
  options?: {
    nameExpr?: (child: Vertex) => string;
    addChild?: (child: Vertex) => boolean;
  },
) {
  "use server";
  const nodes: { [key: string]: Vertex } = {};
  const relationships: { [key: string]: Edge } = {};
  const getChildren = async (
    levels: { [key: string]: any },
    vertexes: Vertex[],
  ) => {
    const result: {}[] = [];
    if (!levels.collection) return result;

    const children = await evalAsync(jsep(levels.collection), {
      vertexes: vertexes,
      nodes,
      relationships,
    });
    // @ts-ignore
    for (const child of (children || []).sort((a, b) => a.P.pos - b.P.pos)) {
      const name =
        levels?.nameExpr?.(child) || options?.nameExpr?.(child) || child.P.name;
      const navItem = {};
      // @ts-ignore
      navItem.name = name;
      // @ts-ignore
      navItem.expanded = true;
      // @ts-ignore
      navItem.id = child.id;
      // @ts-ignore
      navItem.P = child.P;
      if (
        levels.child &&
        ((levels?.addChild?.(child) || options?.addChild?.(child)) ?? true)
      ) {
        // @ts-ignore
        navItem.children = await getChildren(levels.child, [child]);
      }

      result.push(navItem);
    }
    return result;
  };

  const children = await getChildren(treeLevels, vertexes);
  return {
    children,
    graph: {
      vertexes: nodes,
      edges: relationships,
    },
  };
}

// TODO:
//  if possible, use Name Keys, if not found use "name"
//  key else Primary Keys will be used.
// TODO:
export async function getSelectionOptionsMGCall(
  vertex: Vertex[],
  collection: string,
  strict?: boolean,
): Promise<{ error: boolean; vertexes?: any; graph?: any }> {
  "use server";
  const nodes: { [key: string]: Vertex } = {};
  const relationships: { [key: string]: Edge } = {};
  collection = await replaceExpressionToLabel(collection, vertex[0]);
  try {
    const value = await evalAsync(jsep(collection), {
      vertexes: vertex,
      nodes,
      relationships,
    });

    if (value) {
      return {
        error: false,
        vertexes: value,
        graph: {
          vertexes: nodes,
          edges: relationships,
        },
      };
    }
    return { error: true };
  } catch (e) {
    console.error(e, vertex, collection);
    return { error: true };
  }
}

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
) {
  if (!collection) return "";
  // example: `{->$0Coll::'P.${IdAttr}'}` will get a collection from expression
  if (collection.includes("{{") && collection.includes("}}")) {
    collection = collection.replace(
      /{{.*}}/,
      (
        await getSelectionOptionsMGCall(
          [vertex],
          collection.match(/{{(.*)}}/)?.[1]! || "",
        )
      ).vertexes || "",
    );
  }
  return collection;
}

export interface Expression {
  expression: string;
  incoming?: Expression[];
  outgoing?: Expression[];
}

export async function getDataMGCall(
  expression: Expression,
  context = {
    nodes: {} as { [key: string]: any },
    relationships: {} as { [key: string]: any },
    vertexes: undefined as any,
  },
) {
  "use server";
  const mainResult = await evalAsync(jsep(expression.expression), context);

  if (expression.incoming && mainResult && mainResult.length > 0) {
    for (const exp of expression.incoming) {
      context.vertexes = [...mainResult];
      await getDataMGCall(exp, context);
    }
  }
  if (expression.outgoing && mainResult && mainResult.length > 0) {
    for (const exp of expression.outgoing) {
      context.vertexes = [...mainResult];
      await getDataMGCall(exp, context);
    }
  }

  return {
    graph: {
      vertexes: context.nodes,
      edges: context.relationships,
    },
  };
}
