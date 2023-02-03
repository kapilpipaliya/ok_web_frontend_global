import { createEffect, createResource, For, on, Show, splitProps } from "solid-js";

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
    <div>
      <div ref={el => {
        const instance = new SelectBox(el, {
          ...customProps,
          searchEnabled: true,
          value: props.value,
          onValueChanged: function(e: any) {
            props.setValue(e.value);
          },
          required: props.required,
          disabled: props.disabled,
          valueExpr: "id",
          labelMode: 'floating'
        });
        createEffect(() => {
          for(const property in p as Properties) {
            // @ts-ignore
            instance.option(property, p[property]);
          }
        })
        createEffect(()=>instance.option('value', props.value))
        // when the value is changed by other components, we want to refetch the options
        createEffect(on(() => props.rawValue, (v) => refetch(v)))
        createEffect(()=>instance.option('required', props.required))
        createEffect(()=>instance.option('disabled', props.disabled))
        createEffect(() => {
          if(selectOptions()) {
            instance.option('dataSource', selectOptions());
          }
        })
      }} />
      <Show when={props.errors}>
        <For each={Object.values(props.errors!)}>{(errorMsg: string) => <small>{errorMsg}</small>}</For>
      </Show>
    </div>
  );
}
