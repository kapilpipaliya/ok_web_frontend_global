import { type JSXElement, Show } from "solid-js";

export function SubmitButton(props: Readonly<{ buttonAlign?: string; onCancel: () => void; onSubmit: () => void; submitButton?: JSXElement; }>) {
  return (
    <div
      style={{
        display: "flex",
        "justify-content": props.buttonAlign ?? "start",
      }}
    >
      <button class="danger border-color:#FF0000 color:#FF0000" onClick={props.onCancel} style={{ "margin-right": "7px" }}>Cancel</button>
      <Show
        fallback={<button onClick={props.onSubmit}>Save</button>}
        when={props.submitButton}
      >
        {props.submitButton}
      </Show>
    </div>
  );
}
