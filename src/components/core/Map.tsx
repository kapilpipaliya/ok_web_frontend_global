import { createEffect, For, Show, onCleanup } from "solid-js";
import { ComponentProps } from "./Form";
import Map, { Properties } from "devextreme/ui/map";
import { IdAttr, Vertex } from "../../lib/graph";
import { newVertex } from "../../lib/Vertex";

export function MapComponent() {
  const meta = newVertex(0, ["Meta"], {
    [IdAttr]: "meta",
    props: {},
  });

  const data = newVertex(0, ["Vertex"], { meta: "" });
  const setValue = (attribute: Vertex, data: any) => {
    console.log(attribute, data);
  };

  return <MapField meta={meta} data={data} setValue={setValue} />;
}
export function MapField(props: ComponentProps) {
  return (
    <div aria-labelledby={props["aria-labeledby"]}
        ref={(el) => {
          const instance = new Map(el, {
            provider: "bing",
            type: "satellite",
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
