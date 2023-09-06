import { graph, IdAttr, Vertex } from "./graph";
import { capitalizeFirstLetter, getValueFromVertexOrKey } from "../utils/utils";
import { path } from "rambda";
import { findVertexIdsByLabel } from "./Vertex";
import { Item as dxTreeViewItem } from "devextreme/ui/tree_view";
import {evaluate} from "./jsep";
import jsep from "jsep";


export function getToEdge(meta: Vertex, vertex: Vertex): string {
  if (meta.P.props?.type) return getValueFromVertexOrKey(meta.P.props, "type");

  const attributeId = meta.P[IdAttr];
  return capitalizeFirstLetter(vertex.L[0]) + capitalizeFirstLetter(attributeId);
}

export function getSelectedVertexValue(vertex: Vertex, meta: Vertex) {
  if (!vertex?.L) return [];
  const type = getToEdge(meta, vertex);
  return (vertex.OUT[type] || []).map((edgeId) => graph.edges[edgeId].E);
}

export function getInEdge(meta: Vertex, vertex: Vertex) {
  if (meta.P.props?.type) return getValueFromVertexOrKey(meta.P.props, "type");

  const parentLabel = getValueFromVertexOrKey(meta.P.props, "parentLabel");
  const childLabel = getValueFromVertexOrKey(meta.P.props, "childLabel");
  if (!parentLabel) return "";
  return capitalizeFirstLetter(parentLabel) + capitalizeFirstLetter((childLabel || vertex.L[0]));
}

export function getParentVertexValue(vertex: Vertex, meta: Vertex): number[] {
  const type = getInEdge(meta, vertex);
  if (!type) {
    return [];
  }
  return (vertex.IN[type] || []).map((edgeId) => graph.edges[edgeId].S);
}

export function getParentVertex(path: string[], currentVertex: Vertex): { error: boolean; vertex?: Vertex } {
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
          return getParentVertex(path.slice(0, -1), newVertex);
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

export function getParentVertexes(path: string[], currentVertexes: Vertex[]): { error: boolean; vertexes?: Vertex[] } {
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
    return getParentVertexes(path.slice(0, -1), Array.from(stepVertexes.values()));
  } else {
    return {
      error: false,
      vertexes: Array.from(stepVertexes.values()),
    };
  }
}

export function getChildVertex(path: string[], currentVertex: Vertex): { error: boolean; vertex?: Vertex } {
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
    if (!currentVertex.L) return {
      error: true,
    };
    type = type.replace("$0", currentVertex.L[0]);
  }
  let vertexes = (currentVertex.OUT[type] || []).map((edgeId) => graph.vertexes[graph.edges[edgeId].E]);

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
        return getChildVertex(path.slice(1), newVertex);
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

export function getChildVertexes(
  path: string[],
  currentVertexes: Vertex[],
  strict?: boolean,
): { error: boolean; vertexes?: Vertex[] } {
  const stepVertexes = new Map<number, Vertex>();
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
    return getChildVertexes(path.slice(1), Array.from(stepVertexes.values()), strict);
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
      isMultiple = false
      filter = input.slice(filterIndex + 1).replace(")", "");
      type = input.slice(0, filterIndex);
    } else {
      type = input;
    }
  }
  return [type, filter, isMultiple] as const
}

export function replaceExpressionToLabel(collection: string, vertex: Vertex) {
  if (!collection) return "";
  // example: `{->$0Coll::'P.${IdAttr}'}` will get a collection from expression
  if (collection.includes("{{") && collection.includes("}}")) {
    collection = collection.replace(/{{.*}}/, getSelectionOptions([vertex], collection.match(/{{(.*)}}/)![1]! || "").vertexes || "");
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
export function getSelectionOptions(
  vertex: Vertex[],
  collection: string,
  strict?: boolean,
): { error: boolean; vertexes?: any } {
  collection = replaceExpressionToLabel(collection, vertex[0]);
  try{
    const value = evaluate(jsep(collection), {vertexes: vertex});
    if (value) {
      return {error: false, vertexes: value};
    } else {
      return {error: true};
    }
  } catch (e) {
    console.error(e)
    return {error: true};
  }
}

export const getTreeData = (treeLevels: {[key: string]: any}, vertexes: Vertex[] = [], options?: {nameExpr?: (child: Vertex) => string; addChild?: (child: Vertex) => boolean}) => {
  const getChildren = (levels: {[key: string]: any}, vertexes: Vertex[]) => {
    const result = [] as dxTreeViewItem[];
    if (!levels.collection) return result;

    const children = evaluate(jsep(levels.collection), {vertexes: vertexes});
    for (const child of (children || []).sort((a, b) => a.P.pos - b.P.pos)) {
      const name = levels?.nameExpr?.(child) || options?.nameExpr?.(child) || child.P.name;
      const navItem = {} as dxTreeViewItem;
      navItem.name = name;
      navItem.expanded = true;
      navItem.id = child.id;
      navItem.P = child.P;
      if (levels.child && ((levels?.addChild?.(child) || options?.addChild?.(child)) ?? true)) {
        navItem.children = getChildren(levels.child, [child]);
      }

      result.push(navItem);
    }
    return result;
  };

  return getChildren(treeLevels, vertexes);

}

export const getTextValue = (value: any) => {
  if (typeof value === "boolean") {
    return value ? "true" : "false";
  } else if (typeof value === "object") {
    return JSON.stringify(value);
  }
  return value;
};
