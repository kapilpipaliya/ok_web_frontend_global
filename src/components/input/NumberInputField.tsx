import { createEffect, For, Show, splitProps } from "solid-js";
import { IFormControl } from "solid-forms";

import NumberBox, { Properties } from "devextreme/ui/number_box";
import { NativeEventInfo } from "devextreme/events";

export interface NumberInputFieldProps extends Properties {
  control: IFormControl;
}

export function NumberInputField(props: NumberInputFieldProps) {
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
        const instance = new NumberBox(el, {
          ...customProps,
          value: p.control.value,
          onValueChanged: (e) => {
            p.control.setValue(e.value);
          },
          // onblur: () => p.control.markTouched(true),
          // required: p.control.isRequired,
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
