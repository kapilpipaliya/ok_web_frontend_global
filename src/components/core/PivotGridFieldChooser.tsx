import {createEffect, For, Show} from "solid-js";
import {ComponentProps, Vertex} from "./Form";
import PivotGrid, {Properties} from "devextreme/ui/pivot_grid";
import PivotGridFieldChooser, {Properties as PivotGridFieldChooserProperties} from "devextreme/ui/pivot_grid_field_chooser";
import {newVertex} from "./utils";
// @ts-ignore
import {pivotGridSalesData} from '../data/pivotGridSalesData.js'

console.log(pivotGridSalesData);
{/* @todo - currently not working */}
export function PivotGridFieldChooserComponent() {
  const meta = newVertex(0, ["Meta"], {
    id: "meta",
    props: { },
  });

  const data = newVertex(0, ["Vertex"], { meta: '' });
  const setValue = (attribute: Vertex, data: any) => {
    console.log(attribute, data);
  };

  return <PivotGridFieldChooserField meta={meta} data={data} setValue={setValue} />
}
export function PivotGridFieldChooserField(props: ComponentProps) {
  let pivotGridInstance: PivotGrid;
  let pivotGridFieldChooserInstance: PivotGridFieldChooser;
  return (
    <div aria-labelledby={props["aria-labeledby"]}>
      <div
        ref={(el) => {
          pivotGridInstance = new PivotGrid(el, {
            allowSortingBySummary: true,
            allowSorting: true,
            allowFiltering: true,
            showBorders: true,
            dataSource: {
              fields: [{
                caption: 'Region',
                width: 120,
                dataField: 'region',
                area: 'row',
                headerFilter: {
                  allowSearch: true,
                },
              }, {
                caption: 'City',
                dataField: 'city',
                width: 150,
                area: 'row',
                headerFilter: {
                  allowSearch: true,
                },
                selector: (data: { city: string; country: string; }) => data.city + ' (' + data.country + ')',
              }, {
                dataField: 'date',
                dataType: 'date',
                area: 'column',
              }, {
                caption: 'Sales',
                dataField: 'amount',
                dataType: 'number',
                summaryType: 'sum',
                format: 'currency',
                area: 'data',
              }],
              store: pivotGridSalesData,
            },
            fieldChooser: {
              enabled: false,
            },
          });

          createEffect(() => {
            for (const property in props.meta.properties.props as Properties) {
              pivotGridInstance.option(property, props.meta.properties.props[property]);
            }
          });
        }}
      />

      <div
        ref={(el) => {
          pivotGridFieldChooserInstance = new PivotGridFieldChooser(el, {
            dataSource: pivotGridInstance.getDataSource(),
            texts: {
              allFields: 'All',
              columnFields: 'Columns',
              dataFields: 'Data',
              rowFields: 'Rows',
              filterFields: 'Filter',
            },
            width: 400,
            height: 400,
          })
        }
        }
      />
      <Show when={props.errors}>
        <For each={Object.values(props.errors!)}>
          {(errorMsg: string) => <small>{errorMsg}</small>}
        </For>
      </Show>
    </div>
  );
}