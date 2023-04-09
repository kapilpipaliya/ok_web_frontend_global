import { createEffect, For, Show } from "solid-js";
import { ComponentProps } from "./Form";
import SelectBox, { Properties } from "devextreme/ui/select_box";

export function SelectInputField(props: ComponentProps) {
  return (
    <div aria-labelledby={props["aria-labeledby"]}>
      <div
        ref={(el) => {
          const instance = new SelectBox(el, {
            items: props.items,
            placeholder: "Select now...",
            dataSource: [...props.items, "item4"],
            // disabled: true,
            // readOnly: true,
            onValueChanged: (e: any) => {
              props.setValue(props.meta, e.value);
            },
          });
          createEffect(() =>
            instance.option(
              "value",
              props.data.properties[props.meta.properties.id]
            )
          );
          createEffect(() => {
            for (const property in props.meta.properties.props as Properties) {
              instance.option(property, props.meta.properties.props[property]);
            }
          });
        }}
      />
      <Show when={props.errors}>
        <For each={Object.values(props.errors!)}>
          {(errorMsg: string) => <small>{errorMsg}</small>}
        </For>
      </Show>
    </div>
  );
}
