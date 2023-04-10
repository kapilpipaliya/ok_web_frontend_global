import { createEffect, createResource, untrack, useContext } from "solid-js";

import SelectBox, { Properties } from "devextreme/ui/select_box";
import { ComponentProps } from "./Type";
import {
  commitTxn,
  getNewGraphId,
  getNewTxnId,
  graph,
  Vertex
} from "../../lib/graph";
import { addNewEdge, deleteEdge, newEdge } from "../../lib/Edge";
import { capitalizeFirstLetter } from "../../utils/utils";
import { FormContext, onChangeHandler } from "../dynamicForm";
import { WsContext } from "../ws_events_dispatcher";
import {
  getInEdge,
  getOptionLabel,
  getParentVertexValue,
  getSelectedVertexValue,
  getSelectionOptions, getToEdge
} from "../../lib/Traverse";

// This function will call multiple times, but it is optimized to not delete existing edges and use existing edges.
export function setSelectionValue(txnId: number, vertex: Vertex, meta: Vertex, value?: number[] | number) {
  // delete removed edges:
  const type = getToEdge(meta, vertex);
  const previousEdges = vertex.out_edges[type] || [];

  if (!Array.isArray(value)) {
    if (value !== null && value !== undefined) {
      value = [value];
    } else {
      value = [];
    }
  }

  for (const edgeId of previousEdges) {
    // we should not delete edge that end to same vertex
    if (value.includes(graph.edges[edgeId].end)) continue;
    const deleteEdgeResult = deleteEdge(txnId, edgeId);
    if (deleteEdgeResult?.error) alert(deleteEdgeResult.error);
  }

  // add added edges:
  for (const vertexId of value) {
    if ((vertex.out_edges[type] || []).map((edgeId) => graph.edges[edgeId].end).includes(vertexId)) continue;
    const insertEdgeResult = addNewEdge(txnId, newEdge(getNewGraphId(), type, {}, vertex.id, vertexId));
    if (insertEdgeResult.error) alert(insertEdgeResult.error);
  }
}

// This function will call multiple times, but it is optimized to not delete existing edges and use existing edges.
export function setParentValue(txnId: number, vertex: Vertex, meta: Vertex, value?: number[] | number) {
  // delete removed edges:
  const type = getInEdge(meta, vertex);
  if(!type) alert('edge type cant be empty');
  const previousEdges = vertex.in_edges[type] || [];

  let valueArray = [] as number[];

  if (!Array.isArray(value)) {
    if (value !== null && value !== undefined) {
      valueArray = [value];
    } else {
      valueArray = [];
    }
  } else {
    valueArray = value;
  }

  for (const edgeId of previousEdges) {
    // we should not delete edge that start with same vertex
    if (valueArray.includes(graph.edges[edgeId].start)) continue;
    const deleteEdgeResult = deleteEdge(txnId, edgeId);
    if (deleteEdgeResult?.error) alert(deleteEdgeResult.error);
  }

  // add added edges:
  for (const vertexId of valueArray) {
    if ((vertex.in_edges[type] || []).map((edgeId) => graph.edges[edgeId].start).includes(vertexId)) continue;
    const insertEdgeResult = addNewEdge(txnId, newEdge(getNewGraphId(), type, {}, vertexId, vertex.id));
    if (insertEdgeResult.error) alert(insertEdgeResult.error);
  }
}

export function SelectInputField(props: ComponentProps) {
  const { Ws } = useContext(WsContext);
  const { local } = useContext(FormContext);

  if (!props.meta.properties.props?.collection) {
    return "Collection Not Defined.";
  }

  const [selectOptions, { refetch }] = createResource(() => {
    return getSelectionOptions(props.data, props.meta.properties.props.collection).vertexes || [];
  });
  return (
    <div aria-labeledby={props["aria-labeledby"]}>
      <div
        ref={(el) => {
          const selectedValue = () => {
            if (props.meta.properties.props.stringValue) {
              // this is causing maximum call stack error when selecting an option
              return untrack(() => {
                const value = props.data.properties[props.meta.properties.id];
                return Array.isArray(value) ? value : [value];
              });
            }
            return props.meta.properties.props.inward
              ? getParentVertexValue(props.data, props.meta)
              : getSelectedVertexValue(props.data, props.meta);
          };
          const instance = new SelectBox(el, {
            searchEnabled: true,
            // This will work as initial value and setting value second time in createEffect will not call onValueChanged function.
            value: selectedValue()[0],
            onValueChanged: function (e) {
              // batch(() => {
              const txnId = getNewTxnId();
              if (props.meta.properties.props.stringValue) {
                props.setValue(props.meta, e.value);
              } else if (props.meta.properties.props.inward) {
                setParentValue(txnId, props.data, props.meta, e.value);
              } else {
                setSelectionValue(txnId, props.data, props.meta, e.value);
              }
              onChangeHandler(txnId, props.data, props.meta);
              if (!local) commitTxn(txnId, Ws);
              // })
            },
            valueExpr: "id",
            displayExpr: (item) => getOptionLabel(item, props.meta.properties.props.displayExpr || "properties.id"),
            labelMode: "floating",
            onFocusIn: function (e) {
              refetch();
            },
          });
          createEffect(() => {
            for (const property in props.meta.properties.props as Properties) {
              if (property === "displayExpr") continue;
              instance.option(property, props.meta.properties.props[property]);
            }
          });
          createEffect(() => {
            instance.option("value", selectedValue()[0]);
          });
          createEffect(() => {
            const options = selectOptions();
            if (options) {
              instance.option("dataSource", options);
            }
          });
        }}
      />
      {/* Todo: think about validations */}
      {/*<Show when={props.page}>*/}
      {/*  <For each={Object.values(props.page!)}>{(errorMsg: string) => <small>{errorMsg}</small>}</For>*/}
      {/*</Show>*/}
    </div>
  );
}
