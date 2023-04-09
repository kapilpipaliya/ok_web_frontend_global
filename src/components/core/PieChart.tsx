import {createEffect, For, Show} from "solid-js";
import {ComponentProps, Vertex} from "./Form";
import PieChart, {Properties} from "devextreme/viz/pie_chart";
import {newVertex} from "./utils";

const pieChartData = [
  {
    "arg": "Russia",
    "val": 12
  },
  {
    "arg": "Canada",
    "val": 7
  },
  {
    "arg": "USA",
    "val": 7
  },
  {
    "arg": "China",
    "val": 7
  },
  {
    "arg": "Brazil",
    "val": 6
  },
  {
    "arg": "Australia",
    "val": 5
  },
  {
    "arg": "India",
    "val": 2
  },
  {
    "arg": "Others",
    "val": 55
  }
]

export function PieChartComponent() {
  const meta = newVertex(0, ["Meta"], {
    id: "meta",
    props: { },
  });

  const data = newVertex(0, ["Vertex"], { meta: pieChartData });
  const setValue = (attribute: Vertex, data: any) => {
    console.log(attribute, data);
  };

  return <PieChartField meta={meta} data={data} setValue={setValue} />
}
export function PieChartField(props: ComponentProps) {
  return (
    <div aria-labelledby={props["aria-labeledby"]}>
      <div
        ref={(el) => {
          const instance = new PieChart(el, {

            legend: {
              horizontalAlignment: "center",
              verticalAlignment: "bottom"
            },
            series: {
              argumentField: "arg",
              valueField: "val"
            }
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