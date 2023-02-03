import {createEffect, createSignal, createUniqueId, For, JSX, Show, splitProps} from "solid-js";

import { createAsyncOptions, Select } from "@thisbeyond/solid-select";
import "./select.css";
import { Value } from "@thisbeyond/solid-select/dist/types/create-select";
import {path} from 'rambda';

interface Option {
  [key: string]: any;

  id: string;
}

type SelectParams = Parameters<typeof Select>[0];

export interface SelectInputFieldProps extends Omit<SelectParams, "options"> {
  control: ReturnType<typeof createFormControl>;
  fetchOptions: (inputValue: string) => Promise<any[]>;
  displayExpr: string;
}

export function SelectInputField(props: SelectInputFieldProps) {
  const [p, customProps] = splitProps(props, ["control", "fetchOptions", "displayExpr"]);

  const selectOptionProps = createAsyncOptions(p.fetchOptions);

  // normalize fetched Options
  const [normalizedAttributeSelectOptions, setNormalizedAttributeSelectOptions] = createSignal({});

  createEffect(() => {
    if (selectOptionProps.options) {
      setNormalizedAttributeSelectOptions(
        selectOptionProps.options.reduce((acc, curr) => {
          if(!curr) return acc;
          acc[curr.id] = curr;
          return acc;
        }, {})
      );
    }
  });

  const initialValue = props.value;
  let runOnce = false;
  // solid-select has bug that call onChange when we set initialValue
  const onChange = (value: Value) => {
    if (!runOnce && value === initialValue) {
      runOnce = true;
    } else {
      props.setValue(value);
    }
  };

  return (
    <div>
      <Select
        {...selectOptionProps}
        initialValue={props.value}
        onChange={onChange}
        // hack to Re-fetch Options
        onFocus={()=>selectOptionProps.onInput(createUniqueId())}
        disabled={props.disabled}
        optionToValue={(option: Option) => {
          return option.id; // ["id"]
        }}
        format={(optionOrValue, type) => {
          // value is displayed in the input; option is displayed in the list
          if (type === "option") {
            return path(p.displayExpr || 'id', optionOrValue || {});
          } else {
            if (optionOrValue) {
              // @ts-ignore
              return path(p.displayExpr || 'id', normalizedAttributeSelectOptions()[optionOrValue] || {});
            } else {
              return optionOrValue;
            }
          }
        }}
        {...customProps}
      />
      <Show when={props.errors}>
        <For each={Object.values(props.errors!)}>{(errorMsg: string) => <small>{errorMsg}</small>}</For>
      </Show>
    </div>
  );
}
