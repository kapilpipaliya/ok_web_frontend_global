import {createEffect, For, Show} from "solid-js";
import {ComponentProps, Vertex} from "./Form";
import CircularGauge, {Properties} from "devextreme/viz/circular_gauge";
import {newVertex} from "./utils";

export function CircularGaugeComponent() {
  const meta = newVertex(0, ["Meta"], {
    id: "meta",
    props: { },
  });

  const data = newVertex(0, ["Vertex"], { meta: 48 });
  const setValue = (attribute: Vertex, data: any) => {
    console.log(attribute, data);
  };

  return <CircularGaugeField meta={meta} data={data} setValue={setValue} />
}
export function CircularGaugeField(props: ComponentProps) {
  return (
    <div aria-labelledby={props["aria-labeledby"]}>
      <div
        ref={(el) => {
          const instance = new CircularGauge(el, {
            value: props.data.properties[props.meta.properties.id],
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