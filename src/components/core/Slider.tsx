import {createEffect, For, Show} from "solid-js";
import {ComponentProps, Vertex} from "./Form";
import Slider, {Properties} from "devextreme/ui/slider";
import {newVertex} from "./utils";

export function SliderComponent() {
  const meta = newVertex(0, ["Meta"], {
    id: "meta",
    props: { },
  });

  const data = newVertex(0, ["Vertex"], { meta: 50 });
  const setValue = (attribute: Vertex, data: any) => {
    console.log(attribute, data);
  };

  return <SliderField meta={meta} data={data} setValue={setValue} />
}
export function SliderField(props: ComponentProps) {
  return (
    <div aria-labelledby={props["aria-labeledby"]}>
      <div
        ref={(el) => {
          const instance = new Slider(el, {
            min: 0,
            max: 100,
            onValueChanged(e) {
              props.setValue(props.meta, e.value);
            }
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