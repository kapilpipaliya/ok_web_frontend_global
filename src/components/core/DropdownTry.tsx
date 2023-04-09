import CustomStore from "devextreme/data/custom_store";
import DropDownBox, { Properties } from "devextreme/ui/drop_down_box";
import dxTreeView from "devextreme/ui/tree_view";
import { createEffect, createSignal, For, Show } from "solid-js";
import { ComponentProps } from "./Form";

export function DropDownBoxField(props: ComponentProps) {
  const [treeView, setTreeView] = createSignal(null);

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

  return (
    <div aria-labelledby={props["aria-labeledby"]}>
      <div
        ref={(el) => {
          const instance = new DropDownBox(el, {
            value: "1_1",
            valueExpr: "ID",
            displayExpr: "name",
            placeholder: "Select a value...",
            showClearButton: true,
            dataSource: makeAsyncDataSource("treeProducts.json"),
            contentTemplate: (e: any) => {
              const value = e.component.option("value");
              const treeViewInstance = new dxTreeView(e.component.content(), {
                dataSource: e.component.getDataSource(),
                dataStructure: "plain",
                keyExpr: "ID",
                parentIdExpr: "categoryId",
                selectionMode: "single",
                displayExpr: "name",
                selectByClick: true,
                onContentReady: () => {
                  syncTreeViewSelection(e.component, value);
                },
                selectNodesRecursive: false,
                onItemClick: (e: any) => {
                  e.component.collapseItem(e.itemElement);
                  console.log("onItemClick", e, e.itemElement);
                },
                onItemSelectionChanged: (e: any) => {
                  const selectedItems = e.component
                    .getSelectedNodes()
                    .map((node: any) => node.itemData);
                  console.log("selectedItems", selectedItems);
                  if (selectedItems.length) {
                    // e.component.selectItem(selectedItems[0]);
                    // e.component.collapseAll();
                    // e.component.unselectAll();
                    // e.component.selectItem(selectedItems[0]);
                    e.component.option("value", selectedItems[0]);
                    props.setValue(props.meta, selectedItems[0]);
                    syncTreeViewSelection(e.component, selectedItems[0]);
                  } else {
                    e.component.option("value", null);
                  }
                },
              });
              setTreeView(treeViewInstance);
            },
            onValueChanged: (e) => {
              props.setValue(props.meta, e.value);
              console.log("onValueChanged", e.value);
              syncTreeViewSelection(treeView(), e.value);
              e.component.close();
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
