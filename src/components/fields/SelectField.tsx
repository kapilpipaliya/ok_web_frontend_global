import {
  batch,
  createMemo,
  createSignal,
  For,
  getOwner,
  runWithOwner,
  Show,
} from "solid-js";

import type { GenericComponentProps } from "~/components/fields/FieldType";

import { MultiSelectField, type Option } from "~/components/MultiSelect";
import { getSelectionOptionsMGCall } from "~/cypher/get/client/getSelectionOptionsMGCall";
import { isValidResponse } from "~/lib/api/isValidResponse";
import { isObject } from "~/lib/data_structure/object/isObject";
import { getSelectionOptions } from "~/lib/graph/get/sync/getSelectionOptions";
import { IdAttr, useGraph, type Vertex } from "~/lib/graph/graph";
import { onChangeHandler } from "~/lib/graph/mutate/form/onChangeHandler";
import { setValueGlobal } from "~/lib/graph/mutate/form/setValueGlobal";
import { commitTxn } from "~/lib/graph/transaction/commitTxn";

import { ensureArray } from "../../lib/data_structure/array/ensureArray";
import { useFormContext } from "../form/FormContext";
import { isStaticOptions } from "./utils/isStaticOptions";
import { selectedValue } from "./utils/selectedValue";
import { setSelectValueHelper } from "./utils/setSelectValueHelper";

// displayExpr is required when meta.P.collection is complex
export function SelectField(
  props: Readonly<
    {
      componentName: string;
      isRealTime?: boolean;
      title: string;
      txnId?: number;
    } & GenericComponentProps
  >,
) {
  const [graph, setGraph] = useGraph();
  const formStore = useFormContext();
  const [loading, setLoading] = createSignal(false);
  const [options, setOptions] = createSignal([] as any[]);

  const getCollection = () =>
    typeof props.meta.P.collection === "function"
      ? props.meta.P.collection()
      : props.meta.P.collection;

  const memoizedOptions = createMemo(() => {
    const options = props.meta.P.options;
    return typeof options === "function" ? options() : options;
  });

  const getStaticOptions = (
    options: { label: string; value: string }[] | string,
  ) => {
    if (typeof options === "string") {
      const lines = options.split("\n");
      return lines.map((item) => {
        const [label, val] = item.split(",");
        if (val === undefined) {
          return props.meta.P.valueKey
            ? { id: label.trim(), label: label.trim() }
            : label.trim();
        }
        return { id: val.trim(), label: label.trim() };
      });
    }
    if (Array.isArray(options)) {
      return options;
    }
    return options ? [options] : [];
  };

  const getSelectedOptions = () => {
    return selectedValue(props.meta, props.data as Vertex, graph).map(
      (vertexId) => graph.vertexes[vertexId],
    );
  };

  const _getDynamicOptions = () => {
    return (
      getSelectionOptions(graph, setGraph, getCollection(), [
        props.data as Vertex,
      ]).vertexes || []
    );
  };

  const loadOptions = async () => {
    let parsedOptions = [];
    if (memoizedOptions()) {
      parsedOptions = getStaticOptions(memoizedOptions());
    } else if (props.disabled) {
      parsedOptions = getSelectedOptions();
    } else if (getCollection()) {
      setLoading(true);
      if (props.meta.P.useLocalStorage) {
        const res = getSelectionOptions(graph, setGraph, getCollection(), [
          props.data as Vertex,
        ]);
        parsedOptions = res.vertexes || [];
      } else {
        const mutationData = props.txnId
          ? commitTxn(props.txnId, graph)
          : undefined;
        const res = await getSelectionOptionsMGCall(
          [props.data as Vertex],
          getCollection(),
          mutationData,
          10,
        );
        if (isValidResponse(res)) {
          parsedOptions = res.result || [];
        }
      }
      setLoading(false);
    }
    setOptions(parsedOptions);
  };

  function getComponent() {
    // TODO: find when the direction is set?
    const direction = props.meta.P.dir;
    if (!props.componentName && direction) {
      return direction === "->" ? "SelectBox" : "TagBox";
    }
    return props.componentName;
  }

  const outerOwner = getOwner();

  const onChangeSelect = (value: Option[], isRemove: boolean) => {
    runWithOwner(outerOwner, () => {
      batch(() => {
        if (!value) {
          return;
        }
        let txnId = props.txnId ?? 0;
        if (props.isRealTime) {
          txnId = graph.newTxnId;
        }
        if (isStaticOptions(props.meta)) {
          let parsedValue;
          if (isRemove) {
            parsedValue = null;
          } else if (getComponent() === "SelectBox") {
            parsedValue = isObject(value[0])
              ? // @ts-expect-error ignore
                value[0][props.meta.P.valueKey || "id"]
              : value[0];
          } else {
            parsedValue = value;
          }
          props.onChange
            ? props.onChange(parsedValue)
            : setValueGlobal(
                graph,
                setGraph,
                txnId,
                props.meta,
                props.data!,
                parsedValue,
                false,
              );
        } else {
          setSelectValueHelper(
            txnId,
            props.meta,
            props.data as Vertex,
            getComponent(),
            value,
            isRemove,
            graph,
            setGraph,
          );
        }
        onChangeHandler(
          txnId,
          formStore[0]!.formData!,
          props.data!,
          props.meta,
          graph,
          setGraph,
        );
        if (props.isRealTime) {
          commitTxn(txnId, graph);
        }
      });
    });
  };

  return (
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
        childrenKey={props.meta.P.childrenKey}
        disable={props.disabled}
        displayValueKey={
          props.meta.P.labelKey
            ? props.meta.P.labelKey
            : "::'P.displayName'||::'P.name'||::'P.id'||::'label'"
        }
        isLoadingOptions={loading()}
        loadOptions={loadOptions}
        onRemove={(e) => onChangeSelect(e, true)}
        onSelect={(e) => onChangeSelect(e, false)}
        options={options()}
        optionValueKey={props.meta.P.valueKey ? props.meta.P.valueKey : "id"}
        placeholder={`${props.title}`}
        renderLabel={props.meta.P.renderLabel}
        selectedValues={() => {
          if (isStaticOptions(props.meta)) {
            const value = props.data?.P[props.meta.P[IdAttr]];
            if (!value) {
              return [];
            }
            if (!Array.isArray(value) && getComponent() === "SelectBox") {
              const option = options().find(
                (option) =>
                  (value?.[props.meta.P.valueKey ?? "id"] || value) ===
                  (option?.[props.meta.P.valueKey ?? "id"] || option),
              );
              return option ? [option] : [{ label: value, value }];
            }
            return ensureArray(value);
          }
          return selectedValue(props.meta, props.data as Vertex, graph).map(
            (id) => {
              return graph.vertexes[id];
            },
          );
        }}
        selectionLimit={getComponent() === "SelectBox" ? 1 : undefined}
      />
    </Show>
  );
}
