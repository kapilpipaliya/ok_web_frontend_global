import type { Setter } from "solid-js";

import { createStore } from "solid-js/store";

import type { Id, Vertex } from "~/lib/graph/graph";

import { useZIndex } from "~/components/fields/ZIndex";

import { CompPreviewTreeItem } from "./tree_item/ComponentTreeItem";

export function ComponentPreview(
  props: Readonly<{
    item: Vertex;
    // onClose: () => void;
    // onMouseLeave?: (event: MouseEvent) => void;
    parentRef: HTMLElement;
    ref: Setter<HTMLElement | null>;
    edgeName: string;
  }>,
) {
  const zIndex = useZIndex();
  const [collapsedKeys, setCollapsedKeys] = createStore<string[]>([]);

  function toggleExpand(itemId: Id) {
    setCollapsedKeys((prev) =>
      prev.includes(itemId)
        ? prev.filter((item) => item !== itemId)
        : [...prev, itemId],
    );
  }
  return (
    <div
    // useShift={false}
    >
      {/* <h4 class="lh:1.5rem color:gray-90 f:1rem  font:bold leading:1.5rem">
        Preview CSS
      </h4> */}

      <div class={`mt:2 z-index:${zIndex}`}>
        <div>
          <CompPreviewTreeItem
            collapsedKeys={collapsedKeys}
            edgeName={props.edgeName}
            hideFirstItem={true}
            item={props.item}
            toggleExpand={toggleExpand}
          />
        </div>
        Examples:
      </div>
    </div>
  );
}
//         Preview: If Component example is there. (Load data sync)
