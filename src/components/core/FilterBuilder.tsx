import {createEffect, For, Show} from "solid-js";
import {ComponentProps, Vertex} from "./Form";
import FilterBuilder, {Properties} from "devextreme/ui/filter_builder";
import {newVertex} from "./utils";

const filter = [
  ['Product_Current_Inventory', '<>', 0],
  'or',
  [
    ['Product_Name', 'contains', 'HD'],
    'and',
    ['Product_Cost', '<', 200],
  ],
];
const filterBuilderData = [
  {
    caption: 'ID',
    width: 50,
    dataField: 'Product_ID',
    dataType: 'number',
  }, {
    dataField: 'Product_Name',
    dataType: 'string',
  }, {
    caption: 'Cost',
    dataField: 'Product_Cost',
    dataType: 'number',
    format: 'currency',
  }, {
    dataField: 'Product_Sale_Price',
    caption: 'Sale Price',
    dataType: 'number',
    format: 'currency',
  }, {
    dataField: 'Product_Retail_Price',
    caption: 'Retail Price',
    dataType: 'number',
    format: 'currency',
  }, {
    dataField: 'Product_Current_Inventory',
    dataType: 'number',
    caption: 'Inventory',
  },
];

export function FilterBuilderComponent() {
  const meta = newVertex(0, ["Meta"], {
    id: "meta",
    props: { },
  });

  const data = newVertex(0, ["Vertex"], { meta: filterBuilderData });
  const setValue = (attribute: Vertex, data: any) => {
    console.log(attribute, data);
  };

  return <FilterBuilderField meta={meta} data={data} setValue={setValue} />
}
export function FilterBuilderField(props: ComponentProps) {
  return (
    <div aria-labelledby={props["aria-labeledby"]}>
      <div
        ref={(el) => {
          const instance = new FilterBuilder(el, {
            allowHierarchicalFields: true,
            fields: props.data.properties[props.meta.properties.id],
            onEditorPreparing: function(e) {
              e.editorOptions.width = 125;
              },
            value: filter
          });

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