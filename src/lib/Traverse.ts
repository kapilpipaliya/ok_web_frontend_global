import { graph, Vertex } from "./graph";
import { capitalizeFirstLetter } from "../utils/utils";
import { path } from "rambda";
import { findVertexIdsByLabel } from "./Vertex";

export function getToEdge(meta: Vertex, vertex: Vertex) {
 const attributeId = meta.properties.id;
 return vertex.labels[0] + capitalizeFirstLetter(attributeId);
}

export function getSelectedVertexValue(vertex: Vertex, meta: Vertex) {
 const type = getToEdge(meta, vertex);
 return (vertex.out_edges[type] || []).map((edgeId) => graph.edges[edgeId].end);
}

export function getInEdge(meta: Vertex, vertex) {
 const parentLabel = meta.properties.props?.parentLabel;
 const childLabel = meta.properties.props?.childLabel;
 if (!parentLabel) return '';
 return parentLabel + (childLabel || vertex.labels[0]);
}

export function getParentVertexValue(vertex: Vertex, meta: Vertex) {
 const type = getInEdge(meta, vertex);
 if (!type) {
  return [];
 }
 return (vertex.in_edges[type] || []).map((edgeId) => graph.edges[edgeId].start);
}

export function getParentVertex(path: string[], currentVertex: Vertex): { error: boolean; vertex?: Vertex } {
 const type = path[path.length - 1].replace("$0", currentVertex.labels[0]);
 const edges = currentVertex.in_edges[type];
 if (!edges || (edges && edges.length != 1)) {
  return {
   error: true
  };
 } else {
  const edge = graph.edges[edges[0]];
  if (edge) {
   const newVertex = graph.vertexes[edge.start];
   if (newVertex) {
    if (path.length > 1) {
     return getParentVertex(path.slice(0, -1), newVertex);
    } else {
     return {
      error: false,
      vertex: newVertex
     };
    }
   } else {
    return {
     error: true
    };
   }
  } else {
   return {
    error: true
   };
  }
 }
}

export function getParentVertexes(path: string[], currentVertexes: Vertex[]): { error: boolean; vertexes?: Vertex[] } {
 const stepVertexes = {} as { [id: string]: Vertex };
 if (path.length == 0) {
  return { error: true };
 }
 let type = path[path.length - 1];
 for (const currentVertex of currentVertexes) {
  type = type.replace("$0", currentVertex.labels[0]);
  const edgeIds = currentVertex.in_edges[type];
  if (!edgeIds) {
   continue;
  }

  for (const edgeId of edgeIds) {
   const edge = graph.edges[edgeId];
   if (edge) {
    const newVertex = graph.vertexes[edge.start];
    if (newVertex) {
     stepVertexes[newVertex.id] = newVertex;
    } else {
     return {
      error: true
     };
    }
   } else {
    return {
     error: true
    };
   }
  }
 }

 if (path.length > 1) {
  return getParentVertexes(path.slice(0, -1), Object.values(stepVertexes));
 } else {
  return {
   error: false,
   vertexes: Object.values(stepVertexes)
  };
 }
}

export function getChildVertex(path: string[], currentVertex: Vertex): { error: boolean; vertex?: Vertex } {
 if (path.length === 0)
  return {
   error: true
  };

 let type = path[0];
 let filter = "";

 const filterIndex = type.indexOf("[");
 if (filterIndex > -1) {
  filter = type.slice(filterIndex);
  // modify the variable itself
  type = type.slice(0, filterIndex);
 }
 type = type.replace("$0", currentVertex.labels[0]);
 let vertexes = (currentVertex.out_edges[type] || []).map((edgeId) => graph.vertexes[graph.edges[edgeId].end]);

 if (filter) {
  // TODO:
  // vertexes = vertexes.filter(x=>x.properties.id === 'component')
 }
 if (vertexes.length != 1) {
  return {
   error: true
  };
 } else {
  const newVertex = vertexes[0];
  if (newVertex) {
   if (path.length > 1) {
    return getChildVertex(path.slice(1), newVertex);
   } else {
    return {
     error: false,
     vertex: newVertex
    };
   }
  } else {
   return {
    error: true
   };
  }
 }
}

export function getChildVertexes(
 path: string[],
 currentVertexes: Vertex[],
 strict?: boolean
): { error: boolean; vertexes?: Vertex[] } {
 const stepVertexes = {} as { [id: string]: Vertex };
 if (path.length == 0) {
  return { error: true };
 }
 let type = path[0];
 for (const currentVertex of currentVertexes) {
  type = type.replace("$0", currentVertex.labels[0]);
  const edgeIds = currentVertex.out_edges[type] || [];
  if (edgeIds.length == 0) {
   // we only return error if its in middle of path
   if (strict && path.length > 1) {
    return {
     error: true
    };
   } else {
    continue;
   }
  }

  for (const edgeId of edgeIds) {
   const edge = graph.edges[edgeId];
   if (edge) {
    const newVertex = graph.vertexes[edge.end];
    if (newVertex) {
     stepVertexes[newVertex.id] = newVertex;
    } else {
     return {
      error: true
     };
    }
   } else {
    return {
     error: true
    };
   }
  }
 }

 if (path.length > 1) {
  return getChildVertexes(path.slice(1), Object.values(stepVertexes), strict);
 } else {
  return {
   error: false,
   vertexes: Object.values(stepVertexes)
  };
 }
}

export const convertToTraverseArray = (input: string): Array<[string, string]> => {
 const pathOperators = ["*", "-", "->"];

 const isStartWithOp = pathOperators.some(operator => input.startsWith(operator));
 if (!isStartWithOp) {
  input = `*${input}`;
 }

 const result = [] as Array<[string, string]>;
 for (let i = 0; i < input.length; i++) {
  if (i + 1 < input.length && pathOperators.includes(input[i] + input[i + 1])) {
   result.push([input[i] + input[i + 1], ""]);
   i++;
  } else if (pathOperators.includes(input[i])) {
   result.push([input[i], ""]);
  } else {
   result[result.length - 1][1] += input[i];
  }
 }
 return result;
};
export const getSelectOptionsInternal = (
 vertexes: Vertex[],
 collection: Array<[string, string]>,
 strict?: boolean
): { error: boolean; vertexes?: Vertex[] } => {

 if (collection.length == 0) {
  return { error: true };
 }

 for (const [direction, edgeType] of collection) {
  if (direction === "-") {
   const stepVertexes = {} as { [id: string]: Vertex };

   for (const currentVertex of vertexes) {
    const type = edgeType.replace("$0", currentVertex.labels[0]);
    const edgeIds = currentVertex.in_edges[type];
    if (!edgeIds) {
     continue;
    }

    for (const edgeId of edgeIds) {
     const edge = graph.edges[edgeId];
     if (edge) {
      const newVertex = graph.vertexes[edge.start];
      if (newVertex) {
       stepVertexes[newVertex.id] = newVertex;
      } else {
       return {
        error: true
       };
      }
     } else {
      return {
       error: true
      };
     }
    }
   }
   vertexes = Object.values(stepVertexes);
  } else if (direction === "->") {
   const stepVertexes = {} as { [id: string]: Vertex };

   for (const currentVertex of vertexes) {
    const type = edgeType.replace("$0", currentVertex.labels[0]);
    const edgeIds = currentVertex.out_edges[type] || [];
    if (edgeIds.length == 0) {
     // we only return error if its in middle of path
     if (strict && path.length > 1) {
      return {
       error: true
      };
     } else {
      continue;
     }
    }

    for (const edgeId of edgeIds) {
     const edge = graph.edges[edgeId];
     if (edge) {
      const newVertex = graph.vertexes[edge.end];
      if (newVertex) {
       stepVertexes[newVertex.id] = newVertex;
      } else {
       return {
        error: true
       };
      }
     } else {
      return {
       error: true
      };
     }
    }
   }
   vertexes = Object.values(stepVertexes);

  } else if (direction === "*") {
   const filterIndex = edgeType.indexOf("[");
   let filter = "";
   if (filterIndex > 0) {
    filter = edgeType.slice(filterIndex + 1).replace("]", "");
    vertexes = findVertexIdsByLabel(edgeType.slice(0, filterIndex))
     .map((id) => graph.vertexes[id])
     .filter((vertex) => vertex.properties.id === filter);
   } else if (filterIndex === 0) {
    // JSON.parse options:
    try {
     return {
      error: true,
      vertexes: JSON.parse(edgeType)
     };
    } catch (e) {
     console.warn(e);
     return {
      error: true
     };
    }
   } else {
    vertexes = findVertexIdsByLabel(edgeType).map((id) => graph.vertexes[id]);
   }
  } else {
   return { error: true };
  }
 }
 return { error: false, vertexes };
};

export function getSelectionOptions(
 vertex: Vertex,
 collection: string,
 strict?: boolean
): { error: boolean; vertexes?: Vertex[] } {
 if (collection.includes("||")) {
  for (const coll of collection.split("||")) {
   const value = getSelectOptionsInternal([vertex], convertToTraverseArray(coll), true);
   if (!value.error) {
    return value;
   }
  }
  return { error: true };
 }
 return getSelectOptionsInternal([vertex], convertToTraverseArray(collection), strict);
}

const getTextValue = (value: any) => {
 if (typeof value === "boolean") {
  return value ? "true" : "false";
 } else if (typeof value === "object") {
  return JSON.stringify(value);
 }
 return value;
};

export function getOptionLabel(vertex: Vertex, displayExpr: string): string {
 if (!vertex) return "";
 if (displayExpr.includes("||")) {
  for (const displayExprElement of displayExpr.split("||")) {
   const value = getOptionLabel(vertex, displayExprElement);
   if (value !== undefined && value !== null && value !== "") {
    return value;
   }
  }
 }

 let pattern = "";
 let projection = "";
 if (displayExpr.includes(":")) {
  const columnIndex = displayExpr.lastIndexOf(":");
  pattern = displayExpr.slice(0, columnIndex);
  projection = displayExpr.slice(columnIndex + 1);
 } else {
  pattern = displayExpr;
  projection = "id";
 }
 if (!pattern) {
  return getTextValue(path(projection, vertex)!);
 } else if (pattern.includes("-") || pattern.includes("->")) {
  const childrenResult = getSelectionOptions(vertex, pattern, );
  if (childrenResult.error) {
   return "";
  } else {
   return getTextValue(path(projection, childrenResult.vertexes![0])!);
  }
 }
 return getTextValue(path(displayExpr, vertex)!);
}