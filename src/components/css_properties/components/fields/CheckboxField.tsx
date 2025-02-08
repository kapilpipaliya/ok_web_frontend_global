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

// keep as its used in metadata
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
    "onClick",
  ]);

  const [reference, setReference] = createSignal<HTMLInputElement | null>(null);

  const handleChange = (event: Event) => {
    event.stopPropagation();
    if (others.disabled || others.readOnly) {
      return;
    }
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

  // In HTML, the readonly attribute does not apply to checkboxes.
  // So we need to prevent the default behavior of the checkbox when it is readonly
  const onClick = (event: Event) => {
    if (others.readOnly) {
      event.preventDefault();
      return;
    }
    if (typeof local.onClick === "function") {
      local.onClick(
        event as MouseEvent & {
          currentTarget: HTMLInputElement;
          target: Element;
        },
      );
    }
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
        {...others}
        {...local.inputProps}
        checked={local.value}
        class={`${others.class || ""} ${local.error && local.errorClass ? local.errorClass : ""}`}
        onChange={handleChange}
        onClick={onClick}
        ref={setReference}
        type="checkbox"
      />
    </Show>
  );
};
