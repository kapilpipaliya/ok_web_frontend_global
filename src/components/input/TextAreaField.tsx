import { createEffect, For, Show, splitProps } from "solid-js";


import TextArea, { Properties } from "devextreme/ui/text_area";

export interface TextInputFieldProps extends Properties {
  required?: boolean;
  errors?: string[];
  setValue: (value: string) => void;
  "aria-labeledby"?: string
}

export function TextAreaField(props: TextInputFieldProps) {
  const [p, customProps] = splitProps(props, ["aria-labeledby"]);
  return (
    <div aria-labeledby={p["aria-labeledby"]}>
      <div ref={el => {
        const instance = new TextArea(el, {
          ...customProps,

          value: props.value,
          onChange: e => {
            // props.setValue(e.component.option("value"));
            props.setValue((e.event?.currentTarget as HTMLInputElement).value);
          },
          // @ts-ignore
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
