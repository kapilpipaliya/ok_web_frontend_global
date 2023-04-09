import {createEffect, For, Show} from "solid-js";
import {ComponentProps, Vertex} from "./Form";
import SpeedDialAction, {Properties} from "devextreme/ui/speed_dial_action";
import {newVertex} from "./utils";

export function SpeedDialActionComponent() {
  const meta = newVertex(0, ["Meta"], {
    id: "meta",
    props: { },
  });

  const data = newVertex(0, ["Vertex"], { meta: 'tabPanelData' });
  const setValue = (attribute: Vertex, data: any) => {
    console.log(attribute, data);
  };

  return <SpeedDialActionField meta={meta} data={data} setValue={setValue} />
}
export function SpeedDialActionField(props: ComponentProps) {
  return (
    <div aria-labelledby={props["aria-labeledby"]}>
      <div
        ref={(el) => {
          const instance = new SpeedDialAction(el, {
            icon: "tel",
            onClick(e) {
              console.log("Click");
            }
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