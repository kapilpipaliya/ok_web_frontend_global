import {createEffect, For, Show} from "solid-js";
import {ComponentProps, Vertex} from "./Form";
import HTMLEditor, {Properties} from "devextreme/ui/html_editor";
import {newVertex} from "./utils";

export function HTMLEditorComponent() {
  const meta = newVertex(0, ["Meta"], {
    id: "meta",
    props: { },
  });

  const data = newVertex(0, ["Vertex"], { meta: "HTml editor value" });
  const setValue = (attribute: Vertex, data: any) => {
    console.log(attribute, data);
  };

  return <HTMLEditorField meta={meta} data={data} setValue={setValue} />
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
                  acceptedValues: [
                    1,
                    2,
                    3,
                    false
                  ]
                },
                "variable"
              ]
            },
            value: props.data.properties[props.meta.properties.id],
            variables: {
              dataSource: [
                "FirstName",
                "LastName",
                "Company"
              ],
              escapeChar: [
                "{",
                "}"
              ]
            }
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
      <Show when={props.errors}>
        <For each={Object.values(props.errors!)}>
          {(errorMsg: string) => <small>{errorMsg}</small>}
        </For>
      </Show>
    </div>
  );
}