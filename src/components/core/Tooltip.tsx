import { createEffect, For, Show, onCleanup } from "solid-js";
import { ComponentProps } from "./Form";
import Tooltip, { Properties } from "devextreme/ui/tooltip";
import { IdAttr, Vertex } from "../../lib/graph";
import { newVertex } from "../../lib/Vertex";

export function TooltipComponent() {
  const meta = newVertex(0, ["Meta"], {
    [IdAttr]: "meta",
    props: {},
  });

  const data = newVertex(0, ["Vertex"], { meta: "Tooltip content" });
  const setValue = (attribute: Vertex, data: any) => {
    console.log(attribute, data);
  };

  return <TooltipField meta={meta} data={data} setValue={setValue} />;
}
export function TooltipField(props: ComponentProps) {
  return (
    <><div aria-labelledby={props["aria-labeledby"]}
        ref={(el) => {
          const instance = new Tooltip(el, {
            target: "#target-item",
            showEvent: "mouseenter",
            hideEvent: "mouseleave",
            hideOnOutsideClick: false,
            position: "top",
            contentTemplate: (e: any) => {
              e.component.option("contentTemplate", null);
              return props.data.properties[props.meta.properties[IdAttr]];
            },
          });

          createEffect(() => {
            for (const property in props.meta.properties.props as Properties) {
              instance.option(property, props.meta.properties.props[property]);
            }
          });
        }}
      >
        {props.data.properties[props.meta.properties[IdAttr]]}
      </div>
      <div id="target-item">This is target item for tooltip</div>
</>
  );
}
