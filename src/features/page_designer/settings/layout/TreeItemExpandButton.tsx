import { Show } from "solid-js";

import { IconButton } from "~/components/styled/IconButton";
import type { Id } from "~/lib/graph/type/id";

export function TreeItemExpandButton(
  props: Readonly<{
    hasChildren: boolean;
    isCollapsed: boolean;
    metaVertexId: Id;
    toggleExpand: (itemId: Id) => void;
  }>,
) {
  // Finger taps fire pointerup then a synthetic click; skip the duplicate toggle.
  let handledByTouch = false;

  const handleToggle = (e: Event) => {
    e.stopPropagation();
    props.toggleExpand(props.metaVertexId);
  };

  return (
    <Show when={props.hasChildren}>
      <IconButton
        icon={props.isCollapsed ? "ph:caret-right" : "ph:caret-down"}
        css={`return \`._id {
          margin: 0 4px;
          transform: ${props.isCollapsed ? "rotate(0deg)" : "rotate(180deg)"};
          transition: transform 0.2s linear;
          background-color: transparent;
          border: none;
          color: currentColor;
          /* Skip double-tap zoom delay on touch devices. */
          touch-action: manipulation;
        }\`;`}
        noCenter
        onClick={(e) => {
          if (handledByTouch) {
            handledByTouch = false;
            e.stopPropagation();
            return;
          }
          handleToggle(e);
        }}
        onPointerDown={(e) => {
          // Keep parent row drag/hover handlers from consuming the first touch.
          e.stopPropagation();
        }}
        onPointerUp={(e) => {
          // Coarse pointers (finger) need an immediate toggle; click alone
          // waits for a second tap when parent rows use hover styles.
          if (e.pointerType !== "touch" || e.button !== 0) {
            return;
          }
          e.preventDefault();
          handledByTouch = true;
          handleToggle(e);
        }}
        size="1em"
      />
    </Show>
  );
}
