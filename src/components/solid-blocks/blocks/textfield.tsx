import {
  Component,
  JSX,
  splitProps,
  mergeProps,
  Switch,
  Match,
} from "solid-js";
import { Show } from "solid-js/web";
import { runEvent } from "./tools";

import "./base.css";
import "./textfield.css";

export type TextFieldType =
  | "text"
  | "color"
  | "date"
  | "datetime-local"
  | "email"
  | "file"
  | "month"
  | "number"
  | "password"
  | "range"
  | "search"
  | "tel"
  | "time"
  | "url"
  | "week";

export type SingleLineTextFieldProps =
  JSX.InputHTMLAttributes<HTMLInputElement> & {
    "aria-orientation"?: "horizontal" | "vertical";
    multiline?: false;
    isNumber?: false;
    labelClass?: string;
    label?: JSX.Element;
    type?: string;
    placeholder?: String;
    class?: string;
    trailing?: JSX.Element;
    leading?: JSX.Element;
    setValue?: (value: string) => void;
  };

export type MultiLineTextFieldProps =
  JSX.TextareaHTMLAttributes<HTMLTextAreaElement> & {
    "aria-orientation"?: "horizontal" | "vertical";
    multiline: true;
    labelClass?: string;
    isNumber: false;
    type?: string;
    label?: JSX.Element;
    class?: string;
    placeholder?: String;
    trailing?: JSX.Element;
    leading?: JSX.Element;
    setValue?: (value: string) => void;
  };

export type TextFieldProps = SingleLineTextFieldProps | MultiLineTextFieldProps;

export const TextField: Component<TextFieldProps> = (props: TextFieldProps) => {
  const [local, fieldProps] = splitProps(props, [
    "aria-orientation",
    "labelClass",
    "classList",
    "label",
    "multiline",
    "isNumber",
    "onInput",
    "children",
    "setValue",
    "placeholder",
    "class",
    "trailing",
    "leading",
  ]);
  const mergedClassList = mergeProps(
    { textfield: true },
    local.classList ?? {},
  );

  return (
    <label
      classList={mergedClassList}
      class={local.labelClass}
      aria-orientation={props["aria-orientation"]}
    >
      {/* <span class="sb-textfield-label">{local.label}</span> */}
      <Switch>
        <Match when={local.isNumber}>
          <div class="textInputWrapper">
            <input
              name="number"
              {...(fieldProps as JSX.HTMLAttributes<HTMLInputElement>)}
              type="number"
              placeholder={local.placeholder ? local.placeholder : ""}
              class={`${local.class ?? ""} global-style textInput`}
              onInput={(ev) => {
                runEvent(ev, local.onInput);
                local.setValue?.(ev.currentTarget.value);
              }}
            />
          </div>
        </Match>
        <Match when={local.multiline}>
          <textarea
            {...(fieldProps as JSX.HTMLAttributes<HTMLTextAreaElement>)}
            style={{
              resize: "horizontal",
              width: "100%",
              "max-width": "-webkit-fit-available",
            }}
            placeholder={local.placeholder ? local.placeholder : ""}
            class={`${local.class ?? ""}  global-style max-w:100% h:50px `}
            onInput={(ev) => {
              runEvent(ev, local.onInput);
              local.setValue?.(ev.currentTarget.value);
            }}
          />
        </Match>
        <Match when={!local.multiline}>
          <div
            class={` ${local.trailing || local.leading ? "flex gap:3 ai:center" : ""}`}
          >
            {local.leading}
            <div class={"textInputWrapper w:full"}>
              <input
                name="text"
                {...(fieldProps as JSX.HTMLAttributes<HTMLInputElement>)}
                placeholder={local.placeholder ? local.placeholder : ""}
                class={`${local.class ?? ""} global-style textInput `}
                onInput={(ev) => {
                  runEvent(ev, local.onInput);
                  local.setValue?.(ev.currentTarget.value);
                }}
              />
            </div>
            {local.trailing}
          </div>
        </Match>
      </Switch>
      {local.children}
    </label>
  );
};
