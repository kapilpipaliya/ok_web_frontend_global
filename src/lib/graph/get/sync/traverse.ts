import type { SetStoreFunction, Store } from "solid-js/store";

import jsep from "jsep";

import { evaluate } from "~/lib/expression_eval";
import {
 replaceExpressionToLabel
} from "~/lib/graph/get/sync/replaceExpressionToLabel";
import {
  type GraphInterface,
  type Id,
  IdAttr,
  type Vertex,
} from "~/lib/graph/graph";
import {
  capitalizeFirstLetter,
  
} from "~/lib/utils";

export function getToEdge(meta: Vertex, vertex: Vertex): string {
  if (meta.P.type) return meta.P.type;

  const attributeId = meta.P[IdAttr];
  return (
    capitalizeFirstLetter(vertex.L[0]) + capitalizeFirstLetter(attributeId)
  );
}

export function getSelectedVertexValue(
  graph: Store<GraphInterface>,
  vertex: Vertex,
  meta: Vertex,
) {
  if (!vertex?.L) return [];
  const type = getToEdge(meta, vertex);
  return (vertex.OUT[type] || []).map((edgeId) => graph.edges[edgeId].E);
}

export function getInEdge(meta: Vertex, vertex: Vertex) {
  if (meta.P.type) return meta.P.type;

  const parentLabel = meta.P.parentLabel;
  const childLabel = meta.P.childLabel;
  if (!parentLabel) return "";
  return (
    capitalizeFirstLetter(parentLabel) +
    capitalizeFirstLetter(childLabel || vertex.L[0])
  );
}

export function getParentVertexValue(
  graph: Store<GraphInterface>,
  vertex: Vertex,
  meta: Vertex,
): Id[] {
  const type = getInEdge(meta, vertex);
  if (!type) {
    return [];
  }
  return (vertex.IN[type] || []).map((edgeId) => graph.edges[edgeId].S);
}

export function getParentVertexes(
  graph: Store<GraphInterface>,
  path: string[],
  currentVertexes: Vertex[],
): { error: boolean; vertexes?: Vertex[] } {
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
    return getParentVertexes(
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

export function calculateFilter(input: string) {
  let type = ""; // baseString
  let filter = "";
  let skip = 0;
  let limit = 0;
  let isMultiple = true;

  const parseSkipLimit = (filter: string) => {
    let skip = 0;
    let limit = 0;
    const skipMatch = filter.match(/skip\s*=\s*(\d+)/i);
    const limitMatch = filter.match(/limit\s*=\s*(\d+)/i);
    if (skipMatch) {
      skip = Number.parseInt(skipMatch[1], 10);
    }
    if (limitMatch) {
      limit = Number.parseInt(limitMatch[1], 10);
    }
    return { limit, skip };
  };

  const parseFilter = (input: string, startChar: string, endChar: string) => {
    const filterStart = input.indexOf(startChar);
    if (filterStart > 0) {
      type = input.slice(0, filterStart);
      const filterEnd = input.indexOf(endChar, filterStart);
      if (filterEnd > filterStart) {
        filter = input.slice(filterStart + 1, filterEnd);
        const { limit: l, skip: s } = parseSkipLimit(filter);
        skip = s;
        limit = l;
        filter = filter
          .replace(/skip\s*=\s*\d+/i, "")
          .replace(/limit\s*=\s*\d+/i, "")
          .trim();
      }
    }
  };

  if (input.includes("[")) {
    parseFilter(input, "[", "]");
  } else if (input.includes("(")) {
    isMultiple = false;
    parseFilter(input, "(", ")");
  } else {
    type = input;
  }

  return { filter, isMultiple, limit, skip, type };
}
export interface NavItem {
  P: any;
  children?: NavItem[];
  expanded: boolean;
  id: string;
  name: string;
}

export function getTreeData(
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
  treeLevels: { [key: string]: any },
  vertexes: Vertex[] = [],
  options?: {
    addChild?: (child: Vertex) => boolean;
    nameExpr?: (child: Vertex) => string;
  },
): NavItem[] {
  const getChildren = (levels: { [key: string]: any }, vertexes: Vertex[]): NavItem[] => {
    const result: NavItem[] = [];
    if (!levels.collection) return result;
    const children = evaluate(jsep(levels.collection), {
      graph,
      setGraph,
      vertexes: vertexes,
    });
    for (const child of (children || []).sort(
      (a: any, b: any) => a.P.pos - b.P.pos,
    )) {
      const name =
        levels?.nameExpr?.(child) || options?.nameExpr?.(child) || child.P.name;
      const navItem: NavItem = {
        P: child.P,
        expanded: true,
        id: child.id,
        name: name,
      };
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

export function getTextValue(value: any) {
  if (typeof value === "boolean") {
    return value ? "true" : "false";
  }
  if (typeof value === "object") {
    return JSON.stringify(value);
  }
  return value;
}
export function getSelectionOptions(
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
  collection: string,
  vertexes: Vertex[],
  strict?: boolean,
): { error: boolean; vertexes?: any } {
  collection = replaceExpressionToLabel(graph, setGraph, collection, vertexes[0]);
  try {
    const value = evaluate(jsep(collection), {
      graph,
      setGraph,
      vertexes: vertexes,
    });
    if (value) {
      return { error: false, vertexes: value };
    }
    return { error: true };
  } catch (e) {
    console.error(e, vertexes, collection);
    return { error: true };
  }
}

export function getChildVertex(
  graph: Store<GraphInterface>,
  path: string[],
  currentVertex: Vertex,
): {
  error: boolean;
  vertex?: Vertex;
} {
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
      return getChildVertex(graph, path.slice(1), newVertex);
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

export function getParentVertex(
  path: string[],
  currentVertex: Vertex,
  graph: Store<GraphInterface>,
): {
  error: boolean;
  vertex?: Vertex;
} {
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
        return getParentVertex(path.slice(0, -1), newVertex, graph);
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
