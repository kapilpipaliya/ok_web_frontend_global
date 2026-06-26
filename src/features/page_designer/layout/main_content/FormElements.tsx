import { Show } from "solid-js";

import {
  ComponentsPanel,
  FunctionsPanel,
  PagesPanel,
} from "~/features/page_designer/form_elements/FormElementTabs";

import { useDesignerLayoutStore } from "../../context/LayoutContext";
import type { PageLayoutObject } from "../../context/LayoutContext";
import { useGraph } from "~/lib/graph/context/UseGraph";

export function ComponentsPanelContent() {
  const [graph] = useGraph();
  const layoutStoreId = useDesignerLayoutStore();
  const layoutStore = () =>
    (graph.vertexes[layoutStoreId]?.P as PageLayoutObject) || {};

  return (
    <Show when={layoutStore().isComponentsOpen}>
      <ComponentsPanel />
    </Show>
  );
}

export function PagesPanelContent() {
  const [graph] = useGraph();
  const layoutStoreId = useDesignerLayoutStore();
  const layoutStore = () =>
    (graph.vertexes[layoutStoreId]?.P as PageLayoutObject) || {};

  return (
    <Show when={layoutStore().isPagesOpen}>
      <PagesPanel />
    </Show>
  );
}

export function FunctionsPanelContent() {
  const [graph] = useGraph();
  const layoutStoreId = useDesignerLayoutStore();
  const layoutStore = () =>
    (graph.vertexes[layoutStoreId]?.P as PageLayoutObject) || {};

  return (
    <Show when={layoutStore().isFunctionsOpen}>
      <FunctionsPanel />
    </Show>
  );
}
