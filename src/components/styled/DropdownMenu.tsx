import type { OffsetOptions, Placement, Strategy } from "@floating-ui/dom";

import createFloating from "@corvu/utils/create/floating";
import { createSignal, type JSX, splitProps } from "solid-js";
import { Portal } from "solid-js/web";

import { useGraph } from "~/lib/graph/graph";
import { createClickOutside } from "~/lib/hooks/createClickOutside";

import { useZIndex } from "../fields/ZIndex";

export function DropdownMenu(
  props: JSX.HTMLAttributes<HTMLDivElement> & {
    applyDefaultStyles?: boolean;
    boundary?: Element | null;
    offset?: OffsetOptions;
    onClickOutside?: () => void;
    padding?: number;
    parentRef: HTMLElement;
    placement?: Placement;
    useAutoPlacement?: boolean;
    useFlip?: boolean;
    useShift?: boolean;
    useSize?: boolean;
  },
) {
  const [floating, setFloating] = createSignal<HTMLElement | null>(null);
  const [graph, setGraph] = useGraph();
  const zIndex = useZIndex();
  const strategy = () => "fixed" as Strategy;

  const floatingState = createFloating({
    // arrow: arrowEl,
    enabled: true,
    floating: floating,
    options: () => ({
      flip: props.useFlip ?? true, // Automatically flip the dropdown if it doesn't fit
      offset: props.offset,
      shift: { boundary: props.boundary, padding: props.padding ?? 8 }, // Adjust the dropdown to stay within the viewport with a padding of 8px
      size: props.useSize ? { fitViewPort: true, matchSize: true } : undefined,
    }),
    placement: () => props.placement ?? "bottom-start",
    reference: () => props.parentRef ?? null,
    strategy,
  });

  createClickOutside(graph, setGraph, (event) => {
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
        classList={{
          [`${borderClass} align-items:flex-start bg:white display:flex flex-direction:column gap:0.25rem min-width:12rem overflow-y:auto padding:0.25rem`]: props.applyDefaultStyles ?? true,
          [`${local.class ?? ""}`]: true,
          [`left:${floatingState().x ?? 0}px`]: true,
          [`max-height:${floatingState().maxHeight ?? 100}px`]: props.useSize,
          [`position:${strategy()}`]: true,
          [`top:${floatingState().y ?? 0}px`]: true,
          [`z-index:${zIndex}`]: true
        }}
        ref={(el) => {
          setFloating(el);
          if (typeof local.ref === "function") {
            local.ref(el);
          }
        }}
        role="menu"
        {...rest}
      />
    </Portal>
  );
}
