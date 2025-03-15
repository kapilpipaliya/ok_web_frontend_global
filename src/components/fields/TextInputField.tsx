// import { TextFieldWithSelect } from "./TextFieldWithSelect";
import type { JSXElement } from "solid-js";

import { mergeRefs } from "@solid-primitives/refs";
import {
  createSignal,
  type JSX,
  Match,
  Show,
  splitProps,
  Switch,
} from "solid-js";

import { FunctionArgumentType } from "../form/type/FieldSchemaType";

export interface FormInputField extends Field {
  description?: GenericField | string;
  disabled?: boolean;
  hideLabel?: boolean;
  importantInfo?: string;
  initialValue?: (options: FunctionArgumentType) => any;
  isViewMode?: boolean;
  label?: string;
  labelClass?: string;
  labelInline?: boolean;
  labelLayoutClass?: string;
  labelPosition?: LabelPosition;
  maxLength?: number;
  minLength?: number;
  name: string;
  noRequiredIndicator?: boolean;
  onChange?: (options: FunctionArgumentType) => void;
  placeholder?: string;
  readOnly?: boolean;
  // regex?: RegexValidation[];
  // required?: RequiredFnType;
  // tooltip?: GenericField | string;
  value?: any;
}

export interface TextInputFieldMeta extends FormInputField {
  componentName: "textInputField";
  hideUnit?: boolean;
  inputProps?: Record<string, any>;
  leftIcon?: JSXElement;
  placeholder?: string;
  selectContainerClass?: string;
  showValue?: boolean;
  suffixToValue?: string;
  type?: string;
  unitOptions?: string[];
}

interface TextInputFieldProps
  extends Omit<
      JSX.InputHTMLAttributes<HTMLInputElement>,
      "children" | "hidden" | "name" | "onChange" | "required" | "value"
    >,
    TextInputFieldMeta {
  onChange?: (value: string) => void;
  onViewClick?: () => void;
}

export function TextInputField(props: Readonly<TextInputFieldProps>) {
  const [local, others] = splitProps(props, [
    "id",
    "componentName",
    "onChange",
    "value",
    "onChange",
    "inputProps",
    "error",
    "errorClass",
    "isViewMode",
    "onViewClick",
    "viewModeClass",
    "showValue",
    "suffixToValue",
    "hidden",
    "required",
  ]);

  const [reference, setReference] = createSignal<HTMLInputElement | null>(null);

  const handleChange = (event: Event) => {
    event.stopPropagation();
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

  const Content = () => {
    return (
      <Switch>
        <Match when={others.unitOptions}>
          {/* <TextFieldWithSelect
            {...others}
            {...local.inputProps}
            class={`${others.class || ""} ${local.error && local.errorClass ? local.errorClass : ""}`}
            onChange={local.onChange}
            ref={setReference}
            value={local.value ?? ""}
          /> */}
        </Match>
        <Match when={true}>
          <input
            {...others}
            {...local.inputProps}
            autocomplete="off"
            class={`${others.class || ""} ${local.error && local.errorClass ? local.errorClass : ""}`}
            onChange={handleChange}
            ref={mergeRefs(setReference, others.ref)}
            value={local.value ?? ""}
          />
        </Match>
      </Switch>
    );
  };

  return (
    <Switch>
      <Match when={local.isViewMode}>
        <div class={local.viewModeClass || ""} onClick={handleViewClick}>
          {local.value || "\u200B"}
          {local.suffixToValue ? ` ${local.suffixToValue}` : ""}
        </div>
      </Match>
      <Match when={local.showValue}>
        <div class="w-full">
          <Content />
          <Show when={local.showValue && local.value}>
            <div class="text-sm text-gray-600">
              {local.value}
              {local.suffixToValue ? ` ${local.suffixToValue}` : ""}
            </div>
          </Show>
        </div>
      </Match>
      <Match when={!local.isViewMode}>
        <Content />
      </Match>
    </Switch>
  );
}
