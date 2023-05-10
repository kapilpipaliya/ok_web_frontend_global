import { createEffect, For, Show } from "solid-js";
import { ComponentProps } from "./Form";
import LinearGauge, { Properties } from "devextreme/viz/linear_gauge";
import { IdAttr, Vertex } from "../../lib/graph";
import { newVertex } from "../../lib/Vertex";

export function LinearGaugeComponent() {
  const meta = newVertex(0, ["Meta"], {
    [IdAttr]: "meta",
    props: {},
  });

  const data = newVertex(0, ["Vertex"], { meta: 48 });
  const setValue = (attribute: Vertex, data: any) => {
    console.log(attribute, data);
  };

  return <LinearGaugeField meta={meta} data={data} setValue={setValue} />;
}
export function LinearGaugeField(props: ComponentProps) {
  return (
    <div aria-labelledby={props["aria-labeledby"]}>
      <div
        ref={(el) => {
          const instance = new LinearGauge(el, {
            value: props.data.properties[props.meta.properties[IdAttr]],
          });
          createEffect(() => instance.option("value", props.data.properties[props.meta.properties[IdAttr]]));
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
