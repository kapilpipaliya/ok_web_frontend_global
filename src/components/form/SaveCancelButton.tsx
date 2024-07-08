import { type JSXElement, Show } from "solid-js";

import { formCancel } from "./formCancel";
import { formSubmit } from "./formSubmit";

export function SaveCancelButton(props: Readonly<{buttonAlign?: string; closePopUp?: () => void; disabled?: boolean; submitButton?: JSXElement; }>) {
  const onSubmit = formSubmit(props.closePopUp);
  const onCancel = formCancel(props.closePopUp);
  return (
    <div
      style={{
        display: "flex",
        "justify-content": props.buttonAlign ?? "start",
      }}
    >
      <button class="danger border-color:#FF0000 color:#FF0000" onClick={onCancel} style={{ "margin-right": "7px" }} type="button">Cancel</button>
      <Show
        fallback={<button disabled={props.disabled}  onClick={onSubmit} type="button">Save</button>}
        when={props.submitButton}
      >
        {props.submitButton}
      </Show>
    </div>
  );
}
