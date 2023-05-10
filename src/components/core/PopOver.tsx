import { createEffect, For, Show } from "solid-js";
import { ComponentProps } from "./Form";
import PopOver, { Properties } from "devextreme/ui/popover";
import { IdAttr, Vertex } from "../../lib/graph";
import { newVertex } from "../../lib/Vertex";

export function PopOverComponent() {
  const meta = newVertex(0, ["Meta"], {
    [IdAttr]: "meta",
    props: {},
  });

  const data = newVertex(0, ["Vertex"], { meta: "Some popover message" });
  const setValue = (attribute: Vertex, data: any) => {
    console.log(attribute, data);
  };

  return <PopOverField meta={meta} data={data} setValue={setValue} />;
}
export function PopOverField(props: ComponentProps) {
  return (
    <div aria-labelledby={props["aria-labeledby"]}>
      <p>
        <span id="subject1">Google AdWords Strategy</span> (<a id="link1">details</a>)
      </p>
      <div
        ref={(el) => {
          const instance = new PopOver(el, {
            target: "#link1",
            showEvent: "mouseenter",
            hideEvent: "mouseleave",
            position: "top",
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

    </div>
  );
}
