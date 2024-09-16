import { type JSX, Show, splitProps } from "solid-js";

import type { TextFieldOptionsField } from "~/components/css_properties/constants/FieldSchemaType";

import { getValueWithoutUnits } from "../../../../../lib/data_structure/number/getValueWithoutUnits";

interface InputFieldProps extends JSX.InputHTMLAttributes<HTMLInputElement> {
  handleChange: (event: Event) => void;
  value: string;
  showInside?: boolean;
  label?: string;
  type?: string;
  placeholder?: string;
  inputProps?: JSX.InputHTMLAttributes<HTMLInputElement>;
}

export function InputField(props: Readonly<InputFieldProps>) {
  const [local, others] = splitProps(props, [
    "class",
    "value",
    "handleChange",
    "showInside",
    "label",
    "type",
    "placeholder",
    "inputProps",
  ]);

  const InnerInput = () => (
    <input
      class={`${local.class ?? ""} ${local.showInside ?? true ? "outline:none p:5" : ""} f:14 w:100%`}
      onInput={local.handleChange}
      placeholder={
        local.type === "number" ? "0" : local.placeholder ?? ""
      }
      step="any"
      type={local.type || "text"}
      value={
        local.type === "number"
          ? getValueWithoutUnits(local.value)
          : local.value
      }
      {...local.inputProps}
      {...others}
    />
  );

  return (
    <Show
      fallback={
        <label>
          {local.label}
          <InnerInput />
        </label>
      }
      when={local.showInside ?? true}
    >
      <InnerInput />
    </Show>
  );
}
