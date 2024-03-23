import {
  batch, createComputed,
  createResource, createSelector,
  For,
  getOwner, on,
  runWithOwner,
  Show,
  untrack,
  useContext,
} from "solid-js";

// Comment This Lines in web build
import {
  commitTxn,
  getNewGraphId,
  getNewTxnId,
  graph,
  IdAttr,
  Vertex,
} from "../../lib/graph";
import { addNewEdge, deleteEdge, newEdge } from "../../lib/Edge";
import { WsContext } from "../../utils/ws_events_dispatcher";
import {
  getInEdge,
  getParentVertexValue,
  getSelectedVertexValue,
} from "../../lib/Traverse";
import {
  getSelectionOptions,
  getChildVertex,
  onChangeHandler,
  FormContext,
  getValueFromVertexOrKey,
} from "../../lib/Utils";
import { getNameKeyForCollection } from "../../lib/Record";
import { findVertexByLabelAndUniqueId } from "../../lib/Vertex";
import MultiSelect from "../solid-multiselect";
import { Icon } from "@iconify-icon/solid";
import { ComponentProps } from "../ComponentType";
import { setSelectionValue } from "./SelectionUtils";
import {selectedDom, selectedId} from "../pageStore";

function vertexInEdgeContainVertex(
  vertex: Vertex,
  type: any,
  vertexId: number
) {
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
export function setParentValue(
  txnId: number,
  vertex: Vertex,
  meta: Vertex,
  value?: number[] | number
) {
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

    const insertEdgeResult = addNewEdge(
      txnId,
      newEdge(getNewGraphId(), type, {}, vertexId, vertex.id)
    );
    if (insertEdgeResult.error) alert(insertEdgeResult.error);
  }
}

export const ensureArray = (value: any) => {
  if (Array.isArray(value)) {
    return value;
  } else {
    return value ? [value] : [];
  }
};
export const selectedValue = (meta: Vertex, data: Vertex): number[] => {
  if (
    getValueFromVertexOrKey(meta.P.props, "stringValue") ||
    getValueFromVertexOrKey(meta.P.props, "items")
  ) {
    // this is causing maximum call stack error when selecting an option
    return untrack(() => {
      return ensureArray(data.P[meta.P[IdAttr]]);
    });
  }
  try {
    // when new row added or modified this gives error.
    return getValueFromVertexOrKey(meta.P.props, "inward")
      ? getParentVertexValue(data, meta)
      : getSelectedVertexValue(data, meta);
  } catch (e) {
    return [];
  }
};

// if getValueFromVertexOrKey(meta.P.props, "collection") is simple string
// no need to pass displayExpr,
// it will be calculated automatically
// * - { } $ [ | is special characters,
// but checked more
export function isSimpleCollection(collection: string) {
  return !/[`!@$%^&*()+=\[\]{};':"\\|,.<>?~]/.test(collection);
}

// so in future can use more operators.
export function collectionNameDisplayExpr(collection?: string) {
  if (!collection) {
    return;
  }
  const collectionVertex = findVertexByLabelAndUniqueId(
    "Coll",
    "name",
    collection
  );
  if (collectionVertex) {
    const nameKeys = getNameKeyForCollection(collectionVertex);
    if (nameKeys.length === 1) {
      return `P.${nameKeys[0]}`;
    } else {
      return nameKeys.map((name) => `$P.${name}`).join(" ");
    }
  }
  return;
}

// displayExpr is required when props.meta.P.props.collection is complex
export function SelectInputField(
  props: ComponentProps & {
    component: string;
    title: String;
    txnId?: number;
    isRealTime?: boolean;
  }
) {
  const { Ws } = useContext(WsContext);
  let { record } = useContext(FormContext);

  // @ts-ignore
  const [selectOptions, { refetch }] = createResource(
    () => {
      let value = getValueFromVertexOrKey(props.meta.P.props, "items");
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

        const collection =
          getChildVertex(["$0Coll"], props.meta).vertex?.["P"]?.["name"] ||
          getValueFromVertexOrKey(props.meta.P.props, "collection");
        if (!collection) {
          return [];
        }
        return getSelectionOptions([props.data as Vertex], collection).vertexes || [];
      }
    },
    (data) => data
  );

  function getComponent() {
    let component = props.component;
    let direction = props.meta.P.dir;
    if (!component && direction) {
      if (direction === "->") {
        component = "SelectBox";
      } else {
        component = "TagBox";
      }
    }
    return component;
  }

  const onChangeSelect = (e: any, isRemove: any) => {
    let data;
    let optionId: number | number[] | undefined;
    let optionvalue: any;
    if (isRemove && e.length > 0) {
      data = [];
    } else {
      data = e[0];
      optionId = data!.id;
      optionvalue = data!.P.name;
    }
    runWithOwner(outerOwner, () => {
      batch(() => {
        // note: valueChanged is fired even when the value is changed programmatically,
        // that is causing problem: when transaction is reverted, it again calls onValueChanged callback.
        // used e.event check to prevent this.
        // on simple import screen when value is selected first time event is not there
        // if (e.previousValue && !e.event) {
        // TODO: TO Prevent Onchange event firing on select set a flag
        // when it should not fire the event In the form
        // and remove it
        // when calculations are done.
        // return;
        // }
        // only way to solve multi onValueChangeFire is set null value only. when undefined we assume value should not be set and changed programmatically again.

        if (!props.data) {
          return;
        }
        if (props.isRealTime) {
          props.txnId = getNewTxnId();
        }
        if (getValueFromVertexOrKey(props.meta.P.props, "stringValue")) {
          props.setValue?.(props.meta, props.data, optionvalue);
        } else if (getValueFromVertexOrKey(props.meta.P.props, "items")) {
          props.setValue?.(props.meta, props.data, optionvalue);
        } else if (getValueFromVertexOrKey(props.meta.P.props, "inward")) {
          setParentValue(props.txnId || 0, props.data, props.meta, optionId);
        } else {
          setSelectionValue(props.txnId || 0, props.data, props.meta, optionId);
        }
        onChangeHandler(
          props.txnId || 0,
          record?.vertex,
          props.data,
          props.meta
        );
        console.log(optionvalue);
        if (props.isRealTime) commitTxn(props.txnId || 0, Ws);
      });
    });
  };
  const isSelectedLayoutId = createSelector(selectedId);

  const outerOwner = getOwner();
  return (
    <div aria-labeledby={props["aria-labeledby"]}>
      
        <Show
          when={!props.disabled}
          fallback={
            <For each={selectedValue(props.meta, props.data as Vertex)}>
              {(vertexId) => (
                <>
                  {
                    getSelectionOptions(
                      [graph.vertexes[vertexId]],
                      getValueFromVertexOrKey(
                        props.meta.P.props,
                        "displayExpr"
                      ) || `::'P.${IdAttr}'`
                    ).vertexes
                  }
                </>
              )}
            </For>
          }
        >
          <MultiSelect
              ref={el => {
                createComputed(on(() => isSelectedLayoutId(props.meta.id), v=>{
                  console.log(1)
                  selectedDom.dom = el;
                }))
              }}
            isObject
            displayValueParent="P"
            disable={props.disabled!}
            displayValueChild="name"
            options={selectOptions()}
            avoidHighlightFirstOption
            placeholder={`Add ${props.title}`}
            onSelect={(e) => onChangeSelect(e, false)}
            onRemove={(e) => onChangeSelect(e, true)}
            customCloseIcon={<Icon icon={"ic:round-close"} />}
            selectionLimit={getComponent() == "SelectBox" ? 1 : 1000}
            selectedValues={selectedValue(props.meta, props.data as Vertex).map(
              (id) => {
                return graph.vertexes[id];
              }
            )}
          />
        </Show>
      
      {/* Todo: think about validations */}
    </div>
  );
}
