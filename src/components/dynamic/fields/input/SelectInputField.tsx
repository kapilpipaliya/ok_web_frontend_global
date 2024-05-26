import {
  batch,
  createEffect,
  createResource,
  For,
  getOwner,
  runWithOwner,
  Show,
  splitProps,
  untrack,
  useContext,
} from "solid-js";

// Comment This Lines in web build
import {
  GraphContext,
  GraphInterface,
  IdAttr,
  Vertex,
} from "~/lib/graph/graph";
import { commitTxn, getNewGraphId, getNewTxnId } from "~/lib/graph/transaction";
import { addNewEdge, deleteEdge, newEdge } from "~/lib/graph/mutate/edge";
import { WsContext } from "~/lib/websocket/ws_events_dispatcher";
import {
  getInEdge,
  getParentVertexValue,
  getSelectedVertexValue,
} from "~/lib/graph/get/sync/traverse";
import { FormContext, getValueFromVertexOrKey } from "~/lib/Utils";
import {
  getChildVertex,
  getSelectionOptions,
} from "~/lib/graph/get/sync/traverse";
import {
  onChangeHandler,
  setValueGlobal,
} from "~/lib/graph/mutate/form_functions";
import MultiSelect from "~/components/custom/MultiSelect";
import { Icon } from "@iconify-icon/solid";
import { ComponentProps } from "~/components/ComponentType";
import { setSelectionValue } from "~/components/dynamic/fields/static/SelectionUtils";
import { SetStoreFunction, Store } from "solid-js/store";
import { findVertexByLabelAndUniqueId } from "~/lib/graph/get/sync/findVertex";
import { getNameKeyForCollection } from "~/lib/graph/get/sync/graph_functions";
import { useToast } from "~/components/custom/Toast";
import { getSelectionOptionsAsync } from "~/lib/graph/get/async/traverse";
import { getSelectionOptionsMGCall } from "~/cypher_api/lib/graph/get/async/traverse";
import { setGraphData } from "~/lib/websocket/ws_events";
import MultiSelectField from "~/components/custom/MultiSelect";

function vertexInEdgeContainVertex(
  vertex: Vertex,
  type: any,
  vertexId: number,
  graph: Store<GraphInterface>,
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
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
  txnId: number,
  vertex: Vertex,
  meta: Vertex,
  value?: number[] | number,
) {
  const { showWarningToast, showErrorToast } = useToast();

  // delete removed edges:
  const type = getInEdge(meta, vertex);
  if (!type) showWarningToast("edge type cant be empty");
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
    const deleteEdgeResult = deleteEdge(txnId, edgeId, graph, setGraph);
    if (deleteEdgeResult?.error)
      showErrorToast(deleteEdgeResult.error.toString());
  }

  // add added edges:
  for (const vertexId of valueArray) {
    if (vertexInEdgeContainVertex(vertex, type, vertexId, graph)) {
      continue;
    }

    const insertEdgeResult = addNewEdge(
      txnId,
      newEdge(getNewGraphId(), type, {}, vertexId, vertex.id),
      graph,
      setGraph,
    );
    if (insertEdgeResult.error)
      showErrorToast(insertEdgeResult.error.toString());
  }
}

export function ensureArray(value: any) {
  if (Array.isArray(value)) {
    return value;
  } else {
    return value ? [value] : [];
  }
}
export function selectedValue(
  meta: Vertex,
  data: Vertex,
  graph: Store<GraphInterface>,
): number[] {
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
      ? getParentVertexValue(graph, data, meta)
      : getSelectedVertexValue(graph, data, meta);
  } catch (e) {
    return [];
  }
}

// if getValueFromVertexOrKey(meta.P.props, "collection") is simple string
// no need to pass displayExpr,
// it will be calculated automatically
// * - { } $ [ | is special characters,
// but checked more
export function isSimpleCollection(collection: string) {
  return !/[`!@$%^&*()+=\[\]{};':"\\|,.<>?~]/.test(collection);
}

// so in future can use more operators.
export function collectionNameDisplayExpr(
  graph: Store<GraphInterface>,
  collection?: string,
) {
  if (!collection) {
    return;
  }
  const collectionVertex = findVertexByLabelAndUniqueId(
    graph,
    "Coll",
    "name",
    collection,
  );
  if (collectionVertex) {
    const nameKeys = getNameKeyForCollection(graph, collectionVertex);
    if (nameKeys.length === 1) {
      return `P.${nameKeys[0]}`;
    } else {
      return nameKeys.map((name) => `$P.${name}`).join(" ");
    }
  }
  return;
}

// displayExpr is required when meta.P.props.collection is complex
export function SelectInputField(
  props: ComponentProps & {
    component: string;
    title: String;
    txnId?: number;
    isRealTime?: boolean;
  },
) {
  const [field, others] = splitProps(props, [
    "component",
    "title",
    "txnId",
    "isRealTime",
    "disabled",
    "meta",
    "data",
    "setValue",
  ]);

  const { Ws } = useContext(WsContext);
  const [graph, setGraph] = useContext(GraphContext)!;
  const formData = useContext(FormContext);

  const [selectOptions] = createResource(async () => {
    let value = getValueFromVertexOrKey(field.meta.P.props, "items");
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
      if (field.disabled) {
        return selectedValue(field.meta, field.data as Vertex, graph).map(
          (vertexId) => graph.vertexes[vertexId],
        );
      }

      const collection =
        getChildVertex(graph, ["$0Coll"], field.meta).vertex?.["P"]?.["name"] ||
        getValueFromVertexOrKey(field.meta.P.props, "collection");
      if (!collection) {
        return [];
      }

      const res = await getSelectionOptionsMGCall(
        [field.data as Vertex],
        collection,
      );

      if (!res.error) {
        setGraphData(graph, setGraph, res.graph);
        return (
          getSelectionOptions(
            graph,
            setGraph,
            [field.data as Vertex],
            collection,
          ).vertexes || []
        );
      } else {
        return [];
      }
    }
  });

  function getComponent() {
    let direction = field.meta.P.dir;
    if (!field.component && direction) {
      if (direction === "->") {
        field.component = "SelectBox";
      } else {
        field.component = "TagBox";
      }
    }
    return field.component;
  }

  const onChangeSelect = (e: Vertex[], isRemove: any) => {
    // TODO: ensure this working for multiselect
    let data: number[] | number;
    let optionvalue: any;
    if (isRemove && getComponent() === "SelectBox") {
      data = [];
    } else if (getComponent() === "SelectBox"){
      data = e[0].id;
    } else {
      data = e.map((e) => e.id);
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

        if (!data) {
          return;
        }
        if (field.isRealTime) {
          field.txnId = getNewTxnId(graph, setGraph);
        }
        if (getValueFromVertexOrKey(field.meta.P.props, "stringValue")) {
          field.setValue
            ? field.setValue(optionvalue)
            : setValueGlobal(
                graph,
                setGraph,
                field.txnId!,
                field.meta,
                props.data!,
                data,
                Ws,
                false,
              );
        } else if (getValueFromVertexOrKey(field.meta.P.props, "items")) {
          field.setValue
            ? field.setValue(optionvalue)
            : setValueGlobal(
                graph,
                setGraph,
                field.txnId!,
                field.meta,
                props.data!,
                data,
                Ws,
                false,
              );
        } else if (getValueFromVertexOrKey(field.meta.P.props, "inward")) {
          setParentValue(
            graph,
            setGraph,
            field.txnId || 0,
            props.data!,
            field.meta,
            data,
          );
        } else {
          setSelectionValue(
            field.txnId || 0,
            props.data!,
            graph,
            setGraph,
            field.meta,
            data,
          );
        }
        onChangeHandler(
          field.txnId || 0,
          formData?.formData,
          props.data!,
          field.meta,
          graph,
          setGraph,
        );
        if (field.isRealTime) commitTxn(field.txnId || 0, Ws);
      });
    });
  };
  const outerOwner = getOwner();
  return (
    <div aria-labeledby={props["aria-labeledby"]}>
      <Show
        when={!field.disabled}
        fallback={
          <For each={selectedValue(field.meta, field.data as Vertex, graph)}>
            {(vertexId) => (
              <>
                {
                  getSelectionOptions(
                    graph,
                    setGraph,
                    [graph.vertexes[vertexId]],
                    getValueFromVertexOrKey(
                      field.meta.P.props,
                      "displayExpr",
                    ) || `::'P.${IdAttr}'`,
                  ).vertexes
                }
              </>
            )}
          </For>
        }
      >
        <MultiSelectField
          selectionLimit={getComponent() === "SelectBox" ? 1 : undefined}
          displayValueChild="displayName"
          displayValueParent="P"
          selectedValues={() => selectedValue(
            field.meta,
            field.data as Vertex,
            graph
          ).map((id) => {
            return graph.vertexes[id];
          })}
          disable={field.disabled!}
          options={selectOptions()}
          onRemove={(e) => onChangeSelect(e, true)}
          onSelect={(e) => onChangeSelect(e, false)}
          placeholder={`${field.title}`}
        />
      </Show>
      {/* Todo: think about validations */}
    </div>
  );
}
