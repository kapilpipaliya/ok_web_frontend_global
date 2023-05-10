import TagBox, { Properties } from "devextreme/ui/tag_box";
import { createEffect, For, Show } from "solid-js";
import { ComponentProps } from "./Form";
import { IdAttr } from "../../lib/graph";

export function TagBoxField(props: ComponentProps) {
  return (
    <div aria-labelledby={props["aria-labeledby"]}>
      <div
        ref={(el) => {
          const instance = new TagBox(el, {
            items: props.items,
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
