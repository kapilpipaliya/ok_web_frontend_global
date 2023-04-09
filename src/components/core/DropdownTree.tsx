import DropDownBox, { Properties } from "devextreme/ui/drop_down_box";
import TreeView from "devextreme/ui/tree_view";
import CustomStore from "devextreme/data/custom_store";
import { createEffect, createSignal, For, Show } from "solid-js";
import { ComponentProps } from "./Form";

const makeAsyncDataSource = (jsonFile: any) => {
  return new CustomStore({
    loadMode: "raw",
    key: "ID",
    load() {
      return fetch(`data/${jsonFile}`).then((response) => response.json());
    },
  });
};

export function DropDownBoxTreeField(props: ComponentProps) {
  const [treeBoxValue, setTreeBoxValue] = createSignal("1_1");
  const [treeView, setTreeView] = createSignal(null);
  const [treeDataSource, setTreeDataSource] = createSignal(
    makeAsyncDataSource("treeProducts.json")
  );

  // const syncTreeViewSelection = (e) => {

  //     setTreeBoxValue(e.value)
  //     if (!treeView()) return;

  //     if (!e.value) {
  //         treeView().instance.unselectAll();
  //     } else {
  //         treeView().instance.selectItem(e.value);
  //     }
  // }

  // const treeViewRender = () => {
  //     return (
  //       <TreeView dataSource={this.treeDataSource}
  //         ref={(ref) => { this.treeView = ref; }}
  //         dataStructure="plain"
  //         keyExpr="ID"
  //         parentIdExpr="categoryId"
  //         selectionMode="single"
  //         displayExpr="name"
  //         selectByClick={true}
  //         onContentReady={this.treeViewOnContentReady}
  //         onItemClick={this.onTreeItemClick}
  //         onItemSelectionChanged={this.treeViewItemSelectionChanged}
  //       />
  //     );
  //   }

  return (
    <div aria-labelledby={props["aria-labeledby"]}>
      <div
        ref={(el) => {
          const instance = new DropDownBox(el, {
            dataSource: props.items,
            contentTemplate: (e) => {
              const treeView = new TreeView(e.component.content(), {
                dataSource: treeDataSource(),
                dataStructure: "plain",
                keyExpr: "ID",
                parentIdExpr: "categoryId",
                selectionMode: "single",
                displayExpr: "name",
                selectByClick: true,
                onContentReady: (e) => {
                  setTreeView(e.component);
                  e.component.selectItem(treeBoxValue());
                },
                onItemClick: (e) => {
                  setTreeBoxValue(e.itemData.ID);
                  instance.option("value", e.itemData.ID);
                },
                onItemSelectionChanged: (e) => {
                  setTreeBoxValue(e.component.getSelectedNodesKeys()[0]);
                  instance.option(
                    "value",
                    e.component.getSelectedNodesKeys()[0]
                  );
                },
              });
              setTreeView(treeView);
            },
            onValueChanged: (e) => {
              props.setValue(props.meta, e.value);
              treeView().instance.selectItem(e.value);
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
