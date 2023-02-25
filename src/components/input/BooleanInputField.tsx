import { createEffect } from "solid-js";

import CheckBox, { Properties } from "devextreme/ui/check_box";
import { Vertex } from "./Form";

export interface BooleanInputFieldProps extends Properties {
 meta: Vertex;
 vertex: Vertex;
 errors?: string[];
 "aria-labeledby"?: string;

 setValue(attribute: Vertex, data: any): void;
}

export function BooleanInputField(props: BooleanInputFieldProps) {

  return (
   <div aria-labeledby={props["aria-labeledby"]}>
    <div ref={el => {
     const instance = new CheckBox(el, {
      enableThreeStateBehavior: true,
      onValueChanged: (e) => {
       props.setValue(props.meta, e.value);
       // props.setValue((e.event?.currentTarget as HTMLInputElement).checked);
      }
     });
     createEffect(() => instance.option("value", props.vertex.properties[props.meta.properties.id]));
     createEffect(() => {
      for (const property in props.meta.properties.props as Properties) {
       instance.option(property, props.meta.properties.props[property]);
      }
     });
     createEffect(() => {
      instance.option("validationStatus", props.errors ? "invalid" : "valid");
     });
     createEffect(() => {
      if (props.errors) {
       instance.option("validationErrors", props.errors.map((error: string) => {
        error;
       }));
      } else {
       instance.option("validationErrors", undefined);
      }
     });
    }} />
   </div>
  );
}
