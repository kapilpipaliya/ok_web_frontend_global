import { type JSX, splitProps } from "solid-js";

import { runEvent } from "../tools";

export type SelectProps = JSX.SelectHTMLAttributes<HTMLSelectElement> & {
  label: JSX.Element;
  setValue?: (value: string) => void;
};

export function Select(props: Readonly<SelectProps>) {
  const [local, fieldProps] = splitProps(props, [
    "aria-orientation",
    "label",
    "onChange",
    "setValue",
    "value",
  ]);
  return (
    <label
      aria-orientation={local["aria-orientation"]}
      classList={{ disabled: props.disabled, "sb-select": true }}
    >
      <span class="sb-select-label">{local.label}</span>
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
