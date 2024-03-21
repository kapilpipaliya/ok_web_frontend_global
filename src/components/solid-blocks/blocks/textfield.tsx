import { Component, JSX, splitProps, mergeProps, Switch, Match } from "solid-js";
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

export type SingleLineTextFieldProps = JSX.InputHTMLAttributes<HTMLInputElement> & {
  "aria-orientation"?: "horizontal" | "vertical";
  multiline?: false;
  isNumber?: false;
  label: JSX.Element;
  type?: TextFieldType;
  setValue?: (value: string) => void;
};

export type MultiLineTextFieldProps =
  JSX.TextareaHTMLAttributes<HTMLTextAreaElement> & {
    "aria-orientation"?: "horizontal" | "vertical";
    multiline: true;
    isNumber: false;
    label: JSX.Element;
    setValue?: (value: string) => void;
  };

export type TextFieldProps = SingleLineTextFieldProps | MultiLineTextFieldProps;

export const TextField: Component<TextFieldProps> = (props) => {
  const [local, fieldProps] = splitProps(props, [
    "aria-orientation",
    "classList",
    "label",
    "multiline",
    "isNumber",
    "onInput",
    "children",
    "setValue",
    'class'
  ]);

  return (
    <label
      classList={mergeProps(local.classList ?? {}, { textfield: true })}
      aria-orientation={props["aria-orientation"]}
    >
      {/* <span class="sb-textfield-label">{local.label}</span> */}
      <Switch>
        <Match when={local.isNumber}>
          <input
            {...(fieldProps as JSX.HTMLAttributes<HTMLInputElement>)}
            type="number"
            class={`${local.class ?? ""}  global-style`}
            style={{ width: "100%" }}
            onInput={(ev) => {
              runEvent(ev, local.onInput);
              local.setValue?.(ev.currentTarget.value);
            }}
          />
        </Match>
        <Match when={local.multiline}>
          <textarea
            {...(fieldProps as JSX.HTMLAttributes<HTMLTextAreaElement>)}
            style={{ resize: "both", width: "100%" }}
            class={`${local.class ?? ""}  global-style`}
            onInput={(ev) => {
              runEvent(ev, local.onInput);
              local.setValue?.(ev.currentTarget.value);
            }}
          />
        </Match>
        <Match when={!local.multiline}>
          <input
            {...(fieldProps as JSX.HTMLAttributes<HTMLInputElement>)}
            style={{ width: "100%" }}
            class={`${local.class ?? ""} global-style`}
            onInput={(ev) => {
              runEvent(ev, local.onInput);
              local.setValue?.(ev.currentTarget.value);
            }}
          />
        </Match>
      </Switch>
      {local.children}
    </label>
  );
};
