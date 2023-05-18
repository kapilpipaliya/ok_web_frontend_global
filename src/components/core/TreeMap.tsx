import { createEffect, For, Show, onCleanup } from "solid-js";
import { ComponentProps } from "./Form";
import TreeMap, { Properties } from "devextreme/viz/tree_map";
import { IdAttr, Vertex } from "../../lib/graph";
import { newVertex } from "../../lib/Vertex";

const treeMapData = [
  {
    name: "Fruits",
    items: [
      {
        name: "Apples",
        value: 4,
      },
      {
        name: "Oranges",
        value: 10,
      },
      {
        name: "Lemons",
        value: 6,
      },
    ],
  },
  {
    name: "Vegetables",
    items: [
      {
        name: "Cucumbers",
        value: 4,
      },
      {
        name: "Tomatoes",
        value: 8,
      },
      {
        name: "Turnips",
        value: 7,
      },
    ],
  },
];

export function TreeMapComponent() {
  const meta = newVertex(0, ["Meta"], {
    [IdAttr]: "meta",
    props: {},
  });

  const data = newVertex(0, ["Vertex"], { meta: treeMapData });
  const setValue = (attribute: Vertex, data: any) => {
    console.log(attribute, data);
  };

  return <TreeMapField meta={meta} data={data} setValue={setValue} />;
}
export function TreeMapField(props: ComponentProps) {
  return (
    <div aria-labelledby={props["aria-labeledby"]}
        ref={(el) => {
          const instance = new TreeMap(el, {});

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
