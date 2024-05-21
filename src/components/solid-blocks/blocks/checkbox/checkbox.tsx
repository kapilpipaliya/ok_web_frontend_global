import { Component, JSX, Show, splitProps } from "solid-js";

import { runEvent } from "../tools";

import "../base.css";
import "./checkbox.css";

export type CheckboxProps = JSX.HTMLAttributes<HTMLInputElement> & {
  /**
   * align the checkbox inside its label
   * can be 'left' or 'right; default is 'left'
   */
  align?: "left" | "right";
  autofocus?: boolean;
  checked?: boolean;
  disabled?: boolean;
  name?: string;
  setChecked?: (checked: boolean) => void;
  oninvalid?: JSX.EventHandler<HTMLInputElement, Event>;
  required?: boolean;
  switch?: boolean;
  value?: string;
};

export function Checkbox(props: CheckboxProps) {
  const [inputProps, content, labelProps] = splitProps(
    props,
    [
      "accessKey",
      "aria-disabled",
      "aria-invalid",
      "autofocus",
      "checked",
      "class",
      "disabled",
      "id",
      "name",
      "onclick",
      "onkeydown",
      "onkeypress",
      "onkeyup",
      "oninvalid",
      "required",
      "value",
    ],
    ["align", "children", "onChange", "setChecked", "switch"]
  );

  return (
    <label
      class={`${content.align || "left"} ${content.switch ? " switch" : ""} ${inputProps.class || ""}`}
      {...(labelProps as JSX.HTMLAttributes<HTMLLabelElement>)}
    >
      <Show when={content.align === "right"}>
        <span class={"mr:5px"}>
          {props.text}
          {content.children}
        </span>
      </Show>
      <div class={`checkbox-wrapper m:-5px`}>
        <input
          ref={props.ref}
          type="checkbox"
          role={content.switch ? "switch" : undefined}
          {...inputProps}
          onChange={(ev): void => {
            runEvent(ev, content.onChange);
            content.setChecked?.(ev.currentTarget.checked);
          } } />
        <svg viewBox="0 0 35.6 35.6">
          <circle class="background" cx="17.8" cy="17.8" r="17.8"></circle>
          <circle class="stroke" cx="17.8" cy="17.8" r="14.37"></circle>
          <polyline
            class="check"
            points="11.78 18.12 15.55 22.23 25.17 12.87"
          ></polyline>
        </svg>
      </div>
      <Show when={content.align !== "right"}>
        <span class={"ml:5px"}>
          {" "}
          {props.text}
          {content.children}
        </span>
      </Show>
    </label>

    // <div class={`${inputProps.class || ''}`}>
    //     <Show when={content.align === "right"}><span class={'mr:5px'}>{props.text}{content.children}</span></Show>
    //     <div class={`checkbox-wrapper m:-5px`}>
    //         <input
    //             ref={props.ref}
    //             type="checkbox"
    //             {...inputProps}
    //             onChange={(ev): void => {
    //                 runEvent(ev, content.onChange);
    //                 content.setChecked?.(ev.currentTarget.checked);
    //             }}
    //         />
    //     </div>
    //
    //     <Show when={content.align !== "right"}><span class={'ml:5px'}> {props.text}{content.children}</span></Show>
    // </div>
  );
}
