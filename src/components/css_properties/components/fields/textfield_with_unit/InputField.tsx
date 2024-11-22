import { type JSX, splitProps } from "solid-js";

import { getValueWithoutUnits } from "../../../../../lib/data_structure/number/getValueWithoutUnits";

interface InputFieldProps extends JSX.InputHTMLAttributes<HTMLInputElement> {
  handleChange: (event: Event) => void;
  inputProps?: JSX.InputHTMLAttributes<HTMLInputElement>;
  label?: string;
  placeholder?: string;
  type?: string;
  value: string;
}

export function InputField(props: Readonly<InputFieldProps>) {
  const [local, others] = splitProps(props, [
    "class",
    "value",
    "handleChange",
    "label",
    "type",
    "placeholder",
    "inputProps",
  ]);

  const InnerInput = () => (
    <input
      class={`${local.class ?? ""} f:14 outline:none p:5 w:100%`}
      onInput={local.handleChange}
      placeholder={local.type === "number" ? "0" : (local.placeholder ?? "")}
      step="any"
      type={local.type || "text"}
      value={
        local.type === "number"
          ? getValueWithoutUnits(local.value)
          : local.value || ""
      }
      {...local.inputProps}
      {...others}
    />
  );

  return <InnerInput />;
}
