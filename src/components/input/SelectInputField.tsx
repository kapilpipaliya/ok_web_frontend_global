import { createEffect, createResource, splitProps, useContext } from "solid-js";

import SelectBox, { Properties } from "devextreme/ui/select_box";
import { Vertex } from "./Form";
import { commitTxn, getNewGraphId, getNewTxnId, graph } from "../../lib/graph";
import { findVertexIdsByLabel } from "../../lib/Vertex";
import { addNewEdge, deleteEdge, newEdge } from "../../lib/Edge";
import { capitalizeFirstLetter } from "../utils";
import { onChangeHandler } from "../core/dynamicForm";
import { WsContext } from "../ws_events_dispatcher";
import { path } from "rambda";

export interface SelectInputFieldProps extends Properties {
  meta: Vertex;
  vertex: Vertex;
  "aria-labeledby"?: string
}

export function getSelectedVertexValue(vertex: Vertex, attributeId: string){
  const type = vertex.labels[0] + capitalizeFirstLetter(attributeId);
  return (vertex.out_edges[type] || []).map(edgeId => graph.edges[edgeId].end);
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
  const type = path[path.length -1];
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
    type = type.slice(0, filterIndex);
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
  const type = path[0];
  for (const currentVertex of currentVertexes) {
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
export function getSelectionOptions(vertex: Vertex, collection: number | string, input: string): Vertex[] {
  // TOOD: make input filter working:
  if (typeof collection === "string") {
    // JSON.parse options:
    if (collection.startsWith("[")) {
      try {
        return JSON.parse(collection);
      } catch (e) {
        console.warn(e)
        return [];
      }
    } else if ((collection).includes("->") || (collection).includes("<-")) {
      let parentVertex: Vertex | undefined;

      let childrenCollection = collection;
      if (collection.includes("<-")) {
        const parentEdges = collection.split("<-");
        childrenCollection = parentEdges[parentEdges.length - 1];
        const  parentVertexResult = getParentVertex(parentEdges.slice(0, -1), vertex);
        if(parentVertexResult.error) {
          return [];
        } else {
          parentVertex = parentVertexResult.vertex;
        }
      }

      if (!parentVertex) parentVertex = vertex;

      if(childrenCollection.startsWith('->')) {
        childrenCollection = childrenCollection.slice(2);
      }

      const path_ = childrenCollection.split("->");

      const childrenResult = getChildVertexes(path_, [parentVertex]);
      if(childrenResult.error) {
        return [];
      } else {
        return childrenResult.vertexes!;
      }
    } else {
      return findVertexIdsByLabel(collection).map((id) => graph.vertexes[id]);
    }
  }
  return []
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
export function setSelectionValue(txnId: number, vertex: Vertex, attribute: Vertex,  value?: number[] | number) {
  // delete removed edges:
  const type = vertex.labels[0] + capitalizeFirstLetter(attribute.properties.id);
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

export function SelectInputField(props: SelectInputFieldProps) {
  const { Ws } = useContext(WsContext);

  const [p, customProps] = splitProps(props, ["vertex", "aria-labeledby"]);
  if(!props.meta.properties.collection) {
    return "Collection Not Defined."
  }
  
  const [selectOptions, {refetch}] = createResource(() => {
    return getSelectionOptions(props.vertex, props.meta.properties.collection, "")
  });
  return (
    <div aria-labeledby={p["aria-labeledby"]}>
      <div ref={el => {
        const selectedValue = getSelectedVertexValue(props.vertex, props.meta.properties.id);
        const instance = new SelectBox(el, {
          ...customProps,
          searchEnabled: true,
          value: selectedValue[0],
          onValueChanged: function(e) {
            // batch(() => {
              const txnId = getNewTxnId();
              setSelectionValue(txnId, props.vertex, props.meta,  e.value);
              onChangeHandler(txnId, props.vertex, props.meta);
              commitTxn(txnId, Ws);
            // })
          },
          required: props.meta.properties.required,
          disabled: props.meta.properties.disabled,
          valueExpr: "id",
          displayExpr: item => getOptionLabel(item, props.meta.properties.displayExpr || "properties.id"),
          labelMode: 'floating',
          onFocusIn: function(e) {
            refetch()
          }
        });
        createEffect(() => {
          for(const property in p as Properties) {
            // @ts-ignore
            instance.option(property, p[property]);
          }
        })
        createEffect(()=>{
          const selectedValue = getSelectedVertexValue(props.vertex, props.meta.properties.id);
            instance.option('value', selectedValue[0])
        })
        // createEffect(()=>instance.option('required', props.required))
        // createEffect(()=>instance.option('disabled', props.disabled))
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
