import { type JSX, Show, splitProps } from "solid-js";

import type { TextFieldOptionsField } from "../../constants/FieldType";

import { getValueWithoutUnits } from "./getValueWithoutUnits";

interface InputFieldProps extends JSX.InputHTMLAttributes<HTMLInputElement> {
  handleChange: (event: Event) => void;
  meta: TextFieldOptionsField;
  selectedValue: () => string;
} 

export function InputField(props: InputFieldProps) {
  const [local, others] = splitProps(props, [
    "class",
    "meta",
    "selectedValue",
    "handleChange",
  ]);

  const InnerInput = () => (
    <input
      class={`${local.class ?? ""} ${local.meta.showInside ? 'outline:none p:5' : ''} f:14 w:100%`}
      onInput={local.handleChange}
      placeholder={local.meta.type === "number" ? "0" : local.meta.placeholder ?? ""}
      step="any"
      type={local.meta.type || "text"}
      value={local.meta.type === "number" ? getValueWithoutUnits(local.selectedValue()) : local.selectedValue()}
      {...local.meta.inputProps}
      {...others}
    />
  );

  return (
    <Show
      fallback={
        <label>
          {local.meta.label}
          <InnerInput />
        </label>
      }
      when={local.meta.showInside}
    >
      <InnerInput />
    </Show>
  );
}
