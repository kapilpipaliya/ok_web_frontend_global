import {createEffect, For, Show} from "solid-js";
import {ComponentProps, Vertex} from "./Form";
import Tabs, {Properties} from "devextreme/ui/tabs";
import {newVertex} from "./utils";

const tabsData = [
  {
    "text": "Home",
    "icon": "home"
  },
  {
    "text": "About",
    "icon": "info"
  }
]

export function TabsComponent() {
  const meta = newVertex(0, ["Meta"], {
    id: "meta",
    props: { },
  });

  const data = newVertex(0, ["Vertex"], { meta: tabsData });
  const setValue = (attribute: Vertex, data: any) => {
    console.log(attribute, data);
  };

  return <TabsField meta={meta} data={data} setValue={setValue} />
}
export function TabsField(props: ComponentProps) {
  return (
    <div aria-labelledby={props["aria-labeledby"]}>
      <div
        ref={(el) => {
          const instance = new Tabs(el, {
            onSelectionChanged(e) {
              props.setValue(props.meta, e.addedItems[0].text);
            },
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