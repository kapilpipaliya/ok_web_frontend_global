import { createEffect, createSignal } from "solid-js";
import DropDownBox, { Properties } from "devextreme/ui/drop_down_box";
import { ComponentProps } from "./Form";

export function DropDownTry2(props: ComponentProps) {
  const [selectedValue, setSelectedValue] = createSignal(null);
  const options = [
    { id: 1, text: "Option 1" },
    { id: 2, text: "Option 2" },
    { id: 3, text: "Option 3" },
  ];

  return (
    <div aria-labelledby={props["aria-labeledby"]}>
      <div
        ref={(el) => {
          const instance = new DropDownBox(el, {
            dataSource: options,
            displayExpr: "text",
            valueExpr: "id",
            value: selectedValue(),
            onValueChanged: (e) => {
              setSelectedValue(e.value);
              console.log("onValueChanged", e.value);
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
        }}
      />
    </div>
  );
}
