import {
  type Component,
  createSignal,
  type JSX,
  Show,
  splitProps,
} from "solid-js";

import type { TextFieldOptionsField } from "../../constants/FieldSchemaType";

interface TextAreaFieldProps
  extends Omit<
      JSX.TextareaHTMLAttributes<HTMLTextAreaElement>,
      "onChange" | "value"
    >,
    TextFieldOptionsField {
  errorClass?: string;
  inputProps?: JSX.TextareaHTMLAttributes<HTMLTextAreaElement>;
  isViewMode?: boolean;
  onViewClick?: () => void;
  rows?: number;
  viewModeClass?: string;
}

export const TextAreaField: Component<TextAreaFieldProps> = (props) => {
  const [local, others] = splitProps(props, [
    "id",
    "componentName",
    "onChange",
    "value",
    "onChange",
    "inputProps",
    "rows",
    "error",
    "errorClass",
    "isViewMode",
    "onViewClick",
    "viewModeClass",
  ]);

  const [reference, setReference] = createSignal<HTMLTextAreaElement | null>(
    null,
  );

  const handleChange = (event: Event) => {
    const target = event.target as HTMLInputElement | HTMLTextAreaElement;
    local.onChange?.(target.value);
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
          {local.value || "\u200B"}
        </div>
      }
      when={!local.isViewMode}
    >
      <textarea
        {...others}
        {...local.inputProps}
        class={`${others.class || ""} ${local.error && local.errorClass ? local.errorClass : ""}`}
        onChange={handleChange}
        ref={setReference}
        value={local.value ?? ""}
      />
    </Show>
  );
};
