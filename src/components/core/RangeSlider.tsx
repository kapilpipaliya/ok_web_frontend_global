import { ComponentProps } from "./Form";
import RangeSlider, { Properties } from "devextreme/ui/range_slider";
import { createEffect, For, Show, onCleanup } from "solid-js";
import { IdAttr } from "../../lib/graph";

export function RangeSliderField(props: ComponentProps) {
  return (
    <div aria-labelledby={props["aria-labeledby"]}
        ref={(el) => {
          const instance = new RangeSlider(el, {
            min: 0,
            max: 100,
            start: 20,
            end: 80,
            label: {
              visible: true,
              format(value: number) {
                return `${value}%`;
              },
            },
            onValueChanged: (e) => {
              props.setValue(props.meta, e.value);
            },
          });
          createEffect(
            () =>
              props.data.properties[props.meta.properties[IdAttr]] &&
              instance.option("value", props.data.properties[props.meta.properties[IdAttr]]),
          );
          createEffect(() => {
            for (const property in props.meta.properties.props as Properties) {
              instance.option(property, props.meta.properties.props[property]);
            }
          });
          onCleanup(() => instance.dispose());
        }}
      />


  );
}
