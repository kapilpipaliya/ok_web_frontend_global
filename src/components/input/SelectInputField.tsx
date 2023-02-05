import { createEffect, createResource, splitProps } from "solid-js";

import SelectBox, { Properties } from "devextreme/ui/select_box";
import { FormMetaData, SelectField, Vertex } from "./Form";
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
import { capitalizeFirstLetter } from "../utils";
import { onChangeHandler } from "../core/dynamicForm";

export interface SelectInputFieldProps extends Properties {
  form: FormMetaData;
  txnId: number,
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
        const fromVertexIds = fromVertexId ? [fromVertexId] : getSelectedValue(vertex, attribute);

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

// currently used vertexId, because it's not to use edge id
export function getSelectedValue(vertex: Vertex, attributeId: string){
  const type = vertex.labels[0] + capitalizeFirstLetter(attributeId);
  return (vertex.out_edges[type] || []).map(edgeId => graph.edges[edgeId].end);

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
export function setSelectionValue(txnId: number, vertex: Vertex, attribute: {id: string; component?: string}, previousValue: number, value: number) {
  const type = vertex.labels[0] + capitalizeFirstLetter(attribute.id);
  const previousEdge = vertex.out_edges[type] || [];
  for (const edgeId of previousEdge) {
    const deleteEdgeResult = deleteEdge(txnId, edgeId)
    if (deleteEdgeResult?.error) alert(deleteEdgeResult.error);
  }

  if (value) {
    const insertEdgeResult = addNewEdge(txnId, newEdge(getNewGraphId(), type, {}, vertex.id, value));
    if(insertEdgeResult.error) alert(insertEdgeResult.error);
  }

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
          value: getSelectedValue(props.vertex, props.meta.id)[0],
          onValueChanged: function(e) {
            setSelectionValue(props.txnId, props.vertex, props.meta, e.previousValue, e.value);
            onChangeHandler(props.txnId, props.vertex, props.form, props.meta);
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
        createEffect(()=>instance.option('value', getSelectedValue(props.vertex, props.meta.id)[0]))
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
