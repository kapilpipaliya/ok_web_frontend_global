import { Show } from "solid-js";

import { FormElementTabs } from "~/features/page_designer/form_elements/FormElementTabs";

import { useDesignerLayoutStore } from "../../context/LayoutContext";
import type { PageLayoutObject } from "../../context/LayoutContext";
import { useGraph } from "~/lib/graph/context/UseGraph";

export function FormElements() {
  const [graph] = useGraph();
  const layoutStoreId = useDesignerLayoutStore();
  const layoutStore = () =>
    (graph.vertexes[layoutStoreId]?.P as PageLayoutObject) || {};

  return (
    <Show when={layoutStore().isComponentsOpen}>
      <FormElementTabs />
    </Show>
  );
}
