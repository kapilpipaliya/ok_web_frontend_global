import { createEffect, For, Show } from "solid-js";
import { ComponentProps } from "./Form";
import VectorMap, { Properties } from "devextreme/viz/vector_map";
import { IdAttr, Vertex } from "../../lib/graph";
import { newVertex } from "../../lib/Vertex";

export function VectorMapComponent() {
  const meta = newVertex(0, ["Meta"], {
    [IdAttr]: "meta",
    props: {},
  });

  const data = newVertex(0, ["Vertex"], { meta: "" });
  const setValue = (attribute: Vertex, data: any) => {
    console.log(attribute, data);
  };

  return <VectorMapField meta={meta} data={data} setValue={setValue} />;
}
export function VectorMapField(props: ComponentProps) {
  return (
    <div aria-labelledby={props["aria-labeledby"]}>
      <div
        ref={(el) => {
          const instance = new VectorMap(el, {
            bounds: [-180, 85, 180, -60],
            tooltip: {
              enabled: true,
              border: {
                visible: false,
              },
              font: { color: "#fff" },
            },
            layers: {
              type: "area",
              dataSource: "https://js.devexpress.com/Content/data/vectorMap-sources/world.txt",
            },
          });

          createEffect(() => {
            for (const property in props.meta.properties.props as Properties) {
              instance.option(property, props.meta.properties.props[property]);
            }
          });
        }}
      />

    </div>
  );
}
