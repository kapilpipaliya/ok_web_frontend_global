import { createEffect, For, Show, onCleanup } from "solid-js";
import { ComponentProps } from "./Form";
import TabPanel, { Properties } from "devextreme/ui/tab_panel";
import { IdAttr, Vertex } from "../../lib/graph";
import { newVertex } from "../../lib/Vertex";

const tabPanelData = [
  {
    title: "Info",
    text: "John Smith, 1986",
  },
  {
    title: "Contacts",
    text: "phone: (555)555-5555, email: John.Smith@example.com",
  },
  {
    title: "Address",
    text: "CA San Francisco Stanford Ave",
  },
];

export function TabPanelComponent() {
  const meta = newVertex(0, ["Meta"], {
    [IdAttr]: "meta",
    props: {},
  });

  const data = newVertex(0, ["Vertex"], { meta: tabPanelData });
  const setValue = (attribute: Vertex, data: any) => {
    console.log(attribute, data);
  };

  return <TabPanelField meta={meta} data={data} setValue={setValue} />;
}
export function TabPanelField(props: ComponentProps) {
  return (
    <div aria-labelledby={props["aria-labeledby"]}
        ref={(el) => {
          const instance = new TabPanel(el, {
            height: 260,
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
          onCleanup(() => instance.dispose());
        }}
      />

  );
}
