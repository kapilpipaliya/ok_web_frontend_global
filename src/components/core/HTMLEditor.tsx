import { createEffect, For, Show } from "solid-js";
import { ComponentProps } from "./Form";
import HTMLEditor, { Properties } from "devextreme/ui/html_editor";
import { IdAttr, Vertex } from "../../lib/graph";
import { newVertex } from "../../lib/Vertex";

export function HTMLEditorComponent() {
  const meta = newVertex(0, ["Meta"], {
    [IdAttr]: "meta",
    props: {},
  });

  const data = newVertex(0, ["Vertex"], { meta: "HTml editor value" });
  const setValue = (attribute: Vertex, data: any) => {
    console.log(attribute, data);
  };

  return <HTMLEditorField meta={meta} data={data} setValue={setValue} />;
}
export function HTMLEditorField(props: ComponentProps) {
  return (
    <div aria-labelledby={props["aria-labeledby"]}>
      <div
        ref={(el) => {
          const instance = new HTMLEditor(el, {
            toolbar: {
              items: [
                "bold",
                "italic",
                "color",
                "background",
                "link",
                {
                  name: "header",
                  acceptedValues: [1, 2, 3, false],
                },
                "variable",
              ],
            },
            value: props.data.properties[props.meta.properties[IdAttr]],
            variables: {
              dataSource: ["FirstName", "LastName", "Company"],
              escapeChar: ["{", "}"],
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
