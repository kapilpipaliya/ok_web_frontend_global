import { type JSXElement, Show } from "solid-js";

import { formCancel } from "./functions/formCancel";
import { formSubmit } from "./functions/formSubmit";

export function SaveCancelButton(
  props: Readonly<{
    buttonAlign?: string;
    closePopUp?: () => void;
    customSubmitButton?: JSXElement;
    disabled?: boolean;
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
        when={props.customSubmitButton}
      >
        {props.customSubmitButton}
      </Show>
    </div>
  );
}
