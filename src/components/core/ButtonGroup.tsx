import { DisplayComponentProps } from "./Form";
import ButtonGroup, { Properties } from "devextreme/ui/button_group";
import { createEffect } from "solid-js";
import { IdAttr } from "../../lib/graph";

export function ButtonGroupField(
  props: DisplayComponentProps & {
    onClick: (item: any) => void;
  },
) {
  return (
    <div
      ref={(el) => {
        const instance = new ButtonGroup(el, {
          items: [],
          selectionMode: "none",

          onItemClick: (e) => {
            props.onClick?.(e.itemData);
          },
        });
        createEffect(() => instance.option("selectedItems", props.data.properties[props.meta.properties[IdAttr]]));
        createEffect(() => {
          for (const property in props.meta.properties.props as Properties) {
            instance.option(property, props.meta.properties.props[property]);
          }
        });
      }}
    />
  );
}
