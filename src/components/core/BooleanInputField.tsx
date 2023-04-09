import { createEffect } from "solid-js";

import CheckBox, { Properties } from "devextreme/ui/check_box";
import { ComponentProps } from "./Form";

export function BooleanInputField(props: ComponentProps) {
  return (
    <div aria-labelledby={props["aria-labeledby"]}>
      <div
        ref={(el) => {
          const instance = new CheckBox(el, {
            enableThreeStateBehavior: true,
            onValueChanged: (e) => {
              props.setValue(props.meta, e.value);
              // props.setValue((e.event?.currentTarget as HTMLInputElement).checked);
            },
          });
          createEffect(() =>
            instance.option(
              "value",
              props.data.properties[props.meta.properties.id]
            )
          );
          createEffect(() => {
            for (const property in props.meta.properties.props as Properties) {
              instance.option(property, props.meta.properties.props[property]);
            }
          });
          createEffect(() => {
            instance.option(
              "validationStatus",
              props.errors ? "invalid" : "valid"
            );
          });
          createEffect(() => {
            if (props.errors) {
              instance.option(
                "validationErrors",
                props.errors.map((error: string) => {
                  error;
                })
              );
            } else {
              instance.option("validationErrors", undefined);
            }
          });
        }}
      />
    </div>
  );
}
