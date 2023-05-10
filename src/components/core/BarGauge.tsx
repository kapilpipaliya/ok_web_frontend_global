import { createEffect, For, Show } from "solid-js";
import { ComponentProps } from "./Form";
import BarGauge, { Properties } from "devextreme/viz/bar_gauge";
import { IdAttr, Vertex } from "../../lib/graph";
import { newVertex } from "../../lib/Vertex";

export function BarGaugeComponent() {
  const meta = newVertex(0, ["Meta"], {
    [IdAttr]: "meta",
    props: {},
  });

  const data = newVertex(0, ["Vertex"], { meta: [47.27, 65.32, 84.59, 71.86] });
  const setValue = (attribute: Vertex, data: any) => {
    console.log(attribute, data);
  };

  return <BarGaugeField meta={meta} data={data} setValue={setValue} />;
}
export function BarGaugeField(props: ComponentProps) {
  return (
    <div aria-labelledby={props["aria-labeledby"]}>
      <div
        ref={(el) => {
          const instance = new BarGauge(el, {
            startValue: 0,
            endValue: 100,
            values: props.data.properties[props.meta.properties[IdAttr]],
            label: {
              indent: 30,
              format: {
                type: "fixedPoint",
                precision: 1,
              },
              customizeText(arg) {
                return `${arg.valueText} %`;
              },
            },
            export: {
              enabled: true,
            },
            title: {
              text: "Series' Ratings",
              font: {
                size: 28,
              },
            },
          });
          createEffect(() => instance.option("values", props.data.properties[props.meta.properties[IdAttr]]));
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
