import { createEffect, For, Show, onCleanup } from "solid-js";
import { ComponentProps } from "./Form";
import SpeedDialAction, { Properties } from "devextreme/ui/speed_dial_action";
import { IdAttr, Vertex } from "../../lib/graph";
import { newVertex } from "../../lib/Vertex";

export function SpeedDialActionComponent() {
  const meta = newVertex(0, ["Meta"], {
    [IdAttr]: "meta",
    props: {},
  });

  const data = newVertex(0, ["Vertex"], { meta: "tabPanelData" });
  const setValue = (attribute: Vertex, data: any) => {
    console.log(attribute, data);
  };

  return <SpeedDialActionField meta={meta} data={data} setValue={setValue} />;
}
export function SpeedDialActionField(props: ComponentProps) {
  return (
    <div aria-labelledby={props["aria-labeledby"]}
        ref={(el) => {
          const instance = new SpeedDialAction(el, {
            icon: "tel",
            onClick(e) {
              console.log("Click");
            },
          });

          createEffect(() => {
            for (const property in props.meta.properties.props as Properties) {
              instance.option(property, props.meta.properties.props[property]);
            }
          });
          onCleanup(() => instance.dispose());
        }}
      />

  );
}
