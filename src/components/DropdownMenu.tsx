import createFloating from "@corvu/utils/create/floating";
import {
  type Placement,
  Strategy,
} from "@floating-ui/dom";
import { createSignal, type JSX, onMount, splitProps } from "solid-js";
import { Portal } from "solid-js/web";

import { useGraph } from "~/lib/graph/graph";
import { useClickOutside } from "~/lib/hooks/useClickOutside";

import { useZIndex } from "./ZIndex";

export function DropdownMenu(
  props: {
    onClickOutside?: () => void;
    parentRef: HTMLElement;
    placement?: Placement;
    useAutoPlacement?: boolean;
    useFlip?: boolean;
    useShift?: boolean;
  } & JSX.HTMLAttributes<HTMLDivElement>,
) {
  const [reference, setReference] = createSignal<HTMLElement | null>(null);
  const [floating, setFloating] = createSignal<HTMLElement | null>(null);
  const [graph, setGraph] = useGraph();
  const zIndex = useZIndex();
  const strategy = () => "fixed" as Strategy;

  const floatingState = createFloating({
    // arrow: arrowEl,
    enabled: true,
    floating: floating,
    options: () => ({
      flip: props.useFlip, // Automatically flip the dropdown if it doesn't fit
      offset: props.offset,
      shift: { boundary: props.boundary, padding: props.padding ?? 8 }, // Adjust the dropdown to stay within the viewport with a padding of 8px
    }),
    placement: () => props.placement ?? "bottom-start",
    reference: () => reference() ?? null,
    strategy,
  });

  onMount(() => {
    setReference(props.parentRef);
  });

  useClickOutside(graph, setGraph, (event) => {
    const path = event.composedPath();
    if (!(path.includes(floating()!) || path.includes(props.parentRef))) {
      props.onClickOutside?.();
    }
  });

  const [local, rest] = splitProps(props, ["ref", "parentRef", "class"]);
  const borderClass =
    "border-radius:0.375rem box-shadow:0|0|0|1px|rgba(0,0,0,0.5) outline-offset:2px:focus outline:2px|solid|transparent transform-origin:top|right";
  return (
    <Portal mount={document.body}>
      <div
        aria-orientation="vertical"
        class={`${local.class ?? ""} ${borderClass} align-items:flex-start bg:white display:flex flex-direction:column gap:0.25rem min-width:12rem overflow-y:auto padding:0.25rem z-index:${zIndex}`}
        ref={(el) => {
          setFloating(el);
          if (typeof local.ref === "function") {
            local.ref(el);
          }
        }}
        role="menu"
        style={{
          left: `${floatingState().x ?? 0}px`,
          position: strategy(),
          top: `${floatingState().y ?? 0}px`,
        }}
        {...rest}
      />
    </Portal>
  );
}
