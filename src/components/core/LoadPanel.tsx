import { createEffect, For, Show, onCleanup } from "solid-js";
import { ComponentProps } from "./Form";
import LoadPanel, { Properties } from "devextreme/ui/load_panel";
import { IdAttr, Vertex } from "../../lib/graph";
import { newVertex } from "../../lib/Vertex";

export function LoadPanelComponent() {
  const meta = newVertex(0, ["Meta"], {
    [IdAttr]: "meta",
    props: {},
  });

  const data = newVertex(0, ["Vertex"], { meta: "" });
  const setValue = (attribute: Vertex, data: any) => {
    console.log(attribute, data);
  };

  return <LoadPanelField meta={meta} data={data} setValue={setValue} />;
}
export function LoadPanelField(props: ComponentProps) {
  return (
    <div aria-labelledby={props["aria-labeledby"]} id="load-panel" style={{ padding: "10px" }}>
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
              console.log("shown");
              setTimeout(() => {
                instance.hide();
              }, 0);
            },
            onHidden: () => {
              console.log("hidden");
            },
          });

          createEffect(() => {
            instance.show();
          });

          createEffect(() => {
            for (const property in props.meta.properties.props as Properties) {
              instance.option(property, props.meta.properties.props[property]);
            }
          });
          onCleanup(() => instance.dispose());
        }}
      />

    </div>
  );
}
