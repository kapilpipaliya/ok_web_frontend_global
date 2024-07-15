import { createVisibilityObserver } from "@solid-primitives/intersection-observer";
import { Match, Switch, createSelector } from "solid-js";

import type { Vertex } from "~/lib/graph/graph";

import { useDesignerLayoutStore } from "../../page_designer/LayoutContext";
import { HoverAttrConfigPopOver } from "./HoverAttrConfigPopOver";
import { SelectedAttrConfigPopOver } from "./SelectedAttrConfigPopOver";

export function AttrConfigPopOver(props: Readonly<{ item: Vertex }>) {
  const [layoutStore] = useDesignerLayoutStore();
  const isSelectedLayoutId = createSelector(() => layoutStore.selectedId);
  const isSelectedHoverId = createSelector(() => layoutStore.hoverId);

  let popoverRef: HTMLDivElement | undefined;
  const useVisibilityObserver = createVisibilityObserver({ threshold: 0.8 });
  const visible = useVisibilityObserver(() => popoverRef);

  return (
    <div ref={popoverRef}>
      <div classList={{ 'hidden': !visible() }} >
        <Switch>
          <Match when={isSelectedLayoutId(props.item.id)}>
            <SelectedAttrConfigPopOver item={props.item} />
          </Match>
          <Match when={isSelectedHoverId(props.item.id) || layoutStore.multiHighlight.includes(props.item.id)}>
            <HoverAttrConfigPopOver item={props.item} />
          </Match>
        </Switch>
      </div>
    </div>
  );
}
