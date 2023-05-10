import { createEffect, For, Show } from "solid-js";
import { ComponentProps } from "./Form";
import Menu, { Properties } from "devextreme/ui/menu";
import { IdAttr, Vertex } from "../../lib/graph";
import { newVertex } from "../../lib/Vertex";

const menuData = [
  {
    text: "Video Players",
  },
  {
    text: "Televisions",
  },
  {
    text: "Monitors",
    items: [
      {
        text: "DesktopLCD 19",
      },
      {
        text: "DesktopLCD 21",
      },
      {
        text: "DesktopLED 21",
      },
    ],
  },
];

export function MenuComponent() {
  const meta = newVertex(0, ["Meta"], {
    [IdAttr]: "meta",
    props: {},
  });

  const data = newVertex(0, ["Vertex"], { meta: menuData });
  const setValue = (attribute: Vertex, data: any) => {
    console.log(attribute, data);
  };

  return <MenuField meta={meta} data={data} setValue={setValue} />;
}
export function MenuField(props: ComponentProps) {
  return (
    <div aria-labelledby={props["aria-labeledby"]}>
      <div
        ref={(el) => {
          const instance = new Menu(el, {
            onItemClick: (e: any) => {
              props.setValue(props.meta, e.itemData);
            },
          });
          createEffect(() => instance.option("dataSource", props.data.properties[props.meta.properties[IdAttr]]));
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
