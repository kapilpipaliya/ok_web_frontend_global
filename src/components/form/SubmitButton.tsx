import { type JSXElement, Show } from "solid-js";

export function SubmitButton(props: Readonly<{ buttonAlign?: string; submitButton?: JSXElement; onCancel: () => void; onSubmit: () => void; }>) {
  return (
    <div
      style={{
        "justify-content": props.buttonAlign ?? "start",
        display: "flex",
      }}
    >
      <button style={{ "margin-right": "7px" }} class="border-color:#FF0000 color:#FF0000 danger" onClick={props.onCancel}>Cancel</button>
      <Show
        when={props.submitButton}
        fallback={<button onClick={props.onSubmit}>Save</button>}
      >
        {props.submitButton}
      </Show>
    </div>
  );
}
