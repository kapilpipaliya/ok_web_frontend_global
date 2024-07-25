import { Show } from "solid-js";

import type { TextFieldOptionsField } from "../../constants/FieldType";

import { getValueWithoutUnits } from "./getValueWithoutUnits";
interface InputFieldProps { handleChange: (event: Event) => void; meta: TextFieldOptionsField; selectedValue: () => string; }

export function InputField(props: InputFieldProps) {
  return (
    <Show
      fallback={<label>
        {props.meta.label}
        <input
          class={"f:14 w:100%"}
          onInput={props.handleChange}
          placeholder={`${props.meta.type === "number" ? "0" : props.meta.placeholder ?? ""}`}
          step="any"
          type={props.meta.type || "text"}
          value={props.meta.type === "number" ? getValueWithoutUnits(props.selectedValue()) : props.selectedValue()}
          {...props.meta.inputProps} />
      </label>}
      when={props.meta.showInside}
    >
      <input
        class="f:14 outline:none p:5 w:100%"
        onInput={props.handleChange}
        placeholder={`${props.meta.type === "number" ? "0" : props.meta.placeholder ?? ""}`}
        step="any"
        type={props.meta.type || "text"}
        value={props.meta.type === "number" ? getValueWithoutUnits(
          props.meta.value ? props.meta.value() : props.selectedValue()
        ) : props.selectedValue()}
        {...props.meta.inputProps} />
    </Show>
  );
}
