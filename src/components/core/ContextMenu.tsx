import {createEffect, For, Show} from "solid-js";
import {ComponentProps, Vertex} from "./Form";
import ContextMenu, {Properties} from "devextreme/ui/context_menu";
import {newVertex} from "./utils";

const contextMenuData = [
  {
    "text": "Hide"
  },
  {
    "text": "Delete"
  },
  {
    "text": "Clipboard",
    "items": [
      {
        "text": "Copy"
      },
      {
        "text": "Clear"
      },
      {
        "text": "Paste"
      }
    ]
  }
];
export function ContextMenuComponent() {
  const meta = newVertex(0, ["Meta"], {
    id: "meta",
    props: { },
  });

  const data = newVertex(0, ["Vertex"], { meta: contextMenuData });
  const setValue = (attribute: Vertex, data: any) => {
    console.log(attribute, data);
  };

  return <ContextMenuField meta={meta} data={data} setValue={setValue} />
}
export function ContextMenuField(props: ComponentProps) {
  return (
    <div aria-labelledby={props["aria-labeledby"]}>
      <div
        ref={(el) => {
          const instance = new ContextMenu(el, {

            visible: true,
            onItemClick: (e: any) => {
              props.setValue(props.meta, e.itemData.text);
            }
          });
          createEffect(() =>
            instance.option(
              "dataSource",
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