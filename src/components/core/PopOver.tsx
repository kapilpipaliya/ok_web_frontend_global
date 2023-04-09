import {createEffect, For, Show} from "solid-js";
import {ComponentProps, Vertex} from "./Form";
import PopOver, {Properties} from "devextreme/ui/popover";
import {newVertex} from "./utils";

export function PopOverComponent() {
  const meta = newVertex(0, ["Meta"], {
    id: "meta",
    props: { },
  });

  const data = newVertex(0, ["Vertex"], { meta: 'Some popover message' });
  const setValue = (attribute: Vertex, data: any) => {
    console.log(attribute, data);
  };

  return <PopOverField meta={meta} data={data} setValue={setValue} />
}
export function PopOverField(props: ComponentProps) {
  return (
    <div aria-labelledby={props["aria-labeledby"]}>
      <p><span id="subject1">Google AdWords Strategy</span> (<a id="link1">details</a>)</p>
      <div
        ref={(el) => {
          const instance = new PopOver(el, {
            target: '#link1',
            showEvent: 'mouseenter',
            hideEvent: 'mouseleave',
            position: 'top',
            width: 300,
          });

          createEffect(() => {
            for (const property in props.meta.properties.props as Properties) {
              instance.option(property, props.meta.properties.props[property]);
            }
          });
        }}
      >
        Some popover message
      </div>
      <Show when={props.errors}>
        <For each={Object.values(props.errors!)}>
          {(errorMsg: string) => <small>{errorMsg}</small>}
        </For>
      </Show>
    </div>
  );
}