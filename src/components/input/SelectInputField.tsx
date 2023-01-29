import { createEffect, createResource, For, on, Show, splitProps } from "solid-js";
import { createFormControl } from "solid-forms";
import SelectBox, { Properties } from "devextreme/ui/select_box";

interface Option {
  [key: string]: any;

  id: string;
}


export interface SelectInputFieldProps extends Properties {
  control: ReturnType<typeof createFormControl>;
  fetchOptions: (inputValue: string) => Promise<any[]>;
}

export function SelectInputField(props: SelectInputFieldProps) {
  const [p, customProps] = splitProps(props, ["control", "fetchOptions"]);
  const [selectOptions, {refetch}] = createResource(() => p.fetchOptions(""));
  return (
    <div
      classList={{
        "is-invalid": !!p.control.errors,
        "is-touched": p.control.isTouched,
        "is-required": p.control.isRequired,
        "is-disabled": p.control.isDisabled,
      }}
    >
      <div ref={el => {
        const instance = new SelectBox(el, {
          ...customProps,
          searchEnabled: true,
          value: p.control.value,
          onValueChanged: function(e: any) {
            p.control.setValue(e.value);
          },
          onBlur: () => p.control.markTouched(true),
          required: p.control.isRequired,
          disabled: p.control.isDisabled || p.control.isReadonly,
          valueExpr: "id",
          labelMode: 'floating'
        });
        createEffect(() => {
          for(const property in p as Properties) {
            // @ts-ignore
            instance.option(property, p[property]);
          }
        })
        createEffect(()=>instance.option('value', p.control.value))
        // when the value is changed by other components, we want to refetch the options
        createEffect(on(() => p.control.rawValue, (v) => refetch(v)))
        createEffect(()=>instance.option('required', p.control.isRequired))
        createEffect(()=>instance.option('disabled', p.control.isDisabled || p.control.isReadonly))
        createEffect(() => {
          if(selectOptions()) {
            instance.option('dataSource', selectOptions());
          }
        })
      }} />
      <Show when={p.control.isTouched && !p.control.isValid && p.control.errors}>
        <For each={Object.values(p.control.errors!)}>{(errorMsg: string) => <small>{errorMsg}</small>}</For>
      </Show>
    </div>
  );
}
