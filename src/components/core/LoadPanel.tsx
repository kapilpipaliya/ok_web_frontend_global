import {createEffect, For, Show} from "solid-js";
import {ComponentProps, Vertex} from "./Form";
import LoadPanel, {Properties} from "devextreme/ui/load_panel";
import {newVertex} from "./utils";

export function LoadPanelComponent() {
  const meta = newVertex(0, ["Meta"], {
    id: "meta",
    props: { },
  });

  const data = newVertex(0, ["Vertex"], { meta: '' });
  const setValue = (attribute: Vertex, data: any) => {
    console.log(attribute, data);
  };

  return <LoadPanelField meta={meta} data={data} setValue={setValue} />
}
export function LoadPanelField(props: ComponentProps) {
  return (
    <div aria-labelledby={props["aria-labeledby"]} id="load-panel" style={{padding:"10px"}}>
      <div
        ref={(el) => {
          const instance = new LoadPanel(el, {
            showIndicator: true,
            showPane: true,
            shading: true,
            hideOnOutsideClick: false,
            message: "Loading...",
            position: { of: el },
            onShown: () => {
              console.log("shown")
              setTimeout(() => {
                instance.hide();
              }, 0);
            },
            onHidden: () => {
              console.log("hidden");
            }
          });

          createEffect(() => {
            instance.show();
          })

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