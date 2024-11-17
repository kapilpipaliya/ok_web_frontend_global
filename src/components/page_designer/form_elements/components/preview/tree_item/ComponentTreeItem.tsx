import { createMemo, For, Show } from "solid-js";

import { resetDragDropState } from "~/components/page_designer/event_handler/resetDragDropState";
import { useDesignerLayoutStore } from "~/components/page_designer/context/LayoutContext";
import { TreeItemContainer } from "~/components/page_designer/settings/layout/TreeItemContainer";
import { type Id, useGraph, type Vertex } from "~/lib/graph/graph";

import { getCompChildren } from "../../getCompChildren";
import { onCompDragStart } from "../../onCompDragStart";
import { TreeItemContent } from "./TreeItemContent";

export function CompPreviewTreeItem(
  props: Readonly<{
    ancestorIds?: Id[];
    collapsedKeys: string[];
    hideFirstItem?: boolean;
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

  // Create a new array of ancestor IDs including the current item's ID
  const currentAncestorIds = [...(props.ancestorIds || []), props.item.id];

  return (
    <>
      <Show when={!props.hideFirstItem}>
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
      </Show>
      <Show when={!props.collapsedKeys.includes(props.item.id)}>
        <ul class="pl:8 pt:5">
          <For each={children()}>
            {(child) =>
              // Skip rendering if the child item is an ancestor of the current item
              !currentAncestorIds.includes(child.id) && (
                <CompPreviewTreeItem
                  ancestorIds={currentAncestorIds} // Pass the ancestor IDs down
                  collapsedKeys={props.collapsedKeys}
                  item={child}
                  toggleExpand={props.toggleExpand}
                />
              )
            }
          </For>
        </ul>
      </Show>
    </>
  );
}
