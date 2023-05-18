import { createEffect, For, Show, onCleanup } from "solid-js";
import { ComponentProps } from "./Form";
import ContextMenu, { Properties } from "devextreme/ui/context_menu";
import { IdAttr, Vertex } from "../../lib/graph";
import { newVertex } from "../../lib/Vertex";

const contextMenuData = [
  {
    text: "Hide",
  },
  {
    text: "Delete",
  },
  {
    text: "Clipboard",
    items: [
      {
        text: "Copy",
      },
      {
        text: "Clear",
      },
      {
        text: "Paste",
      },
    ],
  },
];
export function ContextMenuComponent() {
  const meta = newVertex(0, ["Meta"], {
    [IdAttr]: "meta",
    props: {},
  });

  const data = newVertex(0, ["Vertex"], { meta: contextMenuData });
  const setValue = (attribute: Vertex, data: any) => {
    console.log(attribute, data);
  };

  return <ContextMenuField meta={meta} data={data} setValue={setValue} />;
}
export function ContextMenuField(props: ComponentProps) {
  return (
    <div aria-labelledby={props["aria-labeledby"]}
        ref={(el) => {
          const instance = new ContextMenu(el, {
            visible: true,
            onItemClick: (e: any) => {
              props.setValue(props.meta, e.itemData.text);
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
