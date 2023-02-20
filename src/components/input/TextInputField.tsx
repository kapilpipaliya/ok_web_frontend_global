import { createEffect, For, Show, splitProps } from "solid-js";


import TextBox, { Properties } from "devextreme/ui/text_box";
import { NativeEventInfo } from "devextreme/events";

export interface TextInputFieldProps extends Properties {
  required?: boolean;
  errors?: string[];
  setValue: (value: string) => void;
  "aria-labeledby": string
}

export function TextInputField(props: TextInputFieldProps) {
  const [p, customProps] = splitProps(props, ["aria-labeledby"]);
  return (
    <div aria-labeledby={p['aria-labeledby']}>
      <div ref={el => {
        const instance = new TextBox(el, {
          ...customProps,

          value: props.value,
          onChange: (e: NativeEventInfo<TextBox, KeyboardEvent>) => {
            // props.setValue(e.component.option("value"));
            props.setValue((e.event?.currentTarget as HTMLInputElement).value);
          },
          required: props.required,
          disabled: props.disabled
        });
        createEffect(() => {
          for(const property in p as Properties) {
            // @ts-ignore
            instance.option(property, p[property]);
          }
        })
        createEffect(()=>instance.option('required', props.required))
        createEffect(()=>instance.option('disabled', props.disabled))
      }} />

      <Show when={props.errors}>
        <For each={Object.values(props.errors!)}>{(errorMsg: string) => <small>{errorMsg}</small>}</For>
      </Show>
    </div>
  );
}
