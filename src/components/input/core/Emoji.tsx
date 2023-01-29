// https://github.com/joeattardi/emoji-button

// react: https://github.com/joeattardi/emoji-picker
// svelte: https://github.com/joeattardi/svelte-emoji-selector
import { JSX } from "solid-js";
import { Label } from "./Label";

interface Properties {
  disabled?: boolean;
  onChange: JSX.EventHandler<HTMLInputElement, Event>;
  //isSaving?: boolean
  required?: boolean;
  value: string;
  error?: string;
  placeholder?: string;
  label?: string;
  props?: unknown;
  dom?: HTMLInputElement;
  class?: string;
  type: string;
}

// Todo fix this
export const Emoji = (props: Properties) => {
  return (
    <>
      <Label name={props.label || ""} />
      <input
        name={props.label || ""}
        class={props.class}
        type={props.type}
        required={props.required}
        autocomplete={"false"}
        disabled={props.disabled}
        placeholder={props.placeholder}
        value={props.value}
        onChange={props.onChange}
        ref={props.dom}
        {...(props.props || {})}
      />
      <span>{props.error}</span>
    </>
  );
};
