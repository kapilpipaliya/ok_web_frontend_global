import {createEffect, For, Show} from "solid-js";
import {ComponentProps, Vertex} from "./Form";
import Bullet, {Properties} from "devextreme/viz/bullet";
import {newVertex} from "./utils";

export function BulletComponent() {
  const meta = newVertex(0, ["Meta"], {
    id: "meta",
    props: { color: "#a9c387" },
  });

  const data = newVertex(0, ["Vertex"], { meta: 40 });
  const setValue = (attribute: Vertex, data: any) => {
    console.log(attribute, data);
  };

  return <BulletField meta={meta} data={data} setValue={setValue} />
}
export function BulletField(props: ComponentProps) {
  return (
    <div aria-labelledby={props["aria-labeledby"]}>
      <div
        ref={(el) => {
          const instance = new Bullet(el, {
            target: 30,
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