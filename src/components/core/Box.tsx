import { createEffect, For, Show } from "solid-js";
import { ComponentProps } from "./Form";
import Box, { Properties } from "devextreme/ui/box";
import "../assets/styles/box.css";
import { IdAttr, Vertex } from "../../lib/graph";
import { newVertex } from "../../lib/Vertex";

export function BoxComponent() {
  const meta = newVertex(0, ["Meta"], {
    [IdAttr]: "meta",
    props: { width: "100%" },
  });

  const data = newVertex(0, ["Vertex"], {});
  const setValue = (attribute: Vertex, data: any) => {
    console.log(attribute, data);
  };

  return <BoxField meta={meta} data={data} setValue={setValue} />;
}
export function BoxField(props: ComponentProps) {
  return (
    <div aria-labelledby={props["aria-labeledby"]}>
      <div
        ref={(el) => {
          const instance = new Box(el, {
            direction: "row",
            height: 100,
          });

          createEffect(() => {
            for (const property in props.meta.properties.props as Properties) {
              instance.option(property, props.meta.properties.props[property]);
            }
          });
        }}
      >
        <div class="rect demo-dark" data-options="dxItem: {ratio: 1}" style={{ background: "#f39e6c" }}>
          {" "}
          ratio = 1{" "}
        </div>
        <div class="rect demo-light" data-options="dxItem: {ratio: 2}" style={{ background: "#f5e5a6" }}>
          {" "}
          ratio = 2{" "}
        </div>
        <div class="rect demo-dark" data-options="dxItem: {ratio: 1}" style={{ background: "#94d7c7" }}>
          {" "}
          ratio = 1{" "}
        </div>
      </div>


    </div>
  );
}
