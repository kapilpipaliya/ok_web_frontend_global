// import { createVisibilityObserver } from "@solid-primitives/intersection-observer";
import { createSelector, Match, Switch } from "solid-js";

import type { FormStoreObject } from "~/components/form/context/FormContext";

import {
  type PageLayoutObject,
  useDesignerFormIdContext,
  useDesignerLayoutStore,
} from "~/features/page_designer/context/LayoutContext";
import { isLayoutPreviewHover } from "~/features/page_designer/functions/layout/previewHover";
import { useDataContext } from "~/features/page_attr_render/context/DataContext";

import { HoverAttrConfigPopOver } from "./HoverAttrConfigPopOver";
import { SelectedAttrConfigPopOver } from "./SelectedAttrConfigPopOver";
import type { Vertex } from "~/lib/graph/type/vertex";
import { useGraph } from "~/lib/graph/context/UseGraph";

export function AttrConfigPopOver(props: Readonly<{ item: Vertex }>) {
  const [graph] = useGraph();
  const contextData = useDataContext() || {};

  const formStoreId = useDesignerFormIdContext();
  const layoutStoreId = useDesignerLayoutStore();
  const formStoreVertex = () =>
    graph.vertexes[formStoreId!] as Vertex<FormStoreObject>;
  const layoutStoreVertex = () =>
    graph.vertexes[layoutStoreId] as Vertex<PageLayoutObject>;

  const isSelectedLayoutId = createSelector(
    () => formStoreVertex()?.P.selectedId,
  );
  const isSelectedHoverId = createSelector(() => formStoreVertex()?.P.hoverId);
  const isPreviewHoverId = () =>
    isLayoutPreviewHover(layoutStoreVertex()?.P, props.item.id);
  const isHoveredItem = () =>
    isSelectedHoverId(props.item.id) || isPreviewHoverId();
  const isSelectedIndex = () =>
    formStoreVertex()?.P.selectedIndex === contextData.index ||
    formStoreVertex()?.P.selectedIndex === -1;

  let popoverRef: HTMLDivElement | undefined;
  // const useVisibilityObserver = createVisibilityObserver({ threshold: 0.8 });
  // const _visible = useVisibilityObserver(() => popoverRef);

  return (
    <div ref={popoverRef}>
      <div
      // classList={{ hide: !visible() }}
      >
        <Switch>
          <Match when={isSelectedLayoutId(props.item.id) && isSelectedIndex()}>
            <SelectedAttrConfigPopOver item={props.item} />
          </Match>
          <Match
            when={
              isHoveredItem() ||
              formStoreVertex()?.P.multiHighlight.includes(props.item.id) ||
              (isSelectedLayoutId(props.item.id) && !isSelectedIndex())
            }
          >
            <HoverAttrConfigPopOver item={props.item} />
          </Match>
        </Switch>
      </div>
    </div>
  );
}
