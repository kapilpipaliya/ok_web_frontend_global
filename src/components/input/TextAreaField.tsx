import { For, Show, splitProps } from "solid-js";

import { TextArea, TextAreaProps } from "./core/TextArea";

export interface TextInputField extends TextAreaProps {
 required?: boolean;
 errors: string[];
 setValue: (value: string) => void;
}

export function TextAreaField(props: TextInputField) {
  const [_, customProps] = splitProps(props, []);
  return (
    <div>
      <TextArea
        value={props.value}
        oninput={(e) => {
          props.setValue(e.currentTarget.value);
        }}
        required={props.required}
        disabled={props.disabled}
        {...customProps}
      />

      <Show when={props.errors}>
        <For each={Object.values(props.errors!)}>{(errorMsg: string) => <small>{errorMsg}</small>}</For>
      </Show>
    </div>
  );
}
