import { type Placement, autoUpdate } from "@floating-ui/dom";
import { useFloating } from "solid-floating-ui";
import { type JSX, createSignal, onMount, splitProps } from "solid-js";
import { Portal } from "solid-js/web";

import { useGraph } from "~/lib/graph/graph";
import { useClickOutside } from "~/lib/useClickOutside";

import { useZIndex } from "./ZIndex";

export function DropdownMenu(
  props: {
    onClickOutside?: () => void;
    parentRef: HTMLElement;
    plaement?: Placement;
  } & JSX.HTMLAttributes<HTMLDivElement>,
) {
  const [reference, setReference] = createSignal<HTMLElement | null>(null);
  const [floating, setFloating] = createSignal<HTMLElement | null>(null);
  const [graph, setGraph] = useGraph();
  const zIndex = useZIndex();

  const position = useFloating(reference, floating, {
    placement: props.plaement ?? "bottom-start",
    strategy: "fixed",
    whileElementsMounted: autoUpdate,
  });

  onMount(() => {
    setReference(props.parentRef);
  });

  useClickOutside(graph, setGraph, (event) => {
    const path = event.composedPath();
    if (!path.includes(floating()!) && !path.includes(props.parentRef)) {
      props.onClickOutside?.();
    }
  });

  const [local, rest] = splitProps(props, ["ref", "parentRef", "class"]);
  const borderClass = "border-radius:0.375rem box-shadow:0|0|0|1px|rgba(0,0,0,0.5) outline-offset:2px:focus outline:2px|solid|transparent transform-origin:top|right"
  return (
    <Portal mount={document.body}>
      <div
        aria-orientation="vertical"
        class={`${local.class ?? ""} ${borderClass} align-items:flex-start bg:white display:flex flex-direction:column gap:0.25rem max-height:13rem min-width:12rem mt:2 overflow-y:auto padding:0.25rem z-index:${zIndex}`}
        ref={setFloating}
        role="menu"
        style={{
          left: `${position.x ?? 0}px`,
          position: position.strategy,
          top: `${position.y ?? 0}px`,
        }}
        {...rest}
      />
    </Portal>
  );
}
