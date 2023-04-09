import {createEffect, For, Show} from "solid-js";
import {ComponentProps, Vertex} from "./Form";
import Funnel, {Properties} from "devextreme/viz/funnel";
import {newVertex} from "./utils";

const funnelData = [
  {
    "action": "Visited the Website",
    "users": 9152
  },
  {
    "action": "Downloaded a Trial",
    "users": 6879
  },
  {
    "action": "Contacted Support",
    "users": 5121
  },
  {
    "action": "Subscribed",
    "users": 2224
  },
  {
    "action": "Renewed",
    "users": 1670
  }
]

export function FunnelComponent() {
  const meta = newVertex(0, ["Meta"], {
    id: "meta",
    props: { },
  });

  const data = newVertex(0, ["Vertex"], { meta: funnelData });
  const setValue = (attribute: Vertex, data: any) => {
    console.log(attribute, data);
  };

  return <FunnelField meta={meta} data={data} setValue={setValue} />
}
export function FunnelField(props: ComponentProps) {
  return (
    <div aria-labelledby={props["aria-labeledby"]}>
      <div
        ref={(el) => {
          const instance = new Funnel(el, {
            argumentField: "action",
            label: {
              backgroundColor: "none",
              customizeText: function(e) {
                // @ts-ignore
                return e.item.argument + '<br />' + e.item.value;
                },
              position: "inside"
            },
            valueField: "users"
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