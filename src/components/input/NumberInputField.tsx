import { createEffect, For, Show } from "solid-js";

import NumberBox, { Properties } from "devextreme/ui/number_box";
import { Vertex } from "./Form";

export interface NumberInputFieldProps extends Properties {
 meta: Vertex;
 vertex: Vertex;
 errors?: string[];
 "aria-labeledby"?: string;

 setValue(attribute: Vertex, data: any): void;
}

export function NumberInputField(props: NumberInputFieldProps) {
  return (
   <div aria-labeledby={props["aria-labeledby"]}>
    <div ref={el => {
     const instance = new NumberBox(el, {
      onValueChanged: (e) => {
       props.setValue(props.meta, e.value);
      }
     });
     createEffect(() => instance.option("value", props.vertex.properties[props.meta.properties.id]));
     createEffect(() => {
      for (const property in props.meta.properties.props as Properties) {
       instance.option(property, props.meta.properties.props[property]);
      }
     });
    }} />
    <Show when={props.errors}>
     <For each={Object.values(props.errors!)}>{(errorMsg: string) =>
      <small>{errorMsg}</small>}</For>
    </Show>
   </div>
  );
}
