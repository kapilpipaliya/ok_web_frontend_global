import {createEffect, For, Show} from "solid-js";
import {ComponentProps, Vertex} from "./Form";
import Chart, {Properties} from "devextreme/viz/chart"
import {newVertex} from "./utils";

const chartDataSource = [{
  day: 'Monday',
  oranges: 3,
}, {
  day: 'Tuesday',
  oranges: 2,
}, {
  day: 'Wednesday',
  oranges: 3,
}, {
  day: 'Thursday',
  oranges: 4,
}, {
  day: 'Friday',
  oranges: 6,
}, {
  day: 'Saturday',
  oranges: 11,
}, {
  day: 'Sunday',
  oranges: 4,
}]
export function ChartComponent() {
  const meta = newVertex(0, ["Meta"], {
    id: "meta",
    props: { type: "line" },
  });

  const data = newVertex(0, ["Vertex"], { meta: chartDataSource });
  const setValue = (attribute: Vertex, data: any) => {
    console.log(attribute, data);
  };

  return <ChartField meta={meta} data={data} setValue={setValue} />
}
export function ChartField(props: ComponentProps) {
  return (
    <div aria-labelledby={props["aria-labeledby"]}>
      <div
        ref={(el) => {
          const instance = new Chart(el, {

            series: {
              argumentField: 'day',
              valueField: 'oranges',
              name: 'My oranges',
              type: props.meta.properties.props["type"] || 'bar',
              color: '#ffaa66',
            },
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