import { createEffect, createResource, splitProps, useContext } from "solid-js";

import SelectBox, { Properties } from "devextreme/ui/select_box";
import { FormMetaData, SelectField, Vertex } from "./Form";
import { commitTxn, getNewGraphId, getNewTxnId, graph } from "../../lib/graph";
import { findVertexIdsByLabel } from "../../lib/Vertex";
import { path } from "rambda";
import {
  addNewEdge,
  deleteEdge,
  getOutEdgeIdsOfType,
  newEdge
} from "../../lib/Edge";
import { capitalizeFirstLetter } from "../utils";
import { onChangeHandler } from "../core/dynamicForm";
import { ServerEventsDispatcher, WsContext } from "../ws_events_dispatcher";

export interface SelectInputFieldProps extends Properties {
  // TODO: MAKE THIS COMPULSORY
  form?: FormMetaData;
  meta: SelectField;
  vertex: Vertex;

}

// "(serverType)->[DataTypeComponent]"
function getVertexes(vertex: Vertex, attribute: string, projection: string, edgeName: string) {
  const fromVertexIds = getSelectedVertexValue(vertex, attribute);

  const result = [] as Vertex[];
  for (const fromVertexId_ of fromVertexIds) {
    const fromVertex = graph.vertexes[fromVertexId_];
    if (!fromVertex) continue;

    // TODO: Make this work. this is broken we dont save id in properties.
    const projectedId: number | undefined = projection ? path(projection, fromVertex) : fromVertexId_;
    if (!projectedId) continue;

    result.push(...getOutEdgeIdsOfType(projectedId, edgeName).map(id => graph.vertexes[graph.edges[id].end]));
  }

  return result;
}

export function getSelectionOptions(vertex: Vertex, collection: number | string, input: string) {
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
    } else if ((collection).includes("->")) {
      let collection_ = collection;
      let parentLabel = "";
      if (collection.includes("<-")) {
        const parentEdge = collection.split("<-");
        parentLabel = parentEdge[0] || "_";
        collection_ = parentEdge[1];
      }
      // "Label<-a->b->c"

      let newVertex: Vertex | undefined;

      if (parentLabel) {
        const type = vertex.labels[0];
        const edgeId = (vertex.in_edges[type] || [])[0];
        if (edgeId) {
          const edge = graph.edges[edgeId];
          if (edge) {
            newVertex = graph.vertexes[edge.start];
          }
        }
      }
      if (!newVertex) newVertex = vertex;

      const path_ = collection_.split("->");

      let prevVertex = [newVertex];
      for (let i = 0; i < path_.length - 1; i++) {
        const result = [];
        for (const v of prevVertex) {
          result.push(...getSelectedVertexValue(v, path_[i]).map(id => graph.vertexes[id]));
        }
        prevVertex = result;
      }
      // if (path_[path_.length - 1]) {
      //   return prevVertex.map(vertex => path(path_[path_.length - 1], vertex));
      // } else {
      //   return prevVertex.map(vertex => vertex.id);
      // }
      return prevVertex;
    } else {
      return findVertexIdsByLabel(collection).map((id) => graph.vertexes[id]);
    }
  }
  return []
}
export function getSelectedVertexValue(vertex: Vertex, attributeId: string){
  const type = vertex.labels[0] + capitalizeFirstLetter(attributeId);
  return (vertex.out_edges[type] || []).map(edgeId => graph.edges[edgeId].end);
}

export function getSelectedValue(vertex: Vertex, attributeId: string){
  const type = vertex.labels[0] + capitalizeFirstLetter(attributeId);
  const edges = (vertex.out_edges[type] || [])
  return [edges, edges.map(edgeId => graph.edges[edgeId].end)];
}

// This function will call multiple times, but it is optimized to not delete existing edges and use existing edges.
export function setSelectionValueOne(Ws: ServerEventsDispatcher, vertex: Vertex, attribute: {id: string; component?: string}, previousValue: number, value: number | null) {
  const txnId = getNewTxnId();
  const type = vertex.labels[0] + capitalizeFirstLetter(attribute.id);
  const previousEdges = vertex.out_edges[type] || [];
  for (const edgeId of previousEdges) {
    // if (value && edgeId === previousEdge) return;
    // we should not delete edge that end to same vertex
    const edge = graph.edges[edgeId];
    if(edge.end === value) continue;
    const deleteEdgeResult = deleteEdge(txnId, edgeId)
    if (deleteEdgeResult?.error) alert(deleteEdgeResult.error);
  }

  if (value !== null && value !== undefined && !(vertex.out_edges[type] || []).map(edgeId => graph.edges[edgeId].end).includes(value)) {
    const insertEdgeResult = addNewEdge(txnId, newEdge(getNewGraphId(), type, {}, vertex.id, value));
    if(insertEdgeResult.error) alert(insertEdgeResult.error);
  }
  commitTxn(txnId, Ws)
}
export function SelectInputField(props: SelectInputFieldProps) {
  const { Ws } = useContext(WsContext);

  const [p, customProps] = splitProps(props, ["vertex"]);
  const [selectOptions, {refetch}] = createResource(() => {
    return getSelectionOptions(props.vertex, props.meta.collection, "")
  });
  // let edge: Id;
  // let isChangedByUser = true;
  return (
    <div>
      <div ref={el => {
        const selectedValue = getSelectedValue(props.vertex, props.meta.id);
        // edge = selectedValue[1][0];
        const instance = new SelectBox(el, {
          ...customProps,
          searchEnabled: true,
          value: selectedValue[1][0],
          onValueChanged: function(e) {
            // batch(() => {
            //   isChangedByUser = true;
              setSelectionValueOne(Ws, props.vertex, props.meta, e.previousValue, e.value);
              const txnId = getNewTxnId();
              props.form && onChangeHandler(Ws, txnId, props.vertex, props.form, props.meta);
              commitTxn(txnId, Ws);
            // })
          },
          required: props.meta.required,
          disabled: props.meta.disabled,
          valueExpr: "id",
          displayExpr: props.meta.displayExpr || "properties.id",
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
          // if (!isChangedByUser) {
          const selectedValue = getSelectedValue(props.vertex, props.meta.id);
          // edge = selectedValue[0][0];
            instance.option('value', selectedValue[1][0])
          // } else {
          //   isChangedByUser = false;
          // }
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
