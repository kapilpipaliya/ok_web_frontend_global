import {
  batch,
  createResource,
  For,
  getOwner,
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
  GraphContext,
  GraphInterface,
  IdAttr,
  Vertex,
} from "~/lib/graph/graph";
import { addNewEdge, deleteEdge, newEdge } from "~/lib/graph/mutate/Edge";
import { WsContext } from "~/lib/websocket/ws_events_dispatcher";
import {
  getInEdge,
  getParentVertexValue,
  getSelectedVertexValue,
} from "~/lib/graph/get/sync/Traverse";
import {
  getSelectionOptions,
  getChildVertex,
  onChangeHandler,
  FormContext,
  getValueFromVertexOrKey,
  setValueGlobal,
} from "~/lib/Utils";
import { getNameKeyForCollection } from "~/lib/graph/mutate/Record";
import { findVertexByLabelAndUniqueId } from "~/lib/graph/mutate/Vertex";
import MultiSelect from "~/components/custom/MultiSelect";
import { Icon } from "@iconify-icon/solid";
import { ComponentProps } from "~/lib/ComponentType";
import { setSelectionValue } from "~/components/dynamic/fields/static/SelectionUtils";
import { SetStoreFunction, Store } from "solid-js/store";

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
    const deleteEdgeResult = deleteEdge(txnId, edgeId, graph, setGraph);
    if (deleteEdgeResult?.error) alert(deleteEdgeResult.error);
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
export const selectedValue = (
  meta: Vertex,
  data: Vertex,
  graph: Store<GraphInterface>,
): number[] => {
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
export function collectionNameDisplayExpr(
  graph: Store<GraphInterface>,
  collection?: string,
) {
  if (!collection) {
    return;
  }
  const collectionVertex = findVertexByLabelAndUniqueId(
    "Coll",
    "name",
    collection,
    graph,
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
  let { component, title, txnId, isRealTime, disabled, meta, data, setValue } =
    props;
  const { Ws } = useContext(WsContext);
  const [graph, setGraph] = useContext(GraphContext)!;
  let { record } = useContext(FormContext);

  // @ts-ignore
  const [selectOptions, { refetch }] = createResource(
    () => {
      let value = getValueFromVertexOrKey(meta.P.props, "items");
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
        // if (disabled) {
        //   return selectedValue(meta, data).map((vertexId) => graph.vertexes[vertexId]);
        // }

        const collection =
          getChildVertex(graph, ["$0Coll"], meta).vertex?.["P"]?.["name"] ||
          getValueFromVertexOrKey(meta.P.props, "collection");
        if (!collection) {
          return [];
        }
        return (
          getSelectionOptions(graph, setGraph, [data as Vertex], collection)
            .vertexes || []
        );
      }
    },
    (data) => data,
  );

  function getComponent() {
    let direction = meta.P.dir;
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

        if (!data) {
          return;
        }
        if (isRealTime) {
          txnId = getNewTxnId();
        }
        if (getValueFromVertexOrKey(meta.P.props, "stringValue")) {
          setValue
            ? setValue(optionvalue)
            : setValueGlobal(
                graph,
                setGraph,
                txnId!,
                meta,
                data,
                data,
                Ws,
                false,
              );
        } else if (getValueFromVertexOrKey(meta.P.props, "items")) {
          setValue
            ? setValue(optionvalue)
            : setValueGlobal(
                graph,
                setGraph,
                txnId!,
                meta,
                data,
                data,
                Ws,
                false,
              );
        } else if (getValueFromVertexOrKey(meta.P.props, "inward")) {
          setParentValue(graph, setGraph, txnId || 0, data, meta, optionId);
        } else {
          setSelectionValue(txnId || 0, data, graph, setGraph, meta, optionId);
        }
        onChangeHandler(
          txnId || 0,
          record?.vertex,
          data,
          meta,
          graph,
          setGraph,
        );
        if (isRealTime) commitTxn(txnId || 0, Ws);
      });
    });
  };
  const outerOwner = getOwner();
  return (
    <div aria-labeledby={props["aria-labeledby"]}>
      <Show
        when={!disabled}
        fallback={
          <For each={selectedValue(meta, data as Vertex, graph)}>
            {(vertexId) => (
              <>
                {
                  getSelectionOptions(
                    graph,
                    setGraph,
                    [graph.vertexes[vertexId]],
                    getValueFromVertexOrKey(meta.P.props, "displayExpr") ||
                      `::'P.${IdAttr}'`,
                  ).vertexes
                }
              </>
            )}
          </For>
        }
      >
        <MultiSelect
          isObject
          displayValueParent="P"
          disable={disabled!}
          displayValueChild="name"
          options={selectOptions()}
          avoidHighlightFirstOption
          placeholder={`${title}`}
          onSelect={(e) => onChangeSelect(e, false)}
          onRemove={(e) => onChangeSelect(e, true)}
          customCloseIcon={<Icon icon={"ic:round-close"} />}
          selectionLimit={getComponent() == "SelectBox" ? 1 : 1000}
          selectedValues={
            selectedValue(meta, data as Vertex, graph).map((id) => {
              return graph.vertexes[id];
            }) as any
          }
        />
      </Show>

      {/* Todo: think about validations */}
    </div>
  );
}
