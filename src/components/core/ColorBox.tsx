import ColorBox, { Properties } from "devextreme/ui/color_box";
import { createEffect, For, Show } from "solid-js";
import { ComponentProps } from "./Form";

export function ColorBoxField(props: ComponentProps) {
  return (
    <div aria-labelledby={props["aria-labeledby"]}>
      <div
        ref={(el) => {
          const instance = new ColorBox(el, {
            applyButtonText: "Apply",
            cancelButtonText: "Cancel",
            onValueChanged: (e) => {
              props.setValue(props.meta, e.value);
            },
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
