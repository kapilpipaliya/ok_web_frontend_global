// import { TextFieldWithSelect } from "./TextFieldWithSelect";
import type { JSXElement } from "solid-js";
import {
  createSignal,
  type JSX,
  Match,
  Show,
  splitProps,
  Switch,
} from "solid-js";

import { mergeRefs } from "@solid-primitives/refs";

import { usePageRenderContext } from "~/features/page_attr_render/context/PageRenderContext";
import { getLastItem } from "~/lib/data_structure/array/getLastItem";

import type { FunctionArgumentType } from "../form/type/FieldSchemaType";
import { css } from "~/lib/styles";
import { As } from "../As";

export interface FormInputField {
  description?: string;
  disabled?: boolean;
  hideLabel?: boolean;
  importantInfo?: string;
  initialValue?: (options: FunctionArgumentType) => unknown;
  isViewMode?: boolean;
  label?: string;
  labelClass?: string;
  labelInline?: boolean;
  labelLayoutClass?: string;
  labelPosition?: string;
  maxLength?: number;
  minLength?: number;
  noRequiredIndicator?: boolean;
  placeholder?: string;
  readOnly?: boolean;
  // regex?: RegexValidation[];
  // required?: boolean;
  // tooltip?: string;
  value?: string | number;
}

export interface TextInputFieldMeta extends FormInputField {
  hideUnit?: boolean;
  inputProps?: Record<string, unknown>;
  leftIcon?: JSXElement;
  placeholder?: string;
  selectContainerClass?: string;
  showValue?: boolean;
  suffixToValue?: string;
  type?: string;
  unitOptions?: string[];
  error?: string;
  errorClass?: string;
  viewModeClass?: string;
  hide?: boolean;
  required?: boolean;
  onChange?: (value: string | number | FileList | boolean) => void;
}

interface TextInputFieldProps extends TextInputFieldMeta {
  class?: string;
  ref?: (element: HTMLInputElement) => void;
  onViewClick?: () => void;
}

export function TextInputField(props: Readonly<TextInputFieldProps>) {
  const [local, otherProps] = splitProps(props, [
    "onChange",
    "value",
    "inputProps",
    "error",
    "errorClass",
    "isViewMode",
    "onViewClick",
    "viewModeClass",
    "showValue",
    "suffixToValue",
    "hide",
    "required",
    "unitOptions",
  ]);

  const [reference, setReference] = createSignal<HTMLInputElement | null>(null);
  const parentItems = usePageRenderContext();
  const parentRenderContext = () => getLastItem(parentItems)?.[0];

  const handleChange = (event: Event) => {
    event.stopPropagation();
    // In HTML, the readonly attribute does not apply to checkboxes.
    // So we need to prevent the default behavior of the checkbox when it is readonly
    if (otherProps.disabled || otherProps.readOnly) {
      return;
    }
    const target = event.target as HTMLInputElement | HTMLTextAreaElement;

    let value: string | number | FileList | boolean = target.value;

    if (props.type === "number") {
      const targetValue = target.value.trim();
      if (targetValue === "") {
        value = "";
      } else {
        const parsedValue = Number.parseFloat(targetValue);
        value = isNaN(parsedValue) ? "" : parsedValue;
      }
    } else if (props.type === "file") {
      const files = (target as HTMLInputElement).files;
      if (files && files.length > 0) {
        value = files;
      } else {
        return; // No files selected, do nothing
      }
    } else if (props.type === "checkbox") {
      value = (target as HTMLInputElement).checked;
    } else if (props.type === "date") {
      // Ensure date is in ISO format for storage
      const dateValue = target.value;
      /*if (dateValue) {
        try {
          // This will convert to ISO format
          const date = new Date(dateValue);
          if (!isNaN(date.getTime())) {
            value = date.toISOString();
          }
        } catch (e) {
          console.error("Invalid date format", e);
        }*/
      value = dateValue;
    }

    // Call either local onChange or parent context onChange
    if (local.onChange) {
      local.onChange(value);
    } else {
      parentRenderContext()?.context.onChange?.(value);
    }

    // Force the input value to update the props.value,
    // In SolidJs when the component prop value is not changed, its value is not updated,
    // so input field display incorrect value, because the value is not updated.
    // this will fix the issue.
    if (props.type !== "checkbox" && local.value !== target.value) {
      target.value =
        (local.value as string) ??
        (parentRenderContext()?.context.value as string) ??
        "";
    }
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
        <Match when={local.unitOptions}>
          TODO
          {/* <TextFieldWithSelect
            {...others}
            {...local.inputProps}
            class={`${others.class || ""} ${local.error && local.errorClass ? local.errorClass : ""}`}
            onChange={local.onChange}
            ref={setReference}
            value={local.value ?? ""}
          /> */}
        </Match>
        <Match when={props.type === "checkbox"}>
          <input
            {...otherProps}
            {...(local.inputProps as JSX.InputHTMLAttributes<HTMLInputElement>)}
            autocomplete="off"
            type="checkbox"
            class={`${props.class || ""} ${
              props.disabled || props.readOnly
                ? ` opacity-80 !bg-base-200 `
                : ""
            } ${local.error && local.errorClass ? local.errorClass : ""}`}
            onChange={handleChange}
            ref={mergeRefs(setReference, props.ref)}
            checked={!!local.value}
          />
        </Match>
        <Match when={true}>
          <input
            {...otherProps}
            {...(local.inputProps as JSX.InputHTMLAttributes<HTMLInputElement>)}
            autocomplete="off"
            class={`${props.class || ""} ${
              props.disabled || props.readOnly
                ? ` opacity-80 !bg-base-200 `
                : ""
            } ${local.error && local.errorClass ? local.errorClass : ""}`}
            onChange={handleChange}
            ref={mergeRefs(setReference, props.ref)}
            value={
              local.value ??
              (parentRenderContext()?.context.value as string) ??
              ""
            }
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
        <As
          as="div"
          css={css`
  width: 100%;
`}
        >
          <Content />
          <Show when={local.showValue && local.value}>
            <As
              as="div"
              css={(args) => css`
  font-size: 12px;
  color: ${args.theme.var.color.base_280};
`}
            >
              {local.value}
              {local.suffixToValue ? ` ${local.suffixToValue}` : ""}
            </As>
          </Show>
        </As>
      </Match>
      <Match when={!local.isViewMode}>
        <Content />
      </Match>
    </Switch>
  );
}
