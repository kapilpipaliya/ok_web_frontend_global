import { For, Show, createSignal } from "solid-js";

import type { Id } from "~/lib/graph/graph";

import { useDesignerLayoutStore } from "../../LayoutContext";
import { TreeItem } from "./TreeItem";

export function LayoutTree() {
  const [layoutStore] = useDesignerLayoutStore();
  const [collapsedKeys, setCollapsedKeys] = createSignal([] as Id[]);

  function toggleExpand(itemId: Id) {
    setCollapsedKeys((prev) =>
      prev.includes(itemId)
        ? prev.filter((item) => item !== itemId)
        : [...prev, itemId],
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
    return layoutStore.formStore?.formData
      ? [layoutStore.formStore.formData]
      : [];
  };

  return (
    <For each={rootVertexes()}>
      {(item) => (
        <Show when={layoutStore.formStore}>
          <TreeItem
            collapsedKeys={collapsedKeys}
            metaVertex={item}
            toggleExpand={toggleExpand}
          />
        </Show>
      )}
    </For>
  );
}
