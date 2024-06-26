import { type JSX, splitProps } from "solid-js";

import { runEvent } from "../tools";

import "./select.css";

export type SelectProps = JSX.SelectHTMLAttributes<HTMLSelectElement> & {
  label: JSX.Element;
  setValue?: (value: string) => void;
};

export function Select(props: SelectProps) {
  const [local, fieldProps] = splitProps(props, [
    "aria-orientation",
    "label",
    "onChange",
    "setValue",
    "value",
  ]);
  return (
    <label
      classList={{ "sb-select": true, disabled: props.disabled }}
      aria-orientation={local["aria-orientation"]}
    >
      {/* <span class="sb-select-label">{local.label}</span> */}
      <select
        {...fieldProps}
        onChange={(ev): void => {
          runEvent(ev, local.onChange);
          local.setValue?.(ev.currentTarget.value);
        }}
      />
    </label>
  );
}
