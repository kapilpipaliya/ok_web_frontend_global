import {
  type Component,
  createSignal,
  type JSX,
  Show,
  splitProps,
} from "solid-js";

import type { TextFieldOptionsField } from "../../constants/FieldSchemaType";

interface CheckboxFieldProps
  extends Omit<JSX.InputHTMLAttributes<HTMLInputElement>, "onChange" | "value">,
    TextFieldOptionsField {
  errorClass?: string;
  inputProps: JSX.InputHTMLAttributes<HTMLInputElement>;
  isViewMode?: boolean;
  onchange?: (event: Event) => void;
  onViewClick?: () => void;
  viewModeClass?: string;
}

export const CheckboxField: Component<CheckboxFieldProps> = (props) => {
  const [local, others] = splitProps(props, [
    "id",
    "componentName",
    "onChange",
    "value",
    "inputProps",
    "error",
    "errorClass",
    "isViewMode",
    "onViewClick",
    "viewModeClass",
  ]);

  const [reference, setReference] = createSignal<HTMLInputElement | null>(null);

  const handleChange = (event: Event) => {
    const target = event.target as HTMLInputElement | HTMLTextAreaElement;
    local.onChange?.((target as HTMLInputElement).checked);
  };

  const handleViewClick = () => {
    if (local.onViewClick) {
      local.onViewClick();
    }
    setTimeout(() => {
      reference()?.focus();
    }, 100);
  };

  return (
    <Show
      fallback={
        <div class={local.viewModeClass || ""} onClick={handleViewClick}>
          {local.value ? "Yes" : "No"}
        </div>
      }
      when={!local.isViewMode}
    >
      <input
        type="checkbox"
        {...others}
        {...local.inputProps}
        checked={local.value}
        class={`${others.class || ""} ${local.error && local.errorClass ? local.errorClass : ""}`}
        onChange={handleChange}
        ref={setReference}
      />
    </Show>
  );
};
