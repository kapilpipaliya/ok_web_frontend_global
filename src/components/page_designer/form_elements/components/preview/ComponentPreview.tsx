import type { Setter, } from "solid-js";

import { createStore } from "solid-js/store";

import type { Id, Vertex, } from "~/lib/graph/graph";

import { DropdownMenu } from "~/components/DropdownMenu";

import { CompPreviewTreeItem } from "./tree_item/ComponentTreeItem";

export function ComponentPreview(
  props: Readonly<{
    item: Vertex;
    onClose: () => void;
    onMouseLeave: (event: MouseEvent) => void;
    parentRef: HTMLElement;
    ref: Setter<HTMLElement | null>;
  }>
) {
  const [collapsedKeys, setCollapsedKeys] = createStore<string[]>([]);

  function toggleExpand(itemId: Id) {
    setCollapsedKeys((prev) =>
      prev.includes(itemId)
        ? prev.filter((item) => item !== itemId)
        : [...prev, itemId],
    );
  }
  return (
    <DropdownMenu
      class="padding:0.50rem"
      onClickOutside={props.onClose}
      onMouseLeave={props.onMouseLeave}
      parentRef={props.parentRef}
      placement="bottom-end"
      ref={props.ref}
    >
      {/* <h4 class="lh:1.5rem color:gray-90 f:1rem  font:bold leading:1.5rem">
        Preview CSS
      </h4> */}

      <div class="mt:2">
        <div>
          <CompPreviewTreeItem collapsedKeys={collapsedKeys} item={props.item} toggleExpand={toggleExpand} />
        </div>
        <br />
        Preview: If Component example is there. (Load data sync)
      </div>
    </DropdownMenu>
  );
}
