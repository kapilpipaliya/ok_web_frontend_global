import { createSignal, For, Show } from "solid-js";

import type { FormStoreObject } from "~/components/form/context/FormContext";

import { type Id, useGraph, type Vertex } from "~/lib/graph/graph";

import { useDesignerFormIdContext } from "../../context/LayoutContext";
import { LayoutTreeItem } from "./LayoutTreeItem";

export function LayoutTree() {
  const [graph, _setGraph] = useGraph();
  const [collapsedKeys, setCollapsedKeys] = createSignal([] as Id[]);

  const formStoreId = useDesignerFormIdContext();
  const formStoreVertex = () =>
    graph.vertexes[formStoreId!] as Vertex<FormStoreObject>;

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

    return formStoreVertex()?.P.formDataId
      ? graph.vertexes[formStoreVertex()?.P.formDataId!]
        ? [graph.vertexes[formStoreVertex()?.P.formDataId!]]
        : []
      : [];
  };

  return (
    <Show when={formStoreVertex()}>
      <For each={rootVertexes()}>
        {(item) => (
          <LayoutTreeItem
            collapsedKeys={collapsedKeys}
            metaVertex={item}
            toggleExpand={toggleExpand}
          />
        )}
      </For>
    </Show>
  );
}
