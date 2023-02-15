import {
  createEffect,
  createResource,
  on,
  splitProps,
  useContext
} from "solid-js";

import TagBox, { Properties } from "devextreme/ui/tag_box";
import { FormMetaData, Id, SelectField, Vertex } from "./Form";
import { commitTxn, getNewGraphId, getNewTxnId, graph } from "../../lib/graph";
import { addNewEdge, deleteEdge, newEdge } from "../../lib/Edge";
import { getSelectedValue, getSelectionOptions } from "./SelectInputField";
import { WsContext } from "../ws_events_dispatcher";
import { onChangeHandler } from "../core/dynamicForm";
import { capitalizeFirstLetter } from "../utils";

export interface SelectInputFieldProps extends Properties {
  form: FormMetaData;
  meta: SelectField
  vertex: Vertex;
  
}

// This function will call multiple times, but it is optimized to not delete existing edges and use existing edges.
function setSelectionValueMulti(txnId: number, vertex: Vertex, attribute: {id: string; component?: string}, previousValue: number[], _edges: Id[], value: number[]) {
  // delete removed edges:
  const type = vertex.labels[0] + capitalizeFirstLetter(attribute.id);
  const previousEdges = vertex.out_edges[type] || [];
  for (const edgeId of previousEdges) {
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

export function TagField(props: SelectInputFieldProps) {
  const { Ws } = useContext(WsContext);

  const [p, customProps] = splitProps(props, ["vertex"]);
  const [selectOptions, {refetch}] = createResource(() => {
    return getSelectionOptions(props.vertex, props.meta.collection, "")
  });
  let edge: Id[];
  // let isChangedByUser = true;
  return (
    <div>
      <div ref={el => {
        const selectedValue = getSelectedValue(props.vertex, props.meta.id);
        edge = selectedValue[0]
        const instance = new TagBox(el, {
          ...customProps,
          searchEnabled: true,
          value: selectedValue[1],
          onValueChanged: function(e) {
            const txnId = getNewTxnId();
            // batch(() => {
            //   if(e.event) isChangedByUser = true;
              setSelectionValueMulti(txnId, props.vertex, props.meta, e.previousValue, edge, e.value);
              onChangeHandler(Ws, txnId, props.vertex, props.form, props.meta);
              commitTxn(txnId, Ws);
            // })
          },
          // required: props.meta.required,
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
        createEffect(on(()  => getSelectedValue(props.vertex, props.meta.id), selectedValue =>{
          // if (!isChangedByUser) {
          edge = selectedValue[0];
            instance.option('value', selectedValue[1])
          // } else {
          //   isChangedByUser = false;
          // }
        }, {defer: true}))
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
      {/*<Show when={props.page}>*/}
      {/*  <For each={Object.values(props.page!)}>{(errorMsg: string) => <small>{errorMsg}</small>}</For>*/}
      {/*</Show>*/}
    </div>
  );
}
