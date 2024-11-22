import { Show } from "solid-js";

import type { Id } from "~/lib/graph/graph";

import { IconButton } from "~/components/styled/IconButton";

export function TreeItemExpandButton(
  props: Readonly<{
    hasChildren: boolean;
    isCollapsed: boolean;
    metaVertexId: Id;
    toggleExpand: (itemId: Id) => void;
  }>,
) {
  return (
    <Show when={props.hasChildren}>
      <IconButton
        icon="mingcute:down-fill"
        iconClassList={{
          "mx:4px": true,
          "transform:rotate(0deg)": props.isCollapsed,
          "transform:rotate(180deg)": !props.isCollapsed,
          "transform 2s ease-in-out": true,
          "transition:transform 0.2s|linear": true,
        }}
        noCenter
        onClick={(e) => {
          e.stopPropagation();
          props.toggleExpand(props.metaVertexId);
        }}
        size="1em"
      />
    </Show>
  );
}
