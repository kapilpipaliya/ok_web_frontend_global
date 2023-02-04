import { createEffect, createResource, splitProps } from "solid-js";

import TagBox, { Properties } from "devextreme/ui/tag_box";
import { SelectField, Vertex } from "./Form";
import { getNewGraphId, graph } from "../../lib/graph";
import { addNewEdge, deleteEdge, newEdge } from "../../lib/Edge";
import { getSelectionOptions } from "./SelectInputField";

export interface SelectInputFieldProps extends Properties {
  txnId: number,
  meta: SelectField
  vertex: Vertex;
}
function capitalizeFirstLetter(string: string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function getSelectedValue(vertex: Vertex, attribute: {id: string; component?: string}){
  if (!attribute.component) return [];
  const type = vertex.labels[0] + capitalizeFirstLetter(attribute.id);
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
function setSelectionValue(txnId: number, vertex: Vertex, attribute: {id: string; component?: string}, previousValue: number[], value: number[]) {
  // delete all previous edges:
  const type = vertex.labels[0] + capitalizeFirstLetter(attribute.id);
  const previousEdge = vertex.out_edges[type] || [];
  for (const edgeId of previousEdge) {
    const deleteResult = deleteEdge(txnId, edgeId)
    if (deleteResult?.error) alert(deleteResult.error);
  }

  // add all edges:
  for (const vertexId of value) {
    const insertResult = addNewEdge(txnId, newEdge(getNewGraphId(), type, {}, vertex.id, vertexId));
    if(insertResult.error) alert(insertResult.error);
  }
}
// TODO: Test when use case come
export function TagField(props: SelectInputFieldProps) {
  const [p, customProps] = splitProps(props, ["vertex"]);
  const [selectOptions, {refetch}] = createResource(() => {
    return getSelectionOptions(props.vertex, props.meta.collection, "")
  });
  return (
    <div>
      <div ref={el => {
        const instance = new TagBox(el, {
          ...customProps,
          searchEnabled: true,
          value: getSelectedValue(props.vertex, props.meta),
          onValueChanged: function(e) {
            setSelectionValue(props.txnId, props.vertex, props.meta, e.previousValue, e.value);
          },
          // required: props.meta.required,
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
