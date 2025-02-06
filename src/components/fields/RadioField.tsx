import { type Component, type JSX, splitProps } from "solid-js";

import type { GenericComponentProps } from "./FieldType";

import { useRadioGroupContext } from "./contexts/RadioGroupContext";

interface RadioFieldProps
  extends GenericComponentProps,
    Omit<JSX.InputHTMLAttributes<HTMLInputElement>, "onChange" | "value"> {
  errorClass?: string;
  inputProps: JSX.InputHTMLAttributes<HTMLInputElement>;
}

export const RadioField: Component<RadioFieldProps> = (props) => {
  const [local, others] = splitProps(props, [
    "id",
    "componentName",
    "onChange",
    "value",
    "onchange",
    "inputProps",
    "error",
    "errorClass",
  ]);

  const radioGroupRootContext = useRadioGroupContext();
  const handleChange = (event: Event) => {
    const target = event.target as HTMLInputElement;
    if (!target.checked) {
      return;
    }
    if (radioGroupRootContext?.[0].onChange) {
      radioGroupRootContext[0].onChange(local.id);
    } else {
      local.onChange?.(local.id);
    }
  };
  return (
    <input
      type="radio"
      {...others}
      checked={
        radioGroupRootContext?.[0].isSelected
          ? radioGroupRootContext[0].isSelected(local.id || "")
          : local.value
      }
      class={`${others.class || ""} ${local.error && local.errorClass ? local.errorClass : ""}`}
      onChange={handleChange}
    />
  );
};
