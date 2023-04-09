import {createEffect, For, Show} from "solid-js";
import {ComponentProps, Vertex} from "./Form";
import LoadIndicator, {Properties} from "devextreme/ui/load_indicator";
import {newVertex} from "./utils";

export function LoadIndicatorComponent() {
  const meta = newVertex(0, ["Meta"], {
    id: "meta",
    props: { },
  });

  const data = newVertex(0, ["Vertex"], { meta: '' });
  const setValue = (attribute: Vertex, data: any) => {
    console.log(attribute, data);
  };

  return <LoadIndicatorField meta={meta} data={data} setValue={setValue} />
}
export function LoadIndicatorField(props: ComponentProps) {
  return (
    <div aria-labelledby={props["aria-labeledby"]}>
      <div
        ref={(el) => {
          const instance = new LoadIndicator(el, {
            width: 100,
            visible: true,
          });

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