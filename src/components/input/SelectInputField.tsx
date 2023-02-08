import { createEffect, createResource, splitProps, useContext } from "solid-js";

import SelectBox, { Properties } from "devextreme/ui/select_box";
import { FormMetaData, SelectField, Vertex } from "./Form";
import { commitTxn, getNewGraphId, getNewTxnId, graph } from "../../lib/graph";
import { findVertexIdsByLabel } from "../../lib/Vertex";
import { S } from "@mobily/ts-belt";
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
  meta: SelectField
  vertex: Vertex;
  
}
export function getSelectionOptions(vertex: Vertex, collection: number | string, input: string) {
  // TOOD: make input filter working:
  if (typeof collection === "number") {
    const collectionVertex = graph.vertexes[collection];
    // assume that vertex is of label Collection
    return collectionVertex ? findVertexIdsByLabel(collectionVertex.properties.id).map((id) => graph.vertexes[id]) : [];
  }

  if (typeof collection === "string") {
    // JSON.parse options:
    if (collection.startsWith("[")) {
      try {
        return JSON.parse(collection);
      } catch (e) {
        console.warn(e)
        return [];
      }
    } else if ((collection).includes("[")) {
      // "(selector:attribute:projection)->[edgeName]"
      const from = /\(([\w\.]+:)?(\w+)(:[\w\.]+)?\)->/
      const edge = /\[(\w+)\]/
      const fromResult = collection.match(from);
      const edgeName = collection.match(edge)?.[1];

      if(fromResult && edgeName) {
        // @ts-ignore
        const selector = S.removeAll(fromResult[1] || '', ":");
        const attribute = fromResult[2];
        const projection = S.removeAll(fromResult[3] || '', ":");

        const fromVertexId = vertex.properties[attribute];
        const fromVertexIds = fromVertexId ? [fromVertexId] : getSelectedVertexValue(vertex, attribute);

        const result = [] as Vertex[];
        for (const fromVertexId_ of fromVertexIds ) {
          const fromVertex = graph.vertexes[fromVertexId_];
          if(!fromVertex) continue;

          const projectedId: number|undefined = projection ? path(projection, fromVertex) : fromVertexId_;
          if(!projectedId) continue;

          result.push(...getOutEdgeIdsOfType(projectedId, edgeName).map(id => graph.vertexes[graph.edges[id].end]));
        }

        return result;
      } else {
        return [];
      }
    } else {
      return findVertexIdsByLabel(collection).map((id) => graph.vertexes[id]);
    }
  }
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
export function setSelectionValueOne(Ws: ServerEventsDispatcher, vertex: Vertex, attribute: {id: string; component?: string}, previousValue: number, value: number) {
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

  if (value && !(vertex.out_edges[type] || []).map(edgeId => graph.edges[edgeId].end).includes(value)) {
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
              props.form && onChangeHandler(txnId, props.vertex, props.form, props.meta);
              commitTxn(txnId, Ws);
            // })
          },
          required: props.meta.required,
          disabled: props.meta.disabled,
          valueExpr: "id",
          displayExpr: "properties.id",
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
