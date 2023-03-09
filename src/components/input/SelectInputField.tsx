import { createEffect, createResource, useContext } from "solid-js";

import SelectBox, { Properties } from "devextreme/ui/select_box";
import { ComponentProps, Vertex } from "./Form";
import { commitTxn, getNewGraphId, getNewTxnId, graph } from "../../lib/graph";
import { findVertexIdsByLabel } from "../../lib/Vertex";
import { addNewEdge, deleteEdge, newEdge } from "../../lib/Edge";
import { capitalizeFirstLetter } from "../utils";
import { onChangeHandler } from "../core/dynamicForm";
import { WsContext } from "../ws_events_dispatcher";
import { path } from "rambda";

export function getSelectedVertexValue(vertex: Vertex, meta: Vertex){
  const attributeId = meta.properties.id
  const type = (meta.properties.props.label || vertex.labels[0]) + capitalizeFirstLetter(attributeId);
  return (vertex.out_edges[type] || []).map(edgeId => graph.edges[edgeId].end);
}

export function getParentVertexValue(vertex: Vertex, meta: Vertex){
  const attributeId = meta.properties.id
  const type = capitalizeFirstLetter(attributeId) + (meta.properties.props.label || vertex.labels[0]);
  return (vertex.in_edges[type] || []).map(edgeId => graph.edges[edgeId].start);
}
// "(dataType)->[DataTypeComponent]"
// function getVertexes(vertex: Vertex, attribute: string, projection: string, edgeName: string) {
//   const fromVertexIds = getSelectedVertexValue(vertex, attribute);
//
//   const result = [] as Vertex[];
//   for (const fromVertexId_ of fromVertexIds) {
//     const fromVertex = graph.vertexes[fromVertexId_];
//     if (!fromVertex) continue;
//
//     // TODO: Make this work. this is broken we dont save id in properties.
//     const projectedId: number | undefined = projection ? path(projection, fromVertex) : fromVertexId_;
//     if (!projectedId) continue;
//
//     result.push(...getOutEdgeIdsOfType(projectedId, edgeName).map(id => graph.vertexes[graph.edges[id].end]));
//   }
//
//   return result;
// }

export function getParentVertex(path: string[], currentVertex: Vertex): {error:boolean, vertex?: Vertex} {
  const type = path[path.length -1].replace('$0', currentVertex.labels[0]);
  const edges = currentVertex.in_edges[type];
  if(!edges || (edges && edges.length != 1)) {
    return {
      error: true,
    }
  } else {
    const edge = graph.edges[edges[0]];
    if (edge) {
      const newVertex = graph.vertexes[edge.start];
      if(newVertex) {
        if(path.length > 1) {
          return getParentVertex(path.slice(0, -1), newVertex);
        } else {
          return {
            error: false,
            vertex: newVertex,
          }
        }
      } else {
        return {
          error: true,
        }
      }
    } else {
      return {
        error: true,
      }
    }
  }
}
export function getParentVertexes(path: string[], currentVertexes: Vertex[]): {error:boolean, vertexes?: Vertex[]} {
  const stepVertexes = {} as {[id: string]: Vertex};
  if(path.length == 0) {
    return {error: true}
  }
  let type = path[path.length -1];
  for (const currentVertex of currentVertexes) {
    type = type.replace('$0', currentVertex.labels[0]);
    const edgeIds = currentVertex.in_edges[type];
    if(!edgeIds) {
      continue;
    }

    for (const edgeId of edgeIds) {
      const edge = graph.edges[edgeId];
      if (edge) {
        const newVertex = graph.vertexes[edge.start];
        if(newVertex) {
          stepVertexes[newVertex.id] = newVertex;
        } else {
          return {
            error: true,
          }
        }
      } else {
        return {
          error: true,
        }
      }
    }
  }

  if(path.length > 1) {
    return getParentVertexes(path.slice(0, -1), Object.values(stepVertexes));
  } else {
    return {
      error: false,
      vertexes: Object.values(stepVertexes),
    }
  }
}
export function getChildVertex(path: string[], currentVertex: Vertex): {error:boolean, vertex?: Vertex} {
  if(path.length === 0) return {
    error: true,
  };

  let type = path[0];
  let filter = '';

  const filterIndex = type.indexOf('[');
  if(filterIndex > -1) {
    filter = type.slice(filterIndex)
    // modify the variable itself
    type = type.slice(0, filterIndex).replace('$0', currentVertex.labels[0]);
  }
  let vertexes = (currentVertex.out_edges[type] || []).map(edgeId => graph.vertexes[graph.edges[edgeId].end]);

  if (filter) {
    // TODO:
    // vertexes = vertexes.filter(x=>x.properties.id === 'component')
  }
  if(vertexes.length != 1) {
    return {
      error: true,
    }
  } else {
    const newVertex = vertexes[0];
      if(newVertex) {
        if(path.length > 1) {
          return getChildVertex(path.slice(1), newVertex);
        } else {
          return {
            error: false,
            vertex: newVertex,
          }
        }
      } else {
        return {
          error: true,
        }
      }
    }

}
export function getChildVertexes(path: string[], currentVertexes: Vertex[]): {error:boolean, vertexes?: Vertex[]} {
  const stepVertexes = {} as {[id: string]: Vertex};
  if(path.length == 0) {
    return {error: true}
  }
  let type = path[0];
  for (const currentVertex of currentVertexes) {
    type = type.replace('$0', currentVertex.labels[0]);
    const edgeIds = currentVertex.out_edges[type];
    if(!edgeIds) {
      continue;
    }

    for (const edgeId of edgeIds) {
      const edge = graph.edges[edgeId];
      if (edge) {
        const newVertex = graph.vertexes[edge.end];
        if(newVertex) {
          stepVertexes[newVertex.id] = newVertex;
        } else {
          return {
            error: true,
          }
        }
      } else {
        return {
          error: true,
        }
      }
    }
  }

  if(path.length > 1) {
   return getChildVertexes(path.slice(1), Object.values(stepVertexes));
  } else {
    return {
      error: false,
      vertexes: Object.values(stepVertexes),
    }
  }
}
export function getSelectionOptions(vertex: Vertex, collection: string, input: string, meta?: Vertex): Vertex[] {
  const inwardMulti = meta?.properties.props.inward ?? false
  // TOOD: make input filter working:

  if (collection.includes("||")) {
    for (const coll of collection.split("||")) {
      const value = getSelectionOptions(vertex, coll, "");
      if (value.length != 0) {
        return value;
      }
    }
  }

  // JSON.parse options:
  if (collection.startsWith("[")) {
    try {
      return JSON.parse(collection);
    } catch (e) {
      console.warn(e);
      return [];
    }
  } else if ((collection).includes("->") || (collection).includes("<-")) {
    let parentVertex: Vertex[] | undefined;

    let childrenCollection = collection;
    if (collection.includes("<-")) {
      const parentEdges = collection.split("<-");
      childrenCollection = parentEdges[parentEdges.length - 1];

      if(!inwardMulti) {
        const parentVertexResult = getParentVertex(parentEdges.slice(0, -1), vertex);
        if (parentVertexResult.error) {
          return [];
        } else {
          parentVertex = [parentVertexResult.vertex!];
        }
      } else {
        const parentVertexResult = getParentVertexes(parentEdges.slice(0, -1), [vertex]);
        if (parentVertexResult.error) {
          return [];
        } else {
          parentVertex = parentVertexResult.vertexes!;
        }
      }
    } else {
      if (!childrenCollection.startsWith("->")) {
        const rootEdges = collection.split("->");
        childrenCollection = rootEdges.slice(1).join('->');
        let parentEdge = rootEdges[0];
        const filterIndex = parentEdge.indexOf('[');
        let filter = '';
        if(filterIndex > -1) {
          filter = parentEdge.slice(filterIndex + 1).replace(']', '');
          // modify the variable itself
          parentEdge = parentEdge.slice(0, filterIndex);
          parentVertex = findVertexIdsByLabel(parentEdge).map((id) => graph.vertexes[id]).filter(vertex => vertex.properties.id === filter);
        } else {
          parentVertex = findVertexIdsByLabel(parentEdge).map((id) => graph.vertexes[id])
        }
      }
    }

    if (childrenCollection.length === 0 && parentVertex) {
      return parentVertex;
    }

    if (!parentVertex) parentVertex = [vertex];


    if (childrenCollection.startsWith("->")) {
      childrenCollection = childrenCollection.slice(2);
    }

    const path_ = childrenCollection.split("->");

      const childrenResult = getChildVertexes(path_, parentVertex);
      if(childrenResult.error) {
        return [];
      } else {
        return childrenResult.vertexes!;
      }
    } else {
      return findVertexIdsByLabel(collection).map((id) => graph.vertexes[id]);
    }
}

const getTextValue = (value: any) => {
  if (typeof value === "boolean") {
    return value ? "true" : "false";
  } else if (typeof value === "object") {
    return JSON.stringify(value);
  }
  return value;
}

export function getOptionLabel(vertex: Vertex, displayExpr: string): string {
  if(!vertex) return '';
  displayExpr = displayExpr.replaceAll('$0', vertex.labels[0]);
  if(displayExpr.includes('||')) {
    for (const displayExprElement of displayExpr.split('||')) {
      const value = getOptionLabel(vertex, displayExprElement);
      if(value !== undefined && value !== null && value !== '') {
        return value;
      }
    }
  }

    let pattern = '';
    let projection = ''
    if (displayExpr.includes(":")) {
      const columnIndex = displayExpr.lastIndexOf(":");
      pattern = displayExpr.slice(0, columnIndex);
      projection = displayExpr.slice(columnIndex + 1);
    }
    if(!pattern) {
      pattern = displayExpr;
    }
    if(!projection) {
      projection = "id";
    }

    if ((pattern).includes("->") || (pattern).includes("<-")) {
      let parentVertex: Vertex | undefined;

      let childrenCollection = pattern;
      if (pattern.includes("<-")) {
        const parentEdges = pattern.split("<-");
        childrenCollection = parentEdges[parentEdges.length - 1];
        const  parentVertexResult = getParentVertex(parentEdges.slice(0, -1), vertex);
        if(parentVertexResult.error) {
          return '';
        } else {
          parentVertex = parentVertexResult.vertex;
        }
      }

      if (!parentVertex) parentVertex = vertex;

      if(childrenCollection.startsWith('->')) {
        childrenCollection = childrenCollection.slice(2);
      }

      const path_ = childrenCollection.split("->");

      const childrenResult = getChildVertex(path_, parentVertex);
      if(childrenResult.error) {
        return '';
      } else {
        return getTextValue(path(projection, childrenResult.vertex)!);
      }
    }
    return getTextValue(path(displayExpr, vertex)!);

}
// This function will call multiple times, but it is optimized to not delete existing edges and use existing edges.
export function setSelectionValue(txnId: number, vertex: Vertex, meta: Vertex,  value?: number[] | number) {
  // delete removed edges:
  const type = (meta.properties.props.label || vertex.labels[0]) + capitalizeFirstLetter(meta.properties.id);
  const previousEdges = vertex.out_edges[type] || [];

  if (!Array.isArray(value)) {
    if ( value !== null && value !== undefined) {
      value = [value];
    } else {
      value = [];
    }
  }

  for (const edgeId of previousEdges) {
    // we should not delete edge that end to same vertex
    if (value.includes(graph.edges[edgeId].end)) continue;
    const deleteEdgeResult = deleteEdge(txnId, edgeId)
    if (deleteEdgeResult?.error) alert(deleteEdgeResult.error);
  }

  // add added edges:
  for (const vertexId of value) {
    if ((vertex.out_edges[type] || []).map(edgeId => graph.edges[edgeId].end).includes(vertexId)) continue
    const insertEdgeResult = addNewEdge(txnId, newEdge(getNewGraphId(), type, {}, vertex.id, vertexId));
    if(insertEdgeResult.error) alert(insertEdgeResult.error);
  }
}

// This function will call multiple times, but it is optimized to not delete existing edges and use existing edges.
export function setParentValue(txnId: number, vertex: Vertex, meta: Vertex,  value?: number[] | number) {
  // delete removed edges:
  const type = capitalizeFirstLetter(meta.properties.id) + (meta.properties.props.label || vertex.labels[0]);
  const previousEdges = vertex.in_edges[type] || [];

  if (!Array.isArray(value)) {
    if ( value !== null && value !== undefined) {
      value = [value];
    } else {
      value = [];
    }
  }

  for (const edgeId of previousEdges) {
    // we should not delete edge that end to same vertex
    if (value.includes(graph.edges[edgeId].start)) continue;
    const deleteEdgeResult = deleteEdge(txnId, edgeId)
    if (deleteEdgeResult?.error) alert(deleteEdgeResult.error);
  }

  // add added edges:
  for (const vertexId of value) {
    if ((vertex.in_edges[type] || []).map(edgeId => graph.edges[edgeId].start).includes(vertexId)) continue
    const insertEdgeResult = addNewEdge(txnId, newEdge(getNewGraphId(), type, {}, vertexId, vertex.id ));
    if(insertEdgeResult.error) alert(insertEdgeResult.error);
  }
}

export function SelectInputField(props: Omit<ComponentProps, "setValue">) {
  const { Ws } = useContext(WsContext);

  if(!props.meta.properties.props?.collection) {
    return "Collection Not Defined."
  }
  
  const [selectOptions, {refetch}] = createResource(() => {
    return getSelectionOptions(props.data, props.meta.properties.props.collection, "", props.meta)
  });
  return (
   <div aria-labeledby={props["aria-labeledby"]}>
     <div ref={el => {
       const selectedValue = () => props.meta.properties.props.inward ? getParentVertexValue(props.data, props.meta) : getSelectedVertexValue(props.data, props.meta);
       const instance = new SelectBox(el, {
         searchEnabled: true,
         // This will work as initial value and setting value second time in createEffect will not call onValueChanged function.
         value: selectedValue()[0],
         onValueChanged: function(e) {
           // batch(() => {
           const txnId = getNewTxnId();
           if(props.meta.properties.props.inward) {
             setParentValue(txnId, props.data, props.meta, e.value);
           } else {
             setSelectionValue(txnId, props.data, props.meta, e.value);
           }
           onChangeHandler(txnId, props.data, props.meta);
              commitTxn(txnId, Ws);
            // })
          },
          valueExpr: "id",
          displayExpr: item => getOptionLabel(item, props.meta.properties.props.displayExpr || "properties.id"),
          labelMode: 'floating',
          onFocusIn: function(e) {
            refetch()
          }
        });
       createEffect(() => {
         for (const property in props.meta.properties.props as Properties) {
           if(property === "displayExpr") continue;
           instance.option(property, props.meta.properties.props[property]);
         }
       });
       createEffect(() => {
         instance.option("value", selectedValue()[0]);
       });
        createEffect(() => {
          if(selectOptions()) {
            instance.option('dataSource', selectOptions());
          }
        })
      }} />
      {/* Todo: think about validations */}
      {/*<Show when={props.page}>*/}
      {/*  <For each={Object.values(props.page!)}>{(errorMsg: string) => <small>{errorMsg}</small>}</For>*/}
      {/*</Show>*/}
    </div>
  );
}
