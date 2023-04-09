import {createEffect, For, Show} from "solid-js";
import {ComponentProps, Vertex} from "./Form";
import PolarChart, {Properties} from "devextreme/viz/polar_chart";
import {newVertex} from "./utils";

const pivotGridItems = [
  {
    "arg": "Monday",
    "val": 3
  },
  {
    "arg": "Tuesday",
    "val": 2
  },
  {
    "arg": "Wednesday",
    "val": 3
  },
  {
    "arg": "Thursday",
    "val": 4
  },
  {
    "arg": "Friday",
    "val": 6
  },
  {
    "arg": "Saturday",
    "val": 11
  },
  {
    "arg": "Sunday",
    "val": 4
  }
]

export function PolarChartComponent() {
  const meta = newVertex(0, ["Meta"], {
    id: "meta",
    props: { },
  });

  const data = newVertex(0, ["Vertex"], { meta: pivotGridItems });
  const setValue = (attribute: Vertex, data: any) => {
    console.log(attribute, data);
  };

  return <PolarChartField meta={meta} data={data} setValue={setValue} />
}
export function PolarChartField(props: ComponentProps) {
  return (
    <div aria-labelledby={props["aria-labeledby"]}>
      <div
        ref={(el) => {
          const instance = new PolarChart(el, {

            series: [
              {
                "argumentField": "arg",
                "valueField": "val",
                "type": "bar"
              }
            ]
          });
          createEffect(() =>
            instance.option(
              "dataSource",
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