import {
  For,
  Show,
  batch,
  createSignal,
  getOwner,
  runWithOwner,
  
} from "solid-js";

import type { ComponentProps } from "~/components/fields/ComponentType";

import { MultiSelectField, type Option } from "~/components/MultiSelect";
import { getSelectionOptionsMGCall } from "~/cypher/get/getSelectionOptionsMGCall";
import { isValidResponse } from "~/lib/api/isValidResponse";
import { useFormContext } from "~/lib/contexts";
import { getSelectionOptions } from "~/lib/graph/get/sync/getSelectionOptions";
import {
  IdAttr,
  type Vertex,
  useGraph,
} from "~/lib/graph/graph";
import { onChangeHandler } from "~/lib/graph/mutate/form/onChangeHandler";
import { setValueGlobal } from "~/lib/graph/mutate/form/setValueGlobal";
import { commitTxn } from "~/lib/graph/transaction/commitTxn";

import { ensureArray } from "./ensureArray";
import { selectedValue } from "./selectedValue";
import { setSelectValueHelper } from "./setSelectValueHelper";

// displayExpr is required when meta.P.collection is complex
export function SelectInputField(
  props: {
    componentName: string;
    isRealTime?: boolean;
    title: string;
    txnId?: number;
  } & ComponentProps,
) {
  const [graph, setGraph] = useGraph();
  const formData = useFormContext();
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
    return getSelectionOptions(graph, setGraph, getCollection(), [props.data as Vertex])
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
    // TODO: find when the direction is set?
    const direction = props.meta.P.dir;
    if (!props.componentName && direction) {
      props.componentName = direction === "->" ? "SelectBox" : "TagBox";
    }
    return props.componentName;
  }

  const outerOwner = getOwner();

  const onChangeSelect = (value: Option[], isRemove: boolean) => {
    runWithOwner(outerOwner, () => {
      batch(() => {
        if (!value) return;
        if (props.isRealTime) {
          props.txnId = graph.newTxnId;
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
          setSelectValueHelper(props.txnId ?? 0, props.meta, props.data as Vertex, getComponent(), value, isRemove, graph, setGraph);
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
                    props.meta.P.displayExpr || `::'P.${IdAttr}'`,
                    [graph.vertexes[vertexId]],
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
