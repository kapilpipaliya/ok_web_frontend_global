import { ComponentProps } from "./Form";
import RangeSlider, { Properties } from "devextreme/viz/range_selector";
import { createEffect, For, Show, onCleanup } from "solid-js";
import { IdAttr } from "../../lib/graph";

export function RangeSelector(props: ComponentProps) {
  return (
    <div aria-labelledby={props["aria-labeledby"]}
        ref={(el) => {
          const instance = new RangeSlider(el, {
            scale: {
              startValue: 0,
              endValue: 100,
              tickInterval: 10,
              minorTickInterval: 2,
              minorTick: {
                visible: true,
              },
              label: {
                format: {
                  type: "decimal",
                },
              },
            },
            sliderMarker: {
              format: {
                type: "decimal",
              },
            },
            value: [20, 80],
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
