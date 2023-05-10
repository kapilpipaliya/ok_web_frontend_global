import Autocomplete, { Properties } from "devextreme/ui/autocomplete";
import { createEffect, For, Show } from "solid-js";
import { ComponentProps } from "./Form";
import { IdAttr } from "../../lib/graph";

export function AutocompleteField(props: ComponentProps) {
  return (
    <div aria-labelledby={props["aria-labeledby"]}>
      <div
        ref={(el) => {
          const instance = new Autocomplete(el, {
            dataSource: ["A", "B", "C"],
            onValueChanged: (e) => {
              props.setValue(props.meta, e.value);
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
