import { createEffect, For, Show } from "solid-js";

import TextBox, { Properties } from "devextreme/ui/text_box";
import { NativeEventInfo } from "devextreme/events";
import { ComponentProps } from "./Form";
import { IdAttr } from "../../lib/graph";

export function TextInputField(props: ComponentProps) {
  return (
    <div aria-labelledby={props["aria-labeledby"]}>
      <div
        ref={(el) => {
          const instance = new TextBox(el, {
            onChange: (e: NativeEventInfo<TextBox, KeyboardEvent>) => {
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
