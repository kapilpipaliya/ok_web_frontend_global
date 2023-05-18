import { createEffect, For, Show, onCleanup } from "solid-js";
import { ComponentProps } from "./Form";
import Sankey, { Properties } from "devextreme/viz/sankey";
import { IdAttr, Vertex } from "../../lib/graph";
import { newVertex } from "../../lib/Vertex";

const sankeyData = [
  {
    source: "Brazil",
    target: "Portugal",
    weight: 5,
  },
  {
    source: "Brazil",
    target: "France",
    weight: 1,
  },
  {
    source: "Brazil",
    target: "Spain",
    weight: 1,
  },
  {
    source: "Brazil",
    target: "England",
    weight: 1,
  },
  {
    source: "Canada",
    target: "Portugal",
    weight: 1,
  },
  {
    source: "Canada",
    target: "France",
    weight: 5,
  },
  {
    source: "Canada",
    target: "England",
    weight: 1,
  },
  {
    source: "Mexico",
    target: "Portugal",
    weight: 1,
  },
  {
    source: "Mexico",
    target: "France",
    weight: 1,
  },
  {
    source: "Mexico",
    target: "Spain",
    weight: 5,
  },
  {
    source: "Mexico",
    target: "England",
    weight: 1,
  },
];

export function SankeyComponent() {
  const meta = newVertex(0, ["Meta"], {
    [IdAttr]: "meta",
    props: {},
  });

  const data = newVertex(0, ["Vertex"], { meta: sankeyData });
  const setValue = (attribute: Vertex, data: any) => {
    console.log(attribute, data);
  };

  return <SankeyField meta={meta} data={data} setValue={setValue} />;
}
export function SankeyField(props: ComponentProps) {
  return (
    <div aria-labelledby={props["aria-labeledby"]}
        ref={(el) => {
          const instance = new Sankey(el, {
            link: {
              colorMode: "gradient",
            },
          });

          createEffect(() => instance.option("dataSource", props.data.properties[props.meta.properties[IdAttr]]));

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
