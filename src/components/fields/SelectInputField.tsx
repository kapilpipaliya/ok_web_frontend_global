import {
  batch,
  For,
  getOwner,
  onMount,
  runWithOwner,
  Show,
  splitProps,
  untrack,
  useContext,
} from "solid-js";

// Comment This Lines in web build
import {
  GraphContext,
  type GraphInterface,
  type Id,
  IdAttr,
  type Vertex,
} from "~/lib/graph/graph";
import { commitTxn, getNewTxnId } from "~/lib/graph/transaction";
import { WsContext } from "~/lib/websocket/ws_events_dispatcher";
import {
  getChildVertex,
  getParentVertexValue,
  getSelectedVertexValue,
  getSelectionOptions,
} from "~/lib/graph/get/sync/traverse";
import { setValueGlobal } from "~/lib/graph/mutate/form/setValueGlobal";
import { onChangeHandler } from "~/lib/graph/mutate/form/onChangeHandler";
import type { ComponentProps } from "~/components/fields/ComponentType";
import type { Store } from "solid-js/store";
import { findVertexByLabelAndUniqueId } from "~/lib/graph/get/sync/findVertex";
import { getNameKeyForCollection } from "~/lib/graph/get/sync/graph_functions";
import { setGraphData } from "~/lib/websocket/ws_events";
import {MultiSelectField} from "~/components/MultiSelect";
import { setSelectionValue } from "~/lib/graph/mutate/setSelectionValue";
import { setParentValue } from "~/lib/graph/mutate/setParentValue";
import { FormContext } from "~/lib/contexts";
import {getSelectionOptionsMGCall} from "~/cypher/get/getSelectionOptionsMGCall";

export function ensureArray(value: any) {
  if (Array.isArray(value)) {
    return value;
  }
  return value ? [value] : [];
}
export function selectedValue(
  meta: Vertex,
  data: Vertex,
  graph: Store<GraphInterface>,
): Id[] {
  if (
    meta.P.stringValue ||
    meta.P.items
  ) {
    // this is causing maximum call stack error when selecting an option
    return untrack(() => {
      return ensureArray(data.P[meta.P[IdAttr]]);
    });
  }
  try {
    // when new row added or modified this gives error.
    return meta.P.inward
      ? getParentVertexValue(graph, data, meta)
      : getSelectedVertexValue(graph, data, meta);
  } catch (e) {
    return [];
  }
}

// if meta.P["collection"] is simple string
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
    }
    return nameKeys.map((name) => `$P.${name}`).join(" ");
  }
  return;
}

// displayExpr is required when meta.P.collection is complex
export function SelectInputField(
  props: ComponentProps & {
    component: string;
    title: string;
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

  const selectOptions = () => {
    const value = field.meta.P.items;

    if (value) {
      return handleValue(value);
    }

    return handleNoValue();
  };

  const handleValue = (value: any) => {
    if (typeof value === "string") {
      return value.split("\n");
    }

    if (Array.isArray(value)) {
      return value;
    }

    return value ? [value] : [];
  };

  const handleNoValue = () => {
    if (field.disabled) {
      return getSelectedOptions();
    }

    const collection = getCollection();
    if (!collection) {
      return [];
    }

    return (
      getSelectionOptions(graph, setGraph, [field.data as Vertex], collection)
        .vertexes || []
    );
  };
  onMount(() => {
    const collection = getCollection();
    getSelectionOptionsMGCall([field.data as Vertex], collection).then(
      (res) => {
        if (isValidResponse(res)) {
          setGraphData(graph, setGraph, res.graph);
        }
      },
    );
  });

  const getSelectedOptions = () => {
    return selectedValue(field.meta, field.data as Vertex, graph).map(
      (vertexId) => graph.vertexes[vertexId],
    );
  };

  const getCollection = () => {
    return (
      getChildVertex(graph, ["$0Coll"], field.meta).vertex?.P?.name ||
      field.meta.P.collection
    );
  };

  const isValidResponse = (res: any) => {
    return !res.error && res.statusCode !== 500;
  };

  onMount(() => {
    selectOptions();
  });

  function getComponent() {
    const direction = field.meta.P.dir;
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
    let data: Id[] | Id;
    let optionvalue: any;
    if (isRemove && getComponent() === "SelectBox") {
      data = [];
    } else if (getComponent() === "SelectBox") {
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
        if (field.meta.P.stringValue) {
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
        } else if (field.meta.P.items) {
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
        } else if (field.meta.P.inward) {
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
    <div>
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
                    field.meta.P.displayExpr || `::'P.${IdAttr}'`,
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
          selectedValues={() =>
            selectedValue(field.meta, field.data as Vertex, graph).map((id) => {
              return graph.vertexes[id];
            })
          }
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
