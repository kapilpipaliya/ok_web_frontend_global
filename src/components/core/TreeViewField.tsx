import TreeView, { Properties } from "devextreme/ui/tree_view";
import { createEffect, For, Show } from "solid-js";
import { ComponentProps } from "./Form";

export function TreeViewField(props: ComponentProps) {
  const syncSelection = (treeViewInstance: TreeView) => {
    // console.log(treeViewInstance);
    const selectedItems = treeViewInstance
      .getSelectedNodes()
      .map((node) => node.itemData);

    // const selectedKeys = selectedItems.map((item: any) => item.key);
    // treeViewInstance.selectItem(selectedKeys);
    console.log(selectedItems);
    props.setValue(props.meta, selectedItems);
  };

  return (
    <div aria-labelledby={props["aria-labeledby"]}>
      <h4>Employees</h4>
      <div
        ref={(el) => {
          const instance = new TreeView(el, {
            items: props.items,
            width: 340,
            height: 320,
            showCheckBoxesMode: "normal",
            onSelectionChanged: (e) => {
              syncSelection(e.component);
            },
            onContentReady: (e) => {
              syncSelection(e.component);
            },
            itemTemplate: (item) => {
              return `<div>${item.fullName} (${item.position})</div>`;
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
