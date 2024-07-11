import { type JSXElement, Show } from "solid-js";

import { formCancel } from "./formCancel";
import { formSubmit } from "./formSubmit";

export function SaveCancelButton(
  props: Readonly<{
    buttonAlign?: string;
    closePopUp?: () => void;
    disabled?: boolean;
    submitButton?: JSXElement;
  }>,
) {
  const onSubmit = formSubmit(props.closePopUp);
  const onCancel = formCancel(props.closePopUp);
  return (
    <div
      class={`${props.buttonAlign ? `jc:${props.buttonAlign}` : "jc:start"} flex`}
    >
      <button
        class="danger border-red color-red mr-7"
        onClick={onCancel}
        type="button"
      >
        Cancel
      </button>
      <Show
        fallback={
          <button disabled={props.disabled} onClick={onSubmit} type="button">
            Save
          </button>
        }
        when={props.submitButton}
      >
        {props.submitButton}
      </Show>
    </div>
  );
}
