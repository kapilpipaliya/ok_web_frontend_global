import { createVisibilityObserver } from "@solid-primitives/intersection-observer";
import { createSelector, Match, Switch } from "solid-js";

import type { Vertex } from "~/lib/graph/graph";
import { useGraph } from "~/lib/graph/graph";

import { useDesignerLayoutStore } from "../../page_designer/context/LayoutContext";
import { HoverAttrConfigPopOver } from "./HoverAttrConfigPopOver";
import { SelectedAttrConfigPopOver } from "./SelectedAttrConfigPopOver";
import type { PageLayoutObject } from "../../page_designer/context/LayoutContext";

export function AttrConfigPopOver(props: Readonly<{ item: Vertex }>) {
  const layoutStoreId = useDesignerLayoutStore();
  const [graph] = useGraph();

  const layoutStore = () => graph.vertexes[layoutStoreId].P as PageLayoutObject;
  const isSelectedLayoutId = createSelector(() => layoutStore().selectedId);
  const isSelectedHoverId = createSelector(() => layoutStore().hoverId);

  let popoverRef: HTMLDivElement | undefined;
  const useVisibilityObserver = createVisibilityObserver({ threshold: 0.8 });
  const visible = useVisibilityObserver(() => popoverRef);

  return (
    <div ref={popoverRef} >
      <div
        // classList={{ hidden: !visible() }}
       >
        <Switch>
          <Match when={isSelectedLayoutId(props.item.id)}>
            <SelectedAttrConfigPopOver item={props.item} />
          </Match>
          <Match
            when={
              isSelectedHoverId(props.item.id) ||
              layoutStore().multiHighlight.includes(props.item.id)
            }
          >
            <HoverAttrConfigPopOver item={props.item} />
          </Match>
        </Switch>
      </div>
    </div>
  );
}
