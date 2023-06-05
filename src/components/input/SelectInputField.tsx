import {
  JSX,
  on,
  createEffect,
  createResource,
  Show,
  untrack,
  useContext, onCleanup, For
} from "solid-js";

import SelectBox, { Properties } from "devextreme/ui/select_box";
import TagBox, { Properties as TagBoxProperties} from "devextreme/ui/tag_box";
import {
  commitTxn,
  getNewGraphId,
  getNewTxnId,
  graph,
  IdAttr,
  Vertex
} from "../../lib/graph";
import { addNewEdge, deleteEdge, newEdge } from "../../lib/Edge";
import { WsContext } from "../ws_events_dispatcher";
import {
  getInEdge,
  getOptionLabel,
  getParentVertexValue,
  getSelectedVertexValue,
  getSelectionOptions,
  getToEdge,
} from "../../lib/Traverse";
import { ComponentProps } from "../core/Form";
import { FormContext, onChangeHandler, Record } from "../../lib/Record";

function vertexOutEdgeContainVertex(vertex: Vertex, type: string, vertexId: number) {
  const outEdges = vertex.OUT[type] || [];
  let containsVertexId = false;

  for (const edgeId of outEdges) {
    const endVertex = graph.edges[edgeId].E;
    if (endVertex === vertexId) {
      containsVertexId = true;
      break;
    }
  }
  return containsVertexId;
}
function vertexInEdgeContainVertex(vertex: Vertex, type: any, vertexId: number) {
  const inEdges = vertex.IN[type] || [];
  let includesVertexId = false;
  for (const edgeId of inEdges) {
    const startVertex = graph.edges[edgeId].S;
    if (startVertex === vertexId) {
      includesVertexId = true;
      break;
    }
  }
  return includesVertexId;
}

// This function will call multiple times, but it is optimized to not delete existing edges and use existing edges.
export function setSelectionValue(txnId: number, vertex: Vertex, meta: Vertex, value?: number[] | number) {
  // delete removed edges:
  const type = getToEdge(meta, vertex);
  const previousEdges = vertex.OUT[type] || [];

  if (!Array.isArray(value)) {
    if (value !== null && value !== undefined) {
      value = [value];
    } else {
      value = [];
    }
  }

  for (const edgeId of previousEdges) {
    // we should not delete edge that end to same vertex
    if (value.includes(graph.edges[edgeId].E)) continue;
    const deleteEdgeResult = deleteEdge(txnId, edgeId);
    if (deleteEdgeResult?.error) alert(deleteEdgeResult.error);
  }

  // add added edges:
  for (const vertexId of value) {
    if (vertexOutEdgeContainVertex(vertex, type, vertexId)) {
      continue;
    }
    const insertEdgeResult = addNewEdge(txnId, newEdge(getNewGraphId(), type, {}, vertex.id, vertexId));
    if (insertEdgeResult.error) alert(insertEdgeResult.error);
  }
}



// This function will call multiple times, but it is optimized to not delete existing edges and use existing edges.
export function setParentValue(txnId: number, vertex: Vertex, meta: Vertex, value?: number[] | number) {
  // delete removed edges:
  const type = getInEdge(meta, vertex);
  if (!type) alert("edge type cant be empty");
  const previousEdges = vertex.IN[type] || [];

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
    if (valueArray.includes(graph.edges[edgeId].S)) continue;
    const deleteEdgeResult = deleteEdge(txnId, edgeId);
    if (deleteEdgeResult?.error) alert(deleteEdgeResult.error);
  }

  // add added edges:
  for (const vertexId of valueArray) {
    if (vertexInEdgeContainVertex(vertex, type, vertexId)) {
      continue;
    }

    const insertEdgeResult = addNewEdge(txnId, newEdge(getNewGraphId(), type, {}, vertexId, vertex.id));
    if (insertEdgeResult.error) alert(insertEdgeResult.error);
  }
}

export const selectedValue = (meta: Vertex, data: Vertex): number[] => {
  if (meta.P.props?.stringValue) {
    // this is causing maximum call stack error when selecting an option
    return untrack(() => {
      const value = data.P[meta.P[IdAttr]];
      if (Array.isArray(value)) {
        return value;
      } else {
        return value ? [value] : [];
      }
    });
  } else if (meta.P.props.items) {
    return data.P[meta.P[IdAttr]];
  }
  return meta.P.props?.inward ? getParentVertexValue(data, meta) : getSelectedVertexValue(data, meta);
};

export function SelectInputField(props: ComponentProps & {component: string}) {
  const { Ws } = useContext(WsContext);
  let { record } = useContext(FormContext);
  if (!record) record = {} as Record;

  // @ts-ignore
  const [selectOptions, { refetch }] = createResource(() => {
    let value = props.meta.P.props.items;
    if (value) {
      if (typeof value === "string") {
        return value.split("\n");
      } else if (Array.isArray(value)) {
        return value;
      } else {
        return value ? [value] : [];
      }
    } else {
      // this is not working when row is enabled, select field options is not updated
      // if (props.disabled) {
      //   return selectedValue(props.meta, props.data).map((vertexId) => graph.vertexes[vertexId]);
      // }
      if (!props.meta.P.props?.collection) {
        return [];
      }
      return getSelectionOptions(props.data, props.meta.P.props.collection).vertexes || [];
    }
  }, (data) => data);

  return (
    <div aria-labeledby={props["aria-labeledby"]}>
      <Show
        when={!props.disabled}
        fallback={
          <For each={selectedValue(props.meta, props.data)}>
            {(vertexId) => <>{getOptionLabel(graph.vertexes[vertexId], props.meta.P.props.displayExpr || `P.${IdAttr}`)}</>}
          </For>
        }
      >
        <div
         class="min-w:140"
          ref={(el) => {
            let selectOp = {
              searchEnabled: true,
              disabled: props.disabled!,


              // This will work as initial value and setting value second time in createEffect will not call onValueChanged function.
              value: props.component === 'SelectBox' ? selectedValue(props.meta, props.data)[0] : selectedValue(props.meta, props.data),
              onValueChanged: function (e) {
                // batch(() => {
                // note: valueChanged is fired even when the value is changed programmatically,
                // that is causing problem: when transaction is reverted, it again calls onValueChanged callback.
                // used e.event check to prevent this.
                if (!e.event) {
                  return;
                }
                if (!props.data) {
                  return;
                }
                if (record.isRealTime) {
                  record.txnId = getNewTxnId();
                }
                if (props.meta.P.props.stringValue) {
                  props.setValue?.(props.meta,props.data, e.value);
                } else if (props.meta.P.props.items) {
                  props.setValue?.(props.meta,props.data, e.value);
                } else if (props.meta.P.props.inward) {
                  setParentValue(record.txnId, props.data, props.meta, e.value);
                } else {
                  setSelectionValue(record.txnId, props.data, props.meta, e.value);
                }
                onChangeHandler(record.txnId, record.vertex, props.data, props.meta);
                if (record.isRealTime) commitTxn(record.txnId, Ws);
                // })
              },
              labelMode: "floating",
              // slow down performance.
              // onFocusIn: function (e) {
              //   refetch();
              // },
            } as Properties;

            if (props.meta.P.props.focusRefresh) {
              Object.assign(selectOp, {
                onFocusIn: function (e) {
                  refetch();
                },
              } as Properties)
            }
            if (!props.meta.P.props.items) {
              Object.assign(selectOp, {
                // if valueExpr value is undefined onValueChange will not fire.
                valueExpr: "id",
                displayExpr: (item) => getOptionLabel(item, props.meta.P.props.displayExpr || `P.${IdAttr}`),

              } as Properties)
            }
            const instance = props.component === 'SelectBox' ? new SelectBox(el, selectOp) : new TagBox(el, selectOp as TagBoxProperties);
            createEffect(() => {
              for (const property in props.meta.P.props as Properties) {
                if (property === "displayExpr" || property === 'items') continue;
                instance.option(property, props.meta.P.props[property]);
              }
            });
            // when the value is changed by other components, we want to refetch the options
            // createEffect(on(() => props.rawValue, (v) => refetch(v)))
            createEffect(
             on(
              () => selectedValue(props.meta, props.data),
              (selectedValue) => {
                instance.option("value", props.component === 'SelectBox' ? selectedValue[0] : selectedValue);
              },
              { defer: true },
             ),
            );

            // when the value is changed by other components, we want to refetch the options
            // createEffect(on(() => props.rawValue, (v) => refetch(v)))



            createEffect(() => instance.option("disabled", props.disabled));

            createEffect(() => {
              const options = selectOptions();
              if (options) {
                instance.option("dataSource", options);
              }
            });
            onCleanup(() => instance.dispose());
          }}
        />
      </Show>
      {/* Todo: think about validations */}
    </div>
  );
}
