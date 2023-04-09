import { ComponentProps } from "./Form";
import TextBox, { Properties } from "devextreme/ui/text_box";
import { createEffect } from "solid-js";
import { NativeEventInfo } from "devextreme/events";
import TextArea from "devextreme/ui/text_area";

export default function FieldSetComponent(props: ComponentProps) {
  return (
    <div aria-labelledby={props["aria-labeledby"]}>
      <div
        ref={(el) => {
          const instance = new TextBox(el, {
            value: "Some text box value",
            onChange: (e: NativeEventInfo<TextBox, KeyboardEvent>) => {
              props.setValue(props.meta, e.component.option("value"));
            },
          });
          createEffect(
            () =>
              props.data.properties[props.meta.properties.id] &&
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
        }}
      />
      <br />
      <div
        ref={(el) => {
          const instance = new TextArea(el, {
            value:
              "lorem ipsum dolor sit amet lorem ipsum dolor sit amet lorem ipsum dolor sit amet lorem ipsum dolor sit amet ",
            height: 100,
            onChange: (e: NativeEventInfo<TextArea, KeyboardEvent>) => {
              console.log(e.component.option("value"));
              props.setValue(props.meta, e.component.option("value"));
            },
          });
          createEffect(
            () =>
              props.data.properties[props.meta.properties.id] &&
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
        }}
      />
    </div>
  );
}
