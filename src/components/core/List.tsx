import { createEffect, For, Show, onCleanup } from "solid-js";
import { ComponentProps } from "./Form";
import List, { Properties } from "devextreme/ui/list";
import { IdAttr, Vertex } from "../../lib/graph";
import { newVertex } from "../../lib/Vertex";

const listData = [
  "Prepare 2013 Financial",
  "Prepare 3013 Marketing Plan",
  "Update Personnel Files",
  "Review Health Insurance Options Under the Affordable Care Act",
  "Choose between PPO and HMO Health Plan",
  "Google AdWords Strategy",
  "New Brochures",
  "2013 Brochure Designs",
  "Brochure Design Review",
  "Website Re-Design Plan",
  "Rollout of New Website and Marketing Brochures",
  "Update Sales Strategy Documents",
  "Create 2012 Sales Report",
  "Direct vs Online Sales Comparison Report",
];

export function ListComponent() {
  const meta = newVertex(0, ["Meta"], {
    [IdAttr]: "meta",
    props: {},
  });

  const data = newVertex(0, ["Vertex"], { meta: listData });
  const setValue = (attribute: Vertex, data: any) => {
    console.log(attribute, data);
  };

  return <ListField meta={meta} data={data} setValue={setValue} />;
}
export function ListField(props: ComponentProps) {
  return (
    <div aria-labelledby={props["aria-labeledby"]}
        ref={(el) => {
          const instance = new List(el, {
            onItemClick: (e: any) => {
              props.setValue(props.meta, e.itemData);
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
