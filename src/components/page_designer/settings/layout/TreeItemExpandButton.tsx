import { Icon } from "@iconify-icon/solid";
import { Show } from "solid-js";

import type { Id } from "~/lib/graph/graph";

export function TreeItemExpandButton(
  props: Readonly<{
    hasChildren: boolean;
    isCollapsed: boolean;
    metaVertexId: Id;
    toggleExpand: (itemId: Id) => void;
  }>
) {
  return (
    <Show when={props.hasChildren}>
      <button
        class="cursor:pointer"
        onClick={(e) => {
          e.stopPropagation();
          props.toggleExpand(props.metaVertexId);
        }}
      >
        <Icon
          classList={{
            "mt:7px": true,
            "transform 2s ease-in-out": true,
            "transform:rotate(0deg)": props.isCollapsed,
            "transform:rotate(180deg)": !props.isCollapsed,
            "transition:transform 0.2s|linear": true,
          }}
          icon="mingcute:down-fill"
        />
      </button>
    </Show>
  );
}
