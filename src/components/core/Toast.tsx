import {createEffect, For, Show} from "solid-js";
import {ComponentProps, Vertex} from "./Form";
import Toast, {Properties} from "devextreme/ui/toast";
import {newVertex} from "./utils";

export function ToastComponent() {
  const meta = newVertex(0, ["Meta"], {
    id: "meta",
    props: { },
  });

  const data = newVertex(0, ["Vertex"], { meta: '' });
  const setValue = (attribute: Vertex, data: any) => {
    console.log(attribute, data);
  };

  return <ToastField meta={meta} data={data} setValue={setValue} />
}
export function ToastField(props: ComponentProps) {
  return (
    <div aria-labelledby={props["aria-labeledby"]}>
      <div
        ref={(el) => {
          const instance = new Toast(el, {
            displayTime: 20000,
            message: "Toast message",
            type: "info",
            visible: false
          });

          createEffect(() =>
            instance.show()
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