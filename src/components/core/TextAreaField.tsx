import { createEffect, For, Show } from "solid-js";

import TextArea, { Properties } from "devextreme/ui/text_area";
import { ComponentProps } from "./Form";

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

          createEffect(() =>
            instance.option(
              "value",
              props.data.properties[props.meta.properties.id]
            )
          )

          createEffect(() => {
            for (const property in props.meta.properties.props as Properties) {
              instance.option(property, props.meta.properties.props[property]);
            }
          });
        }}
      />

      <Show when={props.errors}>
        <For each={Object.values(props.errors!)}>
          {(errorMsg: string) => <small>{errorMsg}</small>}
        </For>
      </Show>
    </div>
  );
}
