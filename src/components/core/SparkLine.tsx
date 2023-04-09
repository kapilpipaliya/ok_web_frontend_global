import {createEffect, For, Show} from "solid-js";
import {ComponentProps, Vertex} from "./Form";
import SparkLine, {Properties} from "devextreme/viz/sparkline";
import {newVertex} from "./utils";

const sparkLineItems = [
  {
    "arg": "1",
    "val": 1
  },
  {
    "arg": "2",
    "val": 2
  },
  {
    "arg": "3",
    "val": 8
  },
  {
    "arg": "4",
    "val": 4
  },
  {
    "arg": "5",
    "val": 5
  },
  {
    "arg": "6",
    "val": 2
  },
  {
    "arg": "7",
    "val": 7
  },
  {
    "arg": "8",
    "val": 3
  }
]

export function SparkLineComponent() {
  const meta = newVertex(0, ["Meta"], {
    id: "meta",
    props: { },
  });

  const data = newVertex(0, ["Vertex"], { meta: sparkLineItems });
  const setValue = (attribute: Vertex, data: any) => {
    console.log(attribute, data);
  };

  return <SparkLineField meta={meta} data={data} setValue={setValue} />
}
export function SparkLineField(props: ComponentProps) {
  return (
    <div aria-labelledby={props["aria-labeledby"]}>
      <div
        ref={(el) => {
          const instance = new SparkLine(el, {});

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