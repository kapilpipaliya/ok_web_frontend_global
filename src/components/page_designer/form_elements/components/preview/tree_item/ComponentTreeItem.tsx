import { createMemo, For, Show } from "solid-js";

import { resetDragDropState } from "~/components/page_designer/event_handler/resetDragDropState";
import { useDesignerLayoutStore } from "~/components/page_designer/LayoutContext";
import { TreeItemContainer } from "~/components/page_designer/settings/layout/TreeItemContainer";
import { type Id, useGraph, type Vertex } from "~/lib/graph/graph";

import { getCompChildren } from "../../getCompChildren";
import { onCompDragStart } from "../../onCompDragStart";
import { TreeItemContent } from "./TreeItemContent";

export function CompPreviewTreeItem(
  props: Readonly<{
    collapsedKeys: string[];
    item: Vertex;
    toggleExpand: (itemId: Id) => void;
  }>,
) {
  const [graph] = useGraph();
  const children = createMemo(() => getCompChildren(props.item, graph));
  const [, setLayoutStore] = useDesignerLayoutStore() || [];

  const onDragEnd = () => {
    resetDragDropState(setLayoutStore);
  };
  return (
    <>
      <TreeItemContainer
        draggable={true}
        hasChildren={!!children().length}
        isHovered={false}
        onDragEnd={onDragEnd}
        onDragStart={(e) =>
          onCompDragStart(e, graph, props.item.id, setLayoutStore)
        }
        onMouseEnter={() => {}}
        onmouseleave={() => {}}
      >
        <TreeItemContent
          collapsedKeys={props.collapsedKeys}
          item={props.item}
          toggleExpand={props.toggleExpand}
        />
      </TreeItemContainer>
      <Show when={!props.collapsedKeys.includes(props.item.id)}>
        <ul class="pb:5 pl:8 pt:3">
          <For each={children()}>
            {(child) => (
              <CompPreviewTreeItem
                collapsedKeys={props.collapsedKeys}
                item={child}
                toggleExpand={props.toggleExpand}
              />
            )}
          </For>
        </ul>
      </Show>
    </>
  );
}
