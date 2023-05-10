import { createEffect, For, Show } from "solid-js";
import { ComponentProps } from "./Form";
import Tabs, { Properties } from "devextreme/ui/tabs";
import { IdAttr, Vertex } from "../../lib/graph";
import { newVertex } from "../../lib/Vertex";

const tabsData = [
  {
    text: "Home",
    icon: "home",
  },
  {
    text: "About",
    icon: "info",
  },
];

export function TabsComponent() {
  const meta = newVertex(0, ["Meta"], {
    [IdAttr]: "meta",
    props: {},
  });

  const data = newVertex(0, ["Vertex"], { meta: tabsData });
  const setValue = (attribute: Vertex, data: any) => {
    console.log(attribute, data);
  };

  return <TabsField meta={meta} data={data} setValue={setValue} />;
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

          createEffect(() => instance.option("dataSource", props.data.properties[props.meta.properties[IdAttr]]));

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
