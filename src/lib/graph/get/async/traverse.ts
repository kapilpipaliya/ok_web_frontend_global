import type { GraphInterface, Id, Vertex } from "~/lib/graph/graph";
import { evalAsync } from "~/lib/expression_eval";
import jsep from "jsep";
import {
  capitalizeFirstLetter,
  
} from "~/lib/utils";

import type { SetStoreFunction, Store } from "solid-js/store";
import { getToEdgeAsync } from "./getToEdge";
import {
 replaceExpressionToLabel
} from "~/lib/graph/get/sync/replaceExpressionToLabel";

export async function getSelectedVertexValueAsync(
  graph: Store<GraphInterface>,
  vertex: Vertex,
  meta: Vertex,
) {
  if (!vertex?.L) return [];
  const type = await getToEdgeAsync(meta, vertex);
  return (vertex.OUT[type] || []).map((edgeId) => graph.edges[edgeId].E);
}

export async function getInEdgeAsync(meta: Vertex, vertex: Vertex) {
  if (meta.P.type) return meta.P["type"];

  const parentLabel = meta.P["parentLabel"];
  const childLabel = meta.P["childLabel"];
  if (!parentLabel) return "";
  return (
    capitalizeFirstLetter(parentLabel) +
    capitalizeFirstLetter(childLabel || vertex.L[0])
  );
}

export async function getParentVertexValueAsync(
  graph: Store<GraphInterface>,
  vertex: Vertex,
  meta: Vertex,
): Promise<Id[]> {
  const type = await getInEdgeAsync(meta, vertex);
  if (!type) {
    return [];
  }
  return (vertex.IN[type] || []).map((edgeId) => graph.edges[edgeId].S);
}

export async function getParentVertexesAsync(
  graph: Store<GraphInterface>,
  path: string[],
  currentVertexes: Vertex[],
): Promise<{ error: boolean; vertexes?: Vertex[] }> {
  const stepVertexes = new Map<number, Vertex>();
  if (path.length === 0) {
    return { error: true };
  }
  let type = path[path.length - 1];
  for (const currentVertex of currentVertexes) {
    if (type.includes("$0")) {
      if (!currentVertex.L) continue;
      type = type.replace("$0", currentVertex.L[0]);
    }
    const edgeIds = currentVertex.IN[type];
    if (!edgeIds) {
      continue;
    }

    for (const edgeId of edgeIds) {
      const edge = graph.edges[edgeId];
      if (edge) {
        const newVertex = graph.vertexes[edge.S];
        if (newVertex) {
          stepVertexes.set(newVertex.id, newVertex);
        } else {
          return {
            error: true,
          };
        }
      } else {
        return {
          error: true,
        };
      }
    }
  }

  if (path.length > 1) {
    return getParentVertexesAsync(
      graph,
      path.slice(0, -1),
      Array.from(stepVertexes.values()),
    );
  }
  return {
    error: false,
    vertexes: Array.from(stepVertexes.values()),
  };
}

export async function calculateFilterAsync(input: string) {
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

export async function getTreeDataAsync(
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
  treeLevels: { [key: string]: any },
  vertexes: Vertex[] = [],
  options?: {
    nameExpr?: (child: Vertex) => string;
    addChild?: (child: Vertex) => boolean;
  },
) {
  const getChildren = async (
    levels: { [key: string]: any },
    vertexes: Vertex[],
  ) => {
    const result = [] as any[];
    if (!levels.collection) return result;
    const children = await evalAsync(jsep(levels.collection), {
      vertexes: vertexes,
      graph,
      setGraph,
    });
    for (const child of (children || []).sort(
      (a: any, b: any) => a.P.pos - b.P.pos,
    )) {
      const name =
        levels?.nameExpr?.(child) || options?.nameExpr?.(child) || child.P.name;
      const navItem = {} as any;
      navItem.name = name;
      navItem.expanded = true;
      navItem.id = child.id;
      navItem.P = child.P;
      if (
        levels.child &&
        ((levels?.addChild?.(child) || options?.addChild?.(child)) ?? true)
      ) {
        navItem.children = getChildren(levels.child, [child]);
      }

      result.push(navItem);
    }
    return result;
  };

  return getChildren(treeLevels, vertexes);
}

export async function getTextValueAsync(value: any) {
  if (typeof value === "boolean") {
    return value ? "true" : "false";
  }
  if (typeof value === "object") {
    return JSON.stringify(value);
  }
  return value;
}

export async function getSelectionOptionsAsync(
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
  vertex: Vertex[],
  collection: string,
  strict?: boolean,
): Promise<{ error: boolean; vertexes?: any }> {
  collection = replaceExpressionToLabel(graph, setGraph, collection, vertex[0]);
  try {
    const value = await evalAsync(jsep(collection), {
      vertexes: vertex,
      graph,
      setGraph,
    });
    if (value) {
      return { error: false, vertexes: value };
    }
    return { error: true };
  } catch (e) {
    console.error(e, vertex, collection);
    return { error: true };
  }
}

export async function getChildVertexAsync(
  graph: Store<GraphInterface>,
  path: string[],
  currentVertex: Vertex,
): Promise<{
  error: boolean;
  vertex?: Vertex;
}> {
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
  const vertexes = (currentVertex.OUT[type] || []).map(
    (edgeId) => graph.vertexes[graph.edges[edgeId].E],
  );

  if (filter) {
    // TODO:
    // vertexes = vertexes.filter(x=>x.P[IdAttr] === 'component')
  }
  if (vertexes.length !== 1) {
    return {
      error: true,
    };
  }
  const newVertex = vertexes[0];
  if (newVertex) {
    if (path.length > 1) {
      return getChildVertexAsync(graph, path.slice(1), newVertex);
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

export async function getParentVertexAsync(
  path: string[],
  currentVertex: Vertex,
  graph: Store<GraphInterface>,
): Promise<{
  error: boolean;
  vertex?: Vertex;
}> {
  const type = path[path.length - 1].replace("$0", currentVertex.L[0]);
  const edges = currentVertex.IN[type];
  if (!edges || (edges && edges.length !== 1)) {
    return {
      error: true,
    };
  }
  const edge = graph.edges[edges[0]];
  if (edge) {
    const newVertex = graph.vertexes[edge.S];
    if (newVertex) {
      if (path.length > 1) {
        return getParentVertexAsync(path.slice(0, -1), newVertex, graph);
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
  return {
    error: true,
  };
}

export async function getChildVertexesAsync(
  graph: Store<GraphInterface>,
  path: string[],
  currentVertexes: Vertex[],
  strict?: boolean,
): Promise<{ error: boolean; vertexes?: Vertex[] }> {
  const stepVertexes = new Map<number, Vertex>();
  if (path.length === 0) {
    return { error: true };
  }
  let type = path[0];
  for (const currentVertex of currentVertexes) {
    if (type.includes("$0")) {
      if (!currentVertex.L) continue;
      type = type.replace("$0", currentVertex.L[0]);
    }
    const edgeIds = currentVertex.OUT?.[type] || [];
    if (edgeIds.length === 0) {
      // we only return error if its in middle of path
      if (strict && path.length > 1) {
        return {
          error: true,
        };
      }
      continue;
    }

    for (const edgeId of edgeIds) {
      const edge = graph.edges[edgeId];
      if (edge) {
        const newVertex = graph.vertexes[edge.E];
        if (newVertex) {
          stepVertexes.set(newVertex.id, newVertex);
        } else {
          return {
            error: true,
          };
        }
      } else {
        return {
          error: true,
        };
      }
    }
  }

  if (path.length > 1) {
    return getChildVertexesAsync(
      graph,
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
