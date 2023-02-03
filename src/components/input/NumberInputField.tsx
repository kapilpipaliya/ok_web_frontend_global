import { createEffect, For, Show, splitProps } from "solid-js";

import NumberBox, { Properties } from "devextreme/ui/number_box";

export interface NumberInputFieldProps extends Properties {
  required?: boolean;
  errors: string[];
  setValue: (value: string) => void;
}

export function NumberInputField(props: NumberInputFieldProps) {
  const [p, customProps] = splitProps(props, []);
  return (
    <div>
      <div ref={el => {
        const instance = new NumberBox(el, {
          ...customProps,
          value: props.value,
          onValueChanged: (e) => {
            props.setValue(e.value);
          },
          // required: props.required,
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
