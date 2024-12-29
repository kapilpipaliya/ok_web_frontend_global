import { createSignal, For, Show } from "solid-js";

import { useGraph, type Id } from "~/lib/graph/graph";

import { useDesignerLayoutStore } from "../../context/LayoutContext";
import { LayoutTreeItem } from "./LayoutTreeItem";

export function LayoutTree() {  
  const [layoutStore] = useDesignerLayoutStore();
  const [graph, setGraph] = useGraph();
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
    return layoutStore.formStore[0]?.formDataId
      ? [graph.vertexes[layoutStore.formStore[0]?.formDataId!]]
      : [];
  };

  return (
    <For each={rootVertexes()}>
      {(item) => (
        <Show when={layoutStore.formStore[0]}>
          <LayoutTreeItem
            collapsedKeys={collapsedKeys}
            metaVertex={item}
            toggleExpand={toggleExpand}
          />
        </Show>
      )}
    </For>
  );
}
