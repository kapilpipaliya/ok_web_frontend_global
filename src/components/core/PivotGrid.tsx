import {createEffect, For, Show} from "solid-js";
import {ComponentProps, Vertex} from "./Form";
import PivotGrid, {Properties} from "devextreme/ui/pivot_grid";
import {newVertex} from "./utils";

const pivotGridItems = {
    "fields": [
      {
        "dataField": "[Product].[Category]",
        "area": "row"
      },
      {
        "dataField": "[Product].[Subcategory]",
        "area": "row"
      },
      {
        "dataField": "[Ship Date].[Calendar Year]",
        "area": "column"
      },
      {
        "dataField": "[Ship Date].[Month of Year]",
        "area": "column"
      },
      {
        "dataField": "[Measures].[Customer Count]",
        "area": "data"
      }
    ],
    "store": {
      "type": "xmla",
      "url": "https://demos.devexpress.com/Services/OLAP/msmdpump.dll",
      "catalog": "Adventure Works DW Standard Edition",
      "cube": "Adventure Works"
    }
  }

export function PivotGridComponent() {
  const meta = newVertex(0, ["Meta"], {
    id: "meta",
    props: { },
  });

  const data = newVertex(0, ["Vertex"], { meta: pivotGridItems });
  const setValue = (attribute: Vertex, data: any) => {
    console.log(attribute, data);
  };

  return <PivotGridField meta={meta} data={data} setValue={setValue} />
}
export function PivotGridField(props: ComponentProps) {
  return (
    <div aria-labelledby={props["aria-labeledby"]}>
      <div
        ref={(el) => {
          const instance = new PivotGrid(el, {

            fieldChooser: {
              width: 400
            },
            showBorders: true
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