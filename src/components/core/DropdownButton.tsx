import { createEffect, For, Show } from "solid-js";
import { ComponentProps } from "./Form";
import DropDownButton, { Properties } from "devextreme/ui/drop_down_button";
import { IdAttr, Vertex } from "../../lib/graph";
import { newVertex } from "../../lib/Vertex";

const dropdownButtonData = [
  {
    id: 1,
    name: "Left",
    icon: "alignleft",
  },
  {
    id: 4,
    name: "Right",
    icon: "alignright",
  },
  {
    id: 2,
    name: "Center",
    icon: "aligncenter",
  },
  {
    id: 3,
    name: "Justify",
    icon: "alignjustify",
  },
];
export function DropDownButtonComponent() {
  const meta = newVertex(0, ["Meta"], {
    [IdAttr]: "meta",
    props: {},
  });

  const data = newVertex(0, ["Vertex"], { meta: dropdownButtonData });
  const setValue = (attribute: Vertex, data: any) => {
    console.log(attribute, data);
  };

  return <DropDownButtonField meta={meta} data={data} setValue={setValue} />;
}
export function DropDownButtonField(props: ComponentProps) {
  return (
    <div aria-labelledby={props["aria-labeledby"]}>
      <div
        ref={(el) => {
          const instance = new DropDownButton(el, {
            displayExpr: "name",
            items: props.data.properties[props.meta.properties[IdAttr]],
            keyExpr: "id",
            selectedItemKey: 1,
            stylingMode: "text",
            useSelectMode: true,
            width: 100,
            onSelectionChanged: (e: any) => {
              props.setValue(props.meta, e.item);
            },
          });
          createEffect(() => instance.option("items", props.data.properties[props.meta.properties[IdAttr]]));
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
