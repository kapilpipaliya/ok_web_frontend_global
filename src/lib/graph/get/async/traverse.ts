import { GraphInterface, Id, Vertex } from "~/lib/graph/graph";
import { evaluate } from "~/lib/jsep";
import jsep from "jsep";
import {
  capitalizeFirstLetter,
  getValueFromVertexOrKey,
} from "~/lib/Utils";
import {
  deleteRow,
  getChildVertexes
} from "~/lib/graph/get/sync/graph_fns";

import { SetStoreFunction, Store } from "solid-js/store";
import { getToEdge } from "./getToEdge";

export async function getSelectedVertexValue(
  graph: Store<GraphInterface>,
  vertex: Vertex,
  meta: Vertex,
) {
  if (!vertex?.L) return [];
  const type = await getToEdge(meta, vertex);
  return (vertex.OUT[type] || []).map((edgeId) => graph.edges[edgeId].E);
}

export async function getInEdge(meta: Vertex, vertex: Vertex) {
  if (meta.P.props?.type) return getValueFromVertexOrKey(meta.P.props, "type");

  const parentLabel = getValueFromVertexOrKey(meta.P.props, "parentLabel");
  const childLabel = getValueFromVertexOrKey(meta.P.props, "childLabel");
  if (!parentLabel) return "";
  return (
    capitalizeFirstLetter(parentLabel) +
    capitalizeFirstLetter(childLabel || vertex.L[0])
  );
}

export async function getParentVertexValue(
  graph: Store<GraphInterface>,
  vertex: Vertex,
  meta: Vertex,
): Promise<Id[]> {
  const type = await getInEdge(meta, vertex);
  if (!type) {
    return [];
  }
  return (vertex.IN[type] || []).map((edgeId) => graph.edges[edgeId].S);
}

export async function getParentVertexes(
  graph: Store<GraphInterface>,
  path: string[],
  currentVertexes: Vertex[],
): Promise<{ error: boolean; vertexes?: Vertex[] }> {
  const stepVertexes = new Map<number, Vertex>();
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
    return getParentVertexes(
      graph,
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

export const calculateFilter = async (input: string) => {
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

export  const getTreeData = async(
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
  treeLevels: { [key: string]: any },
  vertexes: Vertex[] = [],
  options?: {
    nameExpr?: (child: Vertex) => string;
    addChild?: (child: Vertex) => boolean;
  },
) => {
  const getChildren = async (levels: { [key: string]: any }, vertexes: Vertex[]) => {
    const result = [] as any[];
    if (!levels.collection) return result;
    const children = evaluate(jsep(levels.collection), {
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
};

export  const deleteNestedLayout = async(
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
  txnId: number,
  vertexes: Vertex[] = [],
  options?: {
    nameExpr?: (child: Vertex) => string;
    addChild?: (child: Vertex) => boolean;
  },
) => {
  const deleteChildren = async (vertexes: Vertex[]) => {
    const children = await getChildVertexes(graph, ["Attr"], vertexes);
    for (const child of children.vertexes || []) {
      // delete children
      await deleteChildren([child]);

      // delete properties:
      const AttrProps = await getChildVertexes(graph, ["AttrProp"], vertexes);
      if (!AttrProps.error) {
        for (const vertex of AttrProps.vertexes!) {
          // delete in edges and out edges of properties
          deleteRow(vertex, false, graph, setGraph, txnId, {} as any);
          // no commitTxn because, it's not realtime
        }
      }

      // delete in edges and out edges and attr
      deleteRow(child, false, graph, setGraph, txnId, {} as any);
    }
  };

  deleteChildren(vertexes);
  for (const child of vertexes) {
    deleteRow(child, false, graph, setGraph, txnId, {} as any);
  }
};

export const getTextValue = async (value: any) => {
  if (typeof value === "boolean") {
    return value ? "true" : "false";
  } else if (typeof value === "object") {
    return JSON.stringify(value);
  }
  return value;
};
