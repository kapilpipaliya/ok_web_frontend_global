import {createEffect, For, Show} from "solid-js";
import {ComponentProps, Vertex} from "./Form";
import BarGauge, {Properties} from "devextreme/viz/bar_gauge";
import {newVertex} from "./utils";

export function BarGaugeComponent() {
  const meta = newVertex(0, ["Meta"], {
    id: "meta",
    props: {  },
  });

  const data = newVertex(0, ["Vertex"], { meta: [47.27, 65.32, 84.59, 71.86] });
  const setValue = (attribute: Vertex, data: any) => {
    console.log(attribute, data);
  };

  return <BarGaugeField meta={meta} data={data} setValue={setValue} />
}
export function BarGaugeField(props: ComponentProps) {
  return (
    <div aria-labelledby={props["aria-labeledby"]}>
      <div
        ref={(el) => {
          const instance = new BarGauge(el, {
            startValue: 0,
            endValue: 100,
            values: props.data.properties[props.meta.properties.id],
            label: {
              indent: 30,
              format: {
                type: 'fixedPoint',
                precision: 1,
              },
              customizeText(arg) {
                return `${arg.valueText} %`;
              },
            },
            export: {
              enabled: true,
            },
            title: {
              text: "Series' Ratings",
              font: {
                size: 28,
              },
            },
          });
          createEffect(() =>
            instance.option(
              "values",
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