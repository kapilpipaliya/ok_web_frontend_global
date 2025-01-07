import { createSignal, For, Show } from "solid-js";

import { useGraph, type Id, type Vertex } from "~/lib/graph/graph";
import { FormStoreObject } from "~/components/form/context/FormContext";

import { useDesignerLayoutStore, PageLayoutObject } from "../../context/LayoutContext";
import { LayoutTreeItem } from "./LayoutTreeItem";

export function LayoutTree() {  
  const layoutStoreId = useDesignerLayoutStore();
  const [graph, setGraph] = useGraph();
  const [collapsedKeys, setCollapsedKeys] = createSignal([] as Id[]);

  const layoutStore = () => graph.vertexes[layoutStoreId].P as PageLayoutObject;
  const formStoreVertex = () => graph.vertexes[layoutStore().formId!] as Vertex<FormStoreObject>;

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
    return formStoreVertex().P.formDataId
      ? [graph.vertexes[formStoreVertex().P.formDataId!]]
      : [];
  };

  return (
    <For each={rootVertexes()}>
      {(item) => (
        <Show when={formStoreVertex()}>
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
