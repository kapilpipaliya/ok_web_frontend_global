import {
  batch,
  createSignal,
  For,
  getOwner,
  runWithOwner,
  Show,
  useContext,
} from "solid-js";

import {
  GraphContext,
  type Id,
  IdAttr,
  type Vertex,
} from "~/lib/graph/graph";
import { commitTxn, getNewTxnId } from "~/lib/graph/transaction";
import { WsContext } from "~/lib/websocket/ws_events_dispatcher";
import {
  getChildVertex,
  getSelectionOptions,
} from "~/lib/graph/get/sync/traverse";
import { setValueGlobal } from "~/lib/graph/mutate/form/setValueGlobal";
import { onChangeHandler } from "~/lib/graph/mutate/form/onChangeHandler";
import type { ComponentProps } from "~/components/fields/ComponentType";
import { MultiSelectField } from "~/components/MultiSelect";
import { setSelectionValue } from "~/lib/graph/mutate/setSelectionValue";
import { setParentValue } from "~/lib/graph/mutate/setParentValue";
import { FormContext } from "~/lib/contexts";
import { getSelectionOptionsMGCall } from "~/cypher/get/getSelectionOptionsMGCall";
import { selectedValue } from "./selectedValue";
import { isValidResponse } from "./isValidResponse";

// displayExpr is required when meta.P.collection is complex
export function SelectInputField(
  props: ComponentProps & {
    component: string;
    title: string;
    txnId?: number;
    isRealTime?: boolean;
  },
) {
  const { Ws } = useContext(WsContext);
  const [graph, setGraph] = useContext(GraphContext)!;
  const formData = useContext(FormContext);
  const [loading, setLoading] = createSignal(false);
  const [options, setOptions] = createSignal([] as any[]);

  const getCollection = () => (
    getChildVertex(graph, ["$0Coll"], props.meta).vertex?.P?.name ||
    props.meta.P.collection
  );

  const getStaticOptions = (value: any) => {
    if (typeof value === "string") return value.split("\n");
    if (Array.isArray(value)) return value;
    return value ? [value] : [];
  };

  const getSelectedOptions = () => {
    return selectedValue(props.meta, props.data as Vertex, graph).map(
      (vertexId) => graph.vertexes[vertexId],
    );
  };

  const getDynamicOptions = () => {
    return getSelectionOptions(graph, setGraph, [props.data as Vertex], getCollection())
      .vertexes || [];
  };

  const loadOptions = async () => {
    let options = [];
    if (props.meta.P.items) {
      options = getStaticOptions(props.meta.P.items);
    } else if (props.disabled) {
      options = getSelectedOptions();
    } else if (getCollection()) {
      setLoading(true);
      const res = await getSelectionOptionsMGCall([props.data as Vertex], getCollection());
      if (isValidResponse(res)) {
        options = res.result || [];
      }
      setLoading(false);
    }
    setOptions(options);
  };

  function getComponent() {
    const direction = props.meta.P.dir;
    if (!props.component && direction) {
      props.component = direction === "->" ? "SelectBox" : "TagBox";
    }
    return props.component;
  }

  const outerOwner = getOwner();

  const onChangeSelect = (e: Vertex[], isRemove: any) => {
    let data: Id[] | Id;
    if (isRemove && getComponent() === "SelectBox") {
      data = [];
    } else if (getComponent() === "SelectBox") {
      data = e[0].id;
    } else {
      data = e.map((e) => e.id);
    }
    runWithOwner(outerOwner, () => {
      batch(() => {
        if (!data) return;
        if (props.isRealTime) {
          props.txnId = getNewTxnId(graph, setGraph);
        }
        if (props.meta.P.stringValue || props.meta.P.items) {
          props.setValue
            ? props.setValue(data)
            : setValueGlobal(
              graph,
              setGraph,
              props.txnId!,
              props.meta,
              props.data!,
              data,
              Ws,
              false,
            );
        } else if (props.meta.P.inward) {
          setParentValue(
            graph,
            setGraph,
            props.txnId ?? 0,
            props.data!,
            props.meta,
            data,
          );
        } else {
          setSelectionValue(
            props.txnId ?? 0,
            props.data!,
            graph,
            setGraph,
            props.meta,
            data,
          );
        }
        onChangeHandler(
          props.txnId ?? 0,
          formData?.formData,
          props.data!,
          props.meta,
          graph,
          setGraph,
        );
        if (props.isRealTime) commitTxn(props.txnId ?? 0, graph);
      });
    });
  };

  return (
    <div>
      <Show
        when={!props.disabled}
        fallback={
          <For each={selectedValue(props.meta, props.data as Vertex, graph)}>
            {(vertexId) => (
              <>
                {
                  getSelectionOptions(
                    graph,
                    setGraph,
                    [graph.vertexes[vertexId]],
                    props.meta.P.displayExpr || `::'P.${IdAttr}'`,
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
            selectedValue(props.meta, props.data as Vertex, graph).map((id) => {
              return graph.vertexes[id];
            })
          }
          disable={props.disabled}
          options={options()}
          onRemove={(e) => onChangeSelect(e, true)}
          onSelect={(e) => onChangeSelect(e, false)}
          placeholder={`${props.title}`}
          loadOptions={loadOptions}
          isLoadingOptions={loading()}
        />
      </Show>
      {/* Todo: think about validations */}
    </div>
  );
}
