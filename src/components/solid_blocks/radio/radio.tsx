import {
  type Accessor,
  type JSX,
  type Setter,
  Show,
  createContext,
  createEffect,
  createSelector,
  createSignal,
  createUniqueId,
  on,
  splitProps,
  useContext,
  
} from "solid-js";

import { runEvent } from "../tools";
import "./radio.css";

export const radioContext = createContext<
  [] | [Accessor<string>, Setter<string>, (value: string) => boolean, string]
>([]);

export type RadioProps = {
  /**
   * align the checkbox inside its label
   * can be 'left' or 'right; default is 'left'
   */
  align?: "left" | "right";
  autofocus?: boolean;
  checked?: boolean;
  disabled?: boolean;
  name?: string;
  onInvalid?: JSX.EventHandler<HTMLInputElement, Event>;
  required?: boolean;
  setChecked?: (checked?: boolean) => void;
  value?: string;
} & JSX.HTMLAttributes<HTMLInputElement>;

export function Radio(props: RadioProps) {
  const [inputProps, content, labelProps] = splitProps(
    props,
    [
      "accessKey",
      "align",
      "aria-disabled",
      "aria-invalid",
      "autofocus",
      "checked",
      "class",
      "disabled",
      "id",
      "name",
      "onchange",
      "onclick",
      "onkeydown",
      "onkeypress",
      "onkeyup",
      "oninvalid",
      "required",
      "value",
    ],
    ["align", "checked", "onChange", "setChecked", "children"],
  );

  const [_value, setValue, isValueActive, uniqueId] = useContext(radioContext);

  return (
    <label
      class={`${content.align || "left"} sb-radio${
        inputProps.disabled ? " disabled" : ""
      }`}
      {...(labelProps as JSX.HTMLAttributes<HTMLLabelElement>)}
    >
      <Show when={content.align === "right"}>{content.children}</Show>
      <input
        name={uniqueId}
        ref={props.ref}
        type="radio"
        {...inputProps}
        checked={
          isValueActive
            ? isValueActive(inputProps.value || "")
            : content.checked
        }
        onChange={(
          ev: { currentTarget: HTMLInputElement; target: Element } & Event,
        ): void => {
          runEvent(ev, content.onChange);
          content.setChecked?.(ev.currentTarget.checked);
          if (ev.currentTarget.checked) {
            setValue?.(props.value || "");
          }
        }}
      />
      <Show when={content.align !== "right"}>{content.children}</Show>
    </label>
  );
}

export type RadioGroupProps = {
  setValue?: (value: string) => void;
  value?: Accessor<string>;
} & JSX.HTMLAttributes<HTMLDivElement>;

// This is just a wrapper that run setValue when value is changed.
export function RadioGroup(props: RadioGroupProps) {
  const [local, divProps] = splitProps(props, [
    "setValue",
    "value",
    "children",
  ]);
  const uniqueId = createUniqueId();
  const [value, setValue] = createSignal(
    typeof props.value === "function" ? props.value() : "",
  );

  createEffect(() =>
    setValue(typeof props.value === "function" ? props.value() : ""),
  );
  createEffect(
    on([value], ([value]) => local.setValue?.(value), { defer: true }),
  );

  return (
    <radioContext.Provider
      value={[value, setValue, createSelector(value), uniqueId]}
    >
      <div
        role="radiogroup"
        {...divProps}
        class={
          divProps.class ? `sb-radiogroup ${divProps.class}` : "sb-radiogroup"
        }
      >
        {local.children}
      </div>
    </radioContext.Provider>
  );
}
