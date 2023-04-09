import { createEffect, createSignal, For, Show } from "solid-js";
import { ComponentProps } from "./Form";

import DropDownBox, { Properties } from "devextreme/ui/drop_down_box";
import dxDataGrid from "devextreme/ui/data_grid";
import ArrayStore from "devextreme/data/array_store";
import DataSource from "devextreme/data/data_source";
import CustomStore from "devextreme/data/custom_store";

export function DropDownGrid(props: ComponentProps) {
  const [treeView, setTreeView] = createSignal(null);
  const [dataGrid, setDataGrid] = createSignal(null);

  const syncTreeViewSelection = (treeViewInstance: any, value: any) => {
    console.log("syncTreeViewSelection", treeViewInstance, value);
    if (!treeViewInstance) return;
    if (!value) {
      //   treeViewInstance.unselectAll();
      console.log("unselect all");
    } else {
      treeViewInstance.selectItem(value);
    }
  };

  const makeAsyncDataSource = (jsonFile: any) => {
    return new CustomStore({
      loadMode: "raw",
      key: "ID",
      load(): any {
        return fetch(`data/${jsonFile}`).then((response) => response.json());
      },
    });
  };

  const store = new ArrayStore({
    key: "ID",
    data: props.items,
  });

  const dataSource = new DataSource({
    store: store,
  });

  return (
    <div aria-labelledby={props["aria-labeledby"]}>
      <div
        ref={(el) => {
          const instance = new DropDownBox(el, {
            value: 3,
            valueExpr: "ID",
            deferRendering: false,
            placeholder: "Select a value...",
            displayExpr: function (item: object) {
              return item && `${item.CompanyName} <${item.Phone}>`;
            },
            showClearButton: true,
            // dataSource: makeAsyncDataSource("customers.json"),
            dataSource: dataSource,
            contentTemplate: (e: any) => {
              const value = e.component.option("value");
              const $dataGrid = new dxDataGrid(e.component.content(), {
                dataSource: e.component.getDataSource(),
                columns: ["CompanyName", "City", "Phone"],
                hoverStateEnabled: true,
                paging: {
                  pageSize: 10,
                  enabled: true,
                },
                filterRow: { visible: true },
                scrolling: { mode: "virtual" },
                selection: {
                  mode: "single",
                },
                selectedRowKeys: [value],
                height: "100%",
                onSelectionChanged: (e: any) => {
                  const keys = e.selectedRowKeys;
                  const hasSelection = keys.length;
                  console.log("onSelectionChanged", keys, hasSelection);

                  e.component.option(
                    "selectedRowKeys",
                    hasSelection ? keys[0] : null
                  );
                  // set value of keys[0] to props.setvalue
                  props.setValue(props.meta, keys[0]);
                },
              });

              setDataGrid($dataGrid.instance);

              e.component.on("valueChanged", (args: any) => {
                props.setValue(props.meta, e.value);
                console.log("onValueChanged", e.value);
                // dataGrid().selectRows(args.value, false);
                e.component.close();
              });
            },
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
