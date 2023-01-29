import { createEffect, For, Show, splitProps } from "solid-js";
import { IFormControl } from "solid-forms";

import TextBox, { Properties } from "devextreme/ui/text_box";
import { NativeEventInfo } from "devextreme/events";

export interface TextInputFieldProps extends Properties {
  control: IFormControl;
}

export function TextInputField(props: TextInputFieldProps) {
  const [p, customProps] = splitProps(props, ["control"]);
  return (
    <div
      classList={{
        "is-invalid": !!p.control.errors,
        "is-touched": p.control.isTouched,
        "is-required": p.control.isRequired,
        "is-disabled": p.control.isDisabled
      }}
    >
      <div ref={el => {
        const instance = new TextBox(el, {
          ...customProps,

          value: p.control.value,
          onKeyUp: (e: NativeEventInfo<TextBox, KeyboardEvent>) => {
            // p.control.setValue(e.component.option("value"));
            p.control.setValue((e.event?.currentTarget as HTMLInputElement).value);
          },
          onblur: () => p.control.markTouched(true),
          required: p.control.isRequired,
          disabled: p.control.isDisabled || p.control.isReadonly
        });
        createEffect(() => {
          for(const property in p as Properties) {
            // @ts-ignore
            instance.option(property, p[property]);
          }
        })
        createEffect(()=>instance.option('required', p.control.isRequired))
        createEffect(()=>instance.option('disabled', p.control.isDisabled || p.control.isReadonly))
      }} />

      <Show when={p.control.isTouched && !p.control.isValid && p.control.errors}>
        <For each={Object.values(p.control.errors!)}>{(errorMsg: string) => <small>{errorMsg}</small>}</For>
      </Show>
    </div>
  );
}
