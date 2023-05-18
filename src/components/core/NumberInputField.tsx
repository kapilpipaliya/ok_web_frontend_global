import { createEffect, For, Show, onCleanup } from "solid-js";

import NumberBox, { Properties } from "devextreme/ui/number_box";
import { ComponentProps } from "./Form";

export function NumberInputField(props: ComponentProps) {
  return (
    <div aria-labelledby={props["aria-labeledby"]}
        ref={(el) => {
          const instance = new NumberBox(el, {
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
          onCleanup(() => instance.dispose());
        }}
      />

  );
}
