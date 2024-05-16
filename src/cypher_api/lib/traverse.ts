import { IdAttr, Node } from "~/cypher_api/lib/graph";
import {
  capitalizeFirstLetter,
  getValueFromVertexOrKey,
} from "~/lib/Utils";;
import { evaluate } from "~/cypher_api/lib/jsep";
import jsep from "jsep";
import { deleteRow } from "~/cypher_api/lib/record";
import { getOutEdges } from "~/cypher_api/functions/getOutEdges";
import { SetStoreFunction, Store } from "solid-js/store";
import { DBConnection } from "~/cypher_api/lib/dbs";
import { GraphInterface } from "~/lib/graph/graph";

export function getToEdge(meta: Node, vertex: Node): string {
  if (meta.P.props?.type) return getValueFromVertexOrKey(meta.P.props, "type");

  const attributeId = meta.P[IdAttr];
  return (
    capitalizeFirstLetter(vertex.L[0]) + capitalizeFirstLetter(attributeId)
  );
}

export function getSelectedVertexValueLocal(
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
  vertex: Node,
  meta: Node,
) {
  if (!vertex?.L) return [];
  const type = getToEdge(meta, vertex);
  return (vertex.OUT[type] || []).map((edgeId) => graph.edges[edgeId].E);
}

export async function getSelectedVertexValue(
  dbConn: DBConnection,
  vertex: Node,
  meta: Node,
) {
  if (!vertex?.L) return [];
  const type = getToEdge(meta, vertex);
  const vertexResult = await getOutEdges(dbConn, vertex.id, type);
  return (vertexResult.pairs || []).map((pair) => pair[1].id);
}

export function getInEdge(meta: Node, vertex: Node) {
  if (meta.P.props?.type) return getValueFromVertexOrKey(meta.P.props, "type");

  const parentLabel = getValueFromVertexOrKey(meta.P.props, "parentLabel");
  const childLabel = getValueFromVertexOrKey(meta.P.props, "childLabel");
  if (!parentLabel) return "";
  return (
    capitalizeFirstLetter(parentLabel) +
    capitalizeFirstLetter(childLabel || vertex.L[0])
  );
}

export function getParentVertexValueLocal(
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
  vertex: Node,
  meta: Node,
): number[] {
  const type = getInEdge(meta, vertex);
  if (!type) {
    return [];
  }
  return (vertex.IN[type] || []).map((edgeId) => graph.edges[edgeId].S);
}

export async function getParentVertexValue(
  dbConn: DBConnection,
  vertex: Node,
  meta: Node,
): Promise<number[]> {
  const type = getInEdge(meta, vertex);
  if (!type) {
    return [];
  }
  const vertexResult = await getOutEdges(dbConn, vertex.id, type, {
    isInward: true,
  });
  return (vertexResult.pairs || []).map((pair) => pair[1].id);
}

export function getParentVertexLocal(
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
  path: string[],
  currentVertex: Node,
): { error: boolean; vertex?: Node } {
  const type = path[path.length - 1].replace("$0", currentVertex.L[0]);
  const edges = currentVertex.IN[type];
  if (!edges || (edges && edges.length != 1)) {
    return {
      error: true,
    };
  } else {
    const edge = graph.edges[edges[0]];
    if (edge) {
      const newVertex = graph.vertexes[edge.S];
      if (newVertex) {
        if (path.length > 1) {
          return getParentVertexLocal(
            graph,
            setGraph,
            path.slice(0, -1),
            newVertex,
          );
        } else {
          return {
            error: false,
            vertex: newVertex,
          };
        }
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

export async function getParentVertex(
  dbConn: DBConnection,
  path: string[],
  currentVertex: Node,
): Promise<{ error: boolean; vertex?: Node }> {
  const type = path[path.length - 1].replace("$0", currentVertex.L[0]);
  const pairsResult = await getOutEdges(dbConn, currentVertex.id, type, {
    isInward: true,
  });

  if (
    pairsResult.error ||
    (pairsResult.pairs && pairsResult.pairs.length != 1)
  ) {
    return {
      error: true,
    };
  } else {
    const newVertex = pairsResult.pairs![0][1];
    if (newVertex) {
      if (path.length > 1) {
        return getParentVertex(dbConn, path.slice(0, -1), newVertex);
      } else {
        return {
          error: false,
          vertex: newVertex,
        };
      }
    } else {
      return {
        error: true,
      };
    }
  }
}

export function getParentVertexesLocal(
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
  path: string[],
  currentVertexes: Node[],
): { error: boolean; vertexes?: Node[] } {
  const stepVertexes = new Map<number, Node>();
  if (path.length == 0) {
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
    return getParentVertexesLocal(
      graph,
      setGraph,
      path.slice(0, -1),
      Array.from(stepVertexes.values()),
    );
  } else {
    return {
      error: false,
      vertexes: Array.from(stepVertexes.values()),
    };
  }
}

export async function getParentVertexes(
  dbConn: DBConnection,
  path: string[],
  currentVertexes: Node[],
): Promise<{ error: boolean; vertexes?: Node[] }> {
  const stepVertexes = new Map<number, Node>();
  if (path.length == 0) {
    return { error: true };
  }
  let type = path[path.length - 1];
  for (const currentVertex of currentVertexes) {
    if (type.includes("$0")) {
      if (!currentVertex.L) continue;
      type = type.replace("$0", currentVertex.L[0]);
    }

    const pairsResult = await getOutEdges(dbConn, currentVertex.id, type, {
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
    return getParentVertexes(
      dbConn,
      path.slice(0, -1),
      Array.from(stepVertexes.values()),
    );
  } else {
    return {
      error: false,
      vertexes: Array.from(stepVertexes.values()),
    };
  }
}

export function getChildVertexLocal(
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
  path: string[],
  currentVertex: Node,
): { error: boolean; vertex?: Node } {
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
  let vertexes = (currentVertex.OUT[type] || []).map(
    (edgeId) => graph.vertexes[graph.edges[edgeId].E],
  );

  if (filter) {
    // TODO:
    // vertexes = vertexes.filter(x=>x.P[IdAttr] === 'component')
  }
  if (vertexes.length != 1) {
    return {
      error: true,
    };
  } else {
    const newVertex = vertexes[0];
    if (newVertex) {
      if (path.length > 1) {
        return getChildVertexLocal(graph, setGraph, path.slice(1), newVertex);
      } else {
        return {
          error: false,
          vertex: newVertex,
        };
      }
    } else {
      return {
        error: true,
      };
    }
  }
}

export async function getChildVertex(
  dbConn: DBConnection,
  path: string[],
  currentVertex: Node,
): Promise<{ error: boolean; vertex?: Node }> {
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
  const vertexesRes = await getOutEdges(dbConn, currentVertex.id, type);
  if (vertexesRes.error) return vertexesRes;

  const vertexes = vertexesRes.pairs!;

  if (filter) {
    // TODO:
    // vertexes = vertexes.filter(x=>x.P[IdAttr] === 'component')
  }
  if (vertexes.length != 1) {
    return {
      error: true,
    };
  } else {
    const newVertex = vertexes[0][1];
    if (newVertex) {
      if (path.length > 1) {
        return getChildVertex(dbConn, path.slice(1), newVertex);
      } else {
        return {
          error: false,
          vertex: newVertex,
        };
      }
    } else {
      return {
        error: true,
      };
    }
  }
}

export function getChildVertexesLocal(
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
  path: string[],
  currentVertexes: Node[],
  strict?: boolean,
): { error: boolean; vertexes?: Node[] } {
  const stepVertexes = new Map<number, Node>();
  if (path.length == 0) {
    return { error: true };
  }
  let type = path[0];
  for (const currentVertex of currentVertexes) {
    if (type.includes("$0")) {
      if (!currentVertex.L) continue;
      type = type.replace("$0", currentVertex.L[0]);
    }
    const edgeIds = currentVertex.OUT?.[type] || [];
    if (edgeIds.length == 0) {
      // we only return error if its in middle of path
      if (strict && path.length > 1) {
        return {
          error: true,
        };
      } else {
        continue;
      }
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
    return getChildVertexesLocal(
      graph,
      setGraph,
      path.slice(1),
      Array.from(stepVertexes.values()),
      strict,
    );
  } else {
    return {
      error: false,
      vertexes: Array.from(stepVertexes.values()),
    };
  }
}

export async function getChildVertexes(
  dbConn: DBConnection,
  path: string[],
  currentVertexes: Node[],
  strict?: boolean,
): Promise<{ error: boolean; vertexes?: Node[] }> {
  const stepVertexes = new Map<number, Node>();
  if (path.length == 0) {
    return { error: true };
  }
  let type = path[0];
  for (const currentVertex of currentVertexes) {
    if (type.includes("$0")) {
      if (!currentVertex.L) continue;
      type = type.replace("$0", currentVertex.L[0]);
    }
    const outEdgesResult = await getOutEdges(dbConn, currentVertex.id, type);
    if (outEdgesResult.error) return outEdgesResult;
    const outVertexes = outEdgesResult.pairs!;

    if (outVertexes.length == 0) {
      // we only return error if its in middle of path
      if (strict && path.length > 1) {
        return {
          error: true,
        };
      } else {
        continue;
      }
    }

    for (const newVertex of outVertexes) {
      stepVertexes.set(newVertex[1].id, newVertex[1]);
    }
  }

  if (path.length > 1) {
    return getChildVertexes(
      dbConn,
      path.slice(1),
      Array.from(stepVertexes.values()),
      strict,
    );
  } else {
    return {
      error: false,
      vertexes: Array.from(stepVertexes.values()),
    };
  }
}

export const calculateFilter = (input: string) => {
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
};

export function replaceExpressionToLabel(collection: string, vertex: Node) {
  if (!collection) return "";
  // example: `{->$0Coll::'P.${IdAttr}'}` will get a collection from expression
  if (collection.includes("{{") && collection.includes("}}")) {
    collection = collection.replace(
      /{{.*}}/,
      getSelectionOptions([vertex], collection.match(/{{(.*)}}/)![1]! || "")
        .vertexes || "",
    );
  }
  return collection;
}

/*
export function getSelectionOptions(
  vertex: Vertex,
  collection: string,
  strict?: boolean,
): { error: boolean; vertexes?: Vertex[] } {
  if (collection.includes("||")) {
    for (const coll of collection.split("||")) {
      const value = getSelectOptionsInternal([vertex], convertToTraverseArray(coll), true);
      if (value) {
        return {error: false, vertexes: value};
      }
    }
    return { error: true };
  }
  collection = replaceExpressionToLabel(collection, vertex);
  const value = getSelectOptionsInternal([vertex], convertToTraverseArray(collection), strict);
  if (value) {
    return {error: false, vertexes: value};
  } else {
    return {error: true};
  }
}*/
// TODO:
//  if possible, use Name Keys, if not found use "name"
//  key else Primary Keys will be used.
// TODO:
export function getSelectionOptions(
  vertex: Node[],
  collection: string,
  strict?: boolean,
): { error: boolean; vertexes?: any } {
  collection = replaceExpressionToLabel(collection, vertex[0]);
  try {
    const value = evaluate(jsep(collection), { vertexes: vertex });
    if (value) {
      return { error: false, vertexes: value };
    } else {
      return { error: true };
    }
  } catch (e) {
    console.error(e, vertex, collection);
    return { error: true };
  }
}

// TODO:
export const getTreeData = (
  treeLevels: { [key: string]: any },
  vertexes: Node[] = [],
  options?: {
    nameExpr?: (child: Node) => string;
    addChild?: (child: Node) => boolean;
  },
) => {
  const getChildren = (levels: { [key: string]: any }, vertexes: Node[]) => {
    const result: {}[] = [];
    if (!levels.collection) return result;

    const children = evaluate(jsep(levels.collection), { vertexes: vertexes });
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
        navItem.children = getChildren(levels.child, [child]);
      }

      result.push(navItem);
    }
    return result;
  };

  return getChildren(treeLevels, vertexes);
};
export const deleteNestedLayout = (
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
  txnId: number,
  vertexes: Node[] = [],
  options?: {
    nameExpr?: (child: Node) => string;
    addChild?: (child: Node) => boolean;
  },
) => {
  const deleteChildren = (vertexes: Node[]) => {
    const children = getChildVertexesLocal(graph, setGraph, ["Attr"], vertexes);
    for (const child of children.vertexes || []) {
      // delete children
      deleteChildren([child]);

      // delete properties:
      const AttrProps = getChildVertexesLocal(
        graph,
        setGraph,
        ["AttrProp"],
        vertexes,
      );
      if (!AttrProps.error) {
        for (const vertex of AttrProps.vertexes!) {
          // delete in edges and out edges of properties
          deleteRow(vertex, false, txnId, {} as any);
          // no commitTxn because, it's not realtime
        }
      }

      // delete in edges and out edges and attr
      deleteRow(child, false, txnId, {} as any);
    }
  };

  deleteChildren(vertexes);
  for (const child of vertexes) {
    deleteRow(child, false, txnId, {} as any);
  }
};

export const getTextValue = (value: any) => {
  if (typeof value === "boolean") {
    return value ? "true" : "false";
  } else if (typeof value === "object") {
    return JSON.stringify(value);
  }
  return value;
};
