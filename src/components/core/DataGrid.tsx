import { createEffect, For, Show } from "solid-js";
import { ComponentProps } from "./Form";
import DataGrid, { Properties } from "devextreme/ui/data_grid";
import { IdAttr, Vertex } from "../../lib/graph";
import { newVertex } from "../../lib/Vertex";

const dataGridData = [
  {
    ID: 1,
    CompanyName: "Super Mart of the West",
    City: "Bentonville",
    State: "Arkansas",
  },
  {
    ID: 2,
    CompanyName: "Electronics Depot",
    City: "Atlanta",
    State: "Georgia",
  },
  {
    ID: 3,
    CompanyName: "K&S Music",
    City: "Minneapolis",
    State: "Minnesota",
  },
  {
    ID: 4,
    CompanyName: "Tom's Club",
    City: "Issaquah",
    State: "Washington",
  },
  {
    ID: 5,
    CompanyName: "E-Mart",
    City: "Hoffman Estates",
    State: "Illinois",
  },
];

export function DataGridComponent() {
  const meta = newVertex(0, ["Meta"], {
    [IdAttr]: "meta",
    props: {},
  });

  const data = newVertex(0, ["Vertex"], { meta: dataGridData });
  const setValue = (attribute: Vertex, data: any) => {
    console.log(attribute, data);
  };

  return <DataGridField meta={meta} data={data} setValue={setValue} />;
}
export function DataGridField(props: ComponentProps) {
  return (
    <div aria-labelledby={props["aria-labeledby"]}>
      <div
        ref={(el) => {
          const instance = new DataGrid(el, {});

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
