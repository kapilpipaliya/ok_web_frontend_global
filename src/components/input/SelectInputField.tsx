import { createEffect, createResource, splitProps } from "solid-js";

import SelectBox, { Properties } from "devextreme/ui/select_box";
import { SelectField, Vertex } from "./Form";
import { getNewGraphId, graph } from "../../lib/graph";
import { findVertexIdsByLabel } from "../../lib/Vertex";
import { S } from "@mobily/ts-belt";
import { path } from "rambda";
import {
  addNewEdge,
  deleteEdge,
  getOutEdgeIdsOfType,
  newEdge
} from "../../lib/Edge";

export interface SelectInputFieldProps extends Properties {
  txnId: number,
  meta: SelectField
  vertex: Vertex;
}
function capitalizeFirstLetter(string: string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
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
        if (!fromVertexId) return [];

        const fromVertex = graph.vertexes[fromVertexId];
        if(!fromVertex) return [];

        const projectedId: number|undefined = projection ? path(projection, fromVertex) : fromVertexId;
        if(!projectedId) return [];

        return getOutEdgeIdsOfType(projectedId, edgeName).map(id => graph.vertexes[graph.edges[id].end]);
      } else {
        return [];
      }
    } else {
      return findVertexIdsByLabel(collection).map((id) => graph.vertexes[id]);
    }
  }
}

// currently used vertexId, because it's not to use edge id
function getSelectedValue(vertex: Vertex, attribute: {id: string; component?: string}){
  if (!attribute.component) return [];
  const type = vertex.labels[0] + capitalizeFirstLetter(attribute.id);
  return (vertex.out_edges[type] || []).map(edgeId => graph.edges[edgeId].end)[0];

  // if (attribute.component === "select" || attribute.component === "multi-select") {
  //  return vertex.out_edges[type]
  // } else if (attribute.component === "Table") {
  //  return vertex.out_edges[type].map(edgeId => {
  //   const firstEdge = graph.edges[edgeId];
  //   const joinVertex = graph.vertexes[firstEdge.end];
  //   const secondEdgeId = joinVertex.out_edges[type][0];
  //   const secondEdge = graph.edges[secondEdgeId];
  //   const newProperties = Object.assign({}, joinVertex.properties, {[attribute.id]: secondEdge.end})
  //   return {id: joinVertex.id, properties: newProperties}
  //  })
  // } else if (attribute.component === "TableForm") {
  //  return [];
  // }
  // return [];
}
function setSelectionValue(txnId: number, vertex: Vertex, attribute: {id: string; component?: string}, previousValue: number, value: number) {
  const type = vertex.labels[0] + capitalizeFirstLetter(attribute.id);
  const previousEdge = vertex.out_edges[type] || [];
  for (const edgeId of previousEdge) {
    const deleteResult = deleteEdge(txnId, edgeId)
    if (deleteResult?.error) alert(deleteResult.error);
  }

  const insertResult = addNewEdge(txnId, newEdge(getNewGraphId(), type, {}, vertex.id, value));
  if(insertResult.error) alert(insertResult.error);
}
export function SelectInputField(props: SelectInputFieldProps) {
  const [p, customProps] = splitProps(props, ["vertex"]);
  // @ts-ignore
  const [selectOptions, {refetch}] = createResource(() => {
    return getSelectionOptions(props.vertex, props.meta.collection, "")
  });
  return (
    <div>
      <div ref={el => {
        const instance = new SelectBox(el, {
          ...customProps,
          searchEnabled: true,
          value: getSelectedValue(props.vertex, props.meta),
          onValueChanged: function(e) {
            setSelectionValue(props.txnId, props.vertex, props.meta, e.previousValue, e.value);
          },
          required: props.meta.required,
          disabled: props.meta.disabled,
          valueExpr: "id",
          displayExpr: "properties.id",
          labelMode: 'floating'
        });
        createEffect(() => {
          for(const property in p as Properties) {
            // @ts-ignore
            instance.option(property, p[property]);
          }
        })
        // createEffect(()=>instance.option('value', props.value))
        // when the value is changed by other components, we want to refetch the options
        // createEffect(on(() => props.rawValue, (v) => refetch(v)))
        // createEffect(()=>instance.option('required', props.required))
        // createEffect(()=>instance.option('disabled', props.disabled))
        createEffect(() => {
          if(selectOptions()) {
            instance.option('dataSource', selectOptions());
          }
        })
      }} />
      {/* Todo: think about validations */}
      {/*<Show when={props.errors}>*/}
      {/*  <For each={Object.values(props.errors!)}>{(errorMsg: string) => <small>{errorMsg}</small>}</For>*/}
      {/*</Show>*/}
    </div>
  );
}
