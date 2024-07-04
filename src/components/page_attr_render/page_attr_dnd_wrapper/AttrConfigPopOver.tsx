import { Match, Switch, createSelector } from "solid-js";

import type { Vertex } from "~/lib/graph/graph";

import { useDesignerLayoutStore } from "../../page_designer/LayoutContext";
import { HoverAttrConfigPopOver } from "./HoverAttrConfigPopOver";
import { SelectedAttrConfigPopOver } from "./SelectedAttrConfigPopOver";

export function AttrConfigPopOver(props: { item: Vertex; }) {
  const [layoutStore] = useDesignerLayoutStore();
  const isSelectedLayoutId = createSelector(() => layoutStore.selectedId);
  const isSelectedHoverId = createSelector(() => layoutStore.hoverId);
  return (
    <Switch>
      <Match when={isSelectedLayoutId(props.item.id)}>
        <SelectedAttrConfigPopOver item={props.item} />
      </Match>
      <Match when={isSelectedHoverId(props.item.id)}>
        <HoverAttrConfigPopOver item={props.item} />
      </Match>
    </Switch>
  );
}
