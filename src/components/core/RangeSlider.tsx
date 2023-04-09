import { ComponentProps } from "./Form";
import RangeSlider, { Properties } from "devextreme/ui/range_slider";
import { createEffect, For, Show } from "solid-js";

export function RangeSliderField(props: ComponentProps) {
  return (
    <div aria-labelledby={props["aria-labeledby"]}>
      <div
        ref={(el) => {
          const instance = new RangeSlider(el, {
            min: 0,
            max: 100,
            start: 20,
            end: 80,
            label: {
                visible: true,
                format(value: number) {
                    return `${value}%`
                },
            },
            onValueChanged: (e) => {
              props.setValue(props.meta, e.value);
            },
          });
          createEffect(
            () =>
              props.data.properties[props.meta.properties.id] &&
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
