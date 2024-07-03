import {
  For,
  Show,
  batch,
  createSignal,
  getOwner,
  runWithOwner,
  useContext,
} from "solid-js";

import type { ComponentProps } from "~/components/fields/ComponentType";

import { MultiSelectField } from "~/components/MultiSelect";
import { getSelectionOptionsMGCall } from "~/cypher/get/getSelectionOptionsMGCall";
import { FormContext } from "~/lib/contexts";
import {
  getSelectionOptions,
} from "~/lib/graph/get/sync/traverse";
import {
  GraphContext,
  type Id,
  IdAttr,
  type Vertex,
} from "~/lib/graph/graph";
import { onChangeHandler } from "~/lib/graph/mutate/form/onChangeHandler";
import { setValueGlobal } from "~/lib/graph/mutate/form/setValueGlobal";
import { setParentValue } from "~/lib/graph/mutate/setParentValue";
import { setSelectionValue } from "~/lib/graph/mutate/setSelectionValue";
import { commitTxn, getNewTxnId } from "~/lib/graph/transaction";

import { ensureArray } from "./ensureArray";
import { isValidResponse } from "./isValidResponse";
import { selectedValue } from "./selectedValue";

// displayExpr is required when meta.P.collection is complex
export function SelectInputField(
  props: {
    component: string;
    isRealTime?: boolean;
    title: string;
    txnId?: number;
  } & ComponentProps,
) {
  const [graph, setGraph] = useContext(GraphContext)!;
  const formData = useContext(FormContext);
  const [loading, setLoading] = createSignal(false);
  const [options, setOptions] = createSignal([] as any[]);

  const getCollection = () => (
    typeof props.meta.P.collection === 'function' ? props.meta.P.collection() : props.meta.P.collection
  );

  const isCommaSeparated = () => props.meta.P.options?.includes(",");

  const getStaticOptions = (options: { label: string; value: string; }[] | string) => {
    if (typeof options === "string") {
      const lines = options.split("\n");
      return lines.map((item) => {
        const [label, val] = item.split(",");
        if (val === undefined) {
          return !isCommaSeparated() ? label.trim() : { label: label.trim(), value: label.trim() };
        }
        return { label: label.trim(), value: val.trim() };
      });
    }
    if (Array.isArray(options)) return options;
    return options ? [options] : [];
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
    let parsedOptions = [];
    if (props.meta.P.options) {
      parsedOptions = getStaticOptions(props.meta.P.options);
    } else if (props.disabled) {
      parsedOptions = getSelectedOptions();
    } else if (getCollection()) {
      setLoading(true);
      const mutationData = props.txnId ? commitTxn(props.txnId, graph) : undefined;
      const res = await getSelectionOptionsMGCall([props.data as Vertex], getCollection(), mutationData, 10);
      if (isValidResponse(res)) {
        parsedOptions = res.result || [];
      }
      setLoading(false);
    }
    setOptions(parsedOptions);
  };

  function getComponent() {
    const direction = props.meta.P.dir;
    if (!props.component && direction) {
      props.component = direction === "->" ? "SelectBox" : "TagBox";
    }
    return props.component;
  }

  const outerOwner = getOwner();

  const onChangeSelect = (value: Vertex[], isRemove: any) => {
    runWithOwner(outerOwner, () => {
      batch(() => {
        if (!value) return;
        if (props.isRealTime) {
          props.txnId = getNewTxnId(graph, setGraph);
        }
        if (props.meta.P.options || props.meta.P.saveValue) {
          let parsedValue;
          if (isRemove) {
            parsedValue = null;
          } else if (getComponent() === "SelectBox") {
            // @ts-ignore
            parsedValue = isCommaSeparated() ? value[0]["value"] : value[0];
          } else {
            parsedValue = value;
          }
          props.setValue
            ? props.setValue(parsedValue)
            : setValueGlobal(
              graph,
              setGraph,
              props.txnId!,
              props.meta,
              props.data!,
              parsedValue,
              false,
            );
        } else {
          let data: Id | Id[];
          if (isRemove && getComponent() === "SelectBox") {
            data = [];
          } else if (getComponent() === "SelectBox") {
            data = value[0].id;
          } else {
            data = value.map((e) => e.id);
          }
          if (props.meta.P.inward) {
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
        when={!props.disabled}
      >
        <MultiSelectField
          disable={props.disabled}
          displayValueChild={!isCommaSeparated() ? "displayName" : undefined}
          displayValueParent={!isCommaSeparated() ? "P" : undefined}
          isLoadingOptions={loading()}
          loadOptions={loadOptions}
          onRemove={(e) => onChangeSelect(e, true)}
          onSelect={(e) => onChangeSelect(e, false)}
          optionValueKey={!isCommaSeparated() ? "id" : undefined}
          options={options()}
          placeholder={`${props.title}`}
          selectedValues={() => {
            if (!props.meta.P.options && !props.meta.P.saveValue) {
              return selectedValue(props.meta, props.data as Vertex, graph).map((id) => {
                return graph.vertexes[id];
              });
            } else {
              const value = props.data?.P[props.meta.P[IdAttr]];
              if(!value) return [];
              if (!Array.isArray(value) && isCommaSeparated() && getComponent() === "SelectBox") {
                const option = options().find((option) => (value?.value || value) === (option?.value || option));
                return option ? [option] : [{label: value, value}];
              }
              return ensureArray(value);
            }
          }
          }
          selectionLimit={getComponent() === "SelectBox" ? 1 : undefined}
        />
      </Show>
      {/* Todo: think about validations */}
    </div>
  );
}
