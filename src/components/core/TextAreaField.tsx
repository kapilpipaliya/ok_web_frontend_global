import { createEffect, For, Show } from "solid-js";

import TextArea, { Properties } from "devextreme/ui/text_area";
import { ComponentProps } from "./Form";
import { IdAttr } from "../../lib/graph";

export function TextAreaField(props: ComponentProps) {
  return (
    <div aria-labelledby={props["aria-labeledby"]}>
      <div
        ref={(el) => {
          const instance = new TextArea(el, {
            onChange: (e) => {
              props.setValue(props.meta, e.component.option("value"));
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
