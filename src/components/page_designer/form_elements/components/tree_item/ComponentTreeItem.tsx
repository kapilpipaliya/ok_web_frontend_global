import jsep from "jsep";
import { createSelector, createSignal, For, onMount, Show } from "solid-js";

import { TreeItemContainer } from "~/components/page_designer/settings/layout/TreeItemContainer";
import { evaluate } from "~/lib/expression_eval";
import { useGraph, type Vertex } from "~/lib/graph/graph";

export function FileManagerTreeItem(props: Readonly<{ item: Vertex }>) {
  const [children, setChildren] = createSignal<Vertex[]>([]);
  const [graph, setGraph] = useGraph();

  const toggleExpand = async () => {

  };

  const getChildrenItems = async () => {

  };

  onMount(getChildrenItems);

  return (
    <>
      <TreeItemContainer
        // draggable={true}
        hasChildren={!!children().length}
        isHovered={isSelectedHoverId(props.item.id)}
        onMouseEnter={handleMouseOver}
        onmouseleave={handleMouseLeave}
      >
        <FileManagerTreeItemContent
          hasChildren={!!children().length}
          item={props.item}
          toggleExpand={toggleExpand}
        />
        <FileManagerConfigIcons
          getChildrenItems={getChildrenItems}
          metaVertex={props.item}
        />
      </TreeItemContainer>
      <Show when={fileManagerStore.expandedKeys.includes(props.item.id)}>
        <ul class="pb:5 pl:8 pt:3">
          <For each={children()}>
            {(child) => <FileManagerTreeItem item={child} />}
          </For>
        </ul>
      </Show>
    </>
  );
}
