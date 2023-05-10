import Switch, { Properties } from "devextreme/ui/switch";
import { createEffect, For, Show } from "solid-js";
import { ComponentProps } from "./Form";
import { IdAttr } from "../../lib/graph";

export function SwitchField(props: ComponentProps) {
  return (
    <div aria-labelledby={props["aria-labeledby"]}>
      <div
        ref={(el) => {
          const instance = new Switch(el, {
            // disabled: true,
            // readOnly: true,
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
