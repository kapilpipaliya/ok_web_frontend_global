import { For, type Setter, Show, createMemo, createSignal, useContext } from "solid-js";

import { Drawer } from "~/components/Drawer";
import { getChildrenAttrs } from "~/lib/drag_drop/getChildrenAttrs";
import { GraphContext, type Id, type Vertex } from "~/lib/graph/graph";

import { useDesignerLayoutStore } from "../LayoutContext";
import { TreeItem } from "./TreeItem";
import { Properties } from "./properties/Properties";

export function LayoutTree() {
  const [layoutStore, setLayoutStore] = useDesignerLayoutStore();
  const [graph, setGraph] = useContext(GraphContext)!;
  const [collapsedKeys, setCollapsedKeys] = createSignal([] as Id[]);

  function toggleExpand(itemId: Id) {
    setCollapsedKeys((prev) =>
      prev.includes(itemId)
        ? prev.filter((item) => item !== itemId)
        : [...prev, itemId]
    );
  }

  // const steps = createMemo<Vertex[]>(() =>
  //   getChildrenAttrs(graph, setGraph, layoutStore.formData?.formData)
  // );

  // const isFormRootVertetx = () =>
  //   layoutStore.formData?.formData?.L?.[0] === "Form";

  const rootVertexes = () => {
    // if (isFormRootVertetx()) {
    //   if (layoutStore.activeStepId && graph.vertexes[layoutStore.activeStepId]) {
    //     return [graph.vertexes[layoutStore.activeStepId]];
    //   }
    //   return steps()[0]
    //     ? [steps()[0]]
    //     : [];
    // }
    return layoutStore.formData?.formData
      ? [layoutStore.formData.formData]
      : [];
  };

  return (
    <>
      <Show when={layoutStore.showPropertiesDrawer}>
        <Drawer
          customButton={() => false}
          drawerStyle={"padding:10px"}
          open={() => layoutStore.showPropertiesDrawer}
          setIsOpen={((v: boolean) =>
            setLayoutStore("showPropertiesDrawer", v)) as Setter<boolean>}
        >
          <Properties />
        </Drawer>
      </Show>
      <For each={rootVertexes()}>
        {(item) => (
          <Show when={layoutStore.formData}>
            <TreeItem collapsedKeys={collapsedKeys} metaVertex={item} toggleExpand={toggleExpand} />
          </Show>
        )}
      </For>
    </>
  );
}
