import {createEffect, For, Show} from "solid-js";
import {ComponentProps, Vertex} from "./Form";
import Tooltip, {Properties} from "devextreme/ui/tooltip";
import {newVertex} from "./utils";

export function TooltipComponent() {
  const meta = newVertex(0, ["Meta"], {
    id: "meta",
    props: { },
  });

  const data = newVertex(0, ["Vertex"], { meta: 'Tooltip content' });
  const setValue = (attribute: Vertex, data: any) => {
    console.log(attribute, data);
  };

  return <TooltipField meta={meta} data={data} setValue={setValue} />
}
export function TooltipField(props: ComponentProps) {
  return (
    <div aria-labelledby={props["aria-labeledby"]}>
      <div
        ref={(el) => {
          const instance = new Tooltip(el, {
            target: "#target-item",
            showEvent: 'mouseenter',
            hideEvent: 'mouseleave',
            hideOnOutsideClick: false,
            position: "top",
            contentTemplate: (e: any) => {
              e.component.option("contentTemplate", null);
              return props.data.properties[props.meta.properties.id];
            }
          });

          createEffect(() => {
            for (const property in props.meta.properties.props as Properties) {
              instance.option(property, props.meta.properties.props[property]);
            }
          });
        }}
      >
        {props.data.properties[props.meta.properties.id]}
      </div>
      <div id="target-item">This is target item for tooltip</div>
      <Show when={props.errors}>
        <For each={Object.values(props.errors!)}>
          {(errorMsg: string) => <small>{errorMsg}</small>}
        </For>
      </Show>
    </div>
  );
}