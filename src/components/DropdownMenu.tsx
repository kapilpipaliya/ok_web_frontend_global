import { type Placement, autoUpdate } from '@floating-ui/dom';
import { useFloating } from 'solid-floating-ui';
import { type JSX, createSignal, onMount, splitProps, } from "solid-js";
import { Portal } from "solid-js/web";

import { useGraph } from '~/lib/graph/graph';
import { useClickOutside } from '~/lib/useClickOutside';

import { useZIndex } from './ZIndex';

export function DropdownMenu(props: { onClickOutside?: () => void, parentRef: HTMLElement, plaement?: Placement } & JSX.HTMLAttributes<HTMLDivElement>) {
  const [reference, setReference] = createSignal<HTMLElement | null>(null);
  const [floating, setFloating] = createSignal<HTMLElement | null>(null);
  const [graph, setGraph] = useGraph();
  const zIndex = useZIndex();

  const position = useFloating(reference, floating, {
    placement: props.plaement ?? 'bottom-start',
    strategy: 'fixed',
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
  return (
    <Portal mount={document.body}>
      <div
        class={`${local.class ?? ''} align-items:flex-start bg:white border:1px|solid|#D1D5DB box-shadow:0|10px|15px|-3px|rgba(0,0,0,0.1),0|4px|6px|-2px|rgba(0,0,0,0.05) display:flex flex-direction:column gap:0.25rem max-height:13rem min-width:12rem overflow-y:auto padding:0.25rem z-index:${zIndex}`}
        ref={setFloating}
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