import {type Placement, autoUpdate} from '@floating-ui/dom';
import {makeEventListener} from "@solid-primitives/event-listener";
import {useFloating} from 'solid-floating-ui';
import {type JSX, createSignal, onMount, splitProps, useContext} from "solid-js";
import {Portal} from "solid-js/web";

import {useActiveClickOutside} from "~/components/useActiveClickOutside";
import {GraphContext} from '~/lib/graph/graph';

export function DropdownMenu(props: { onClickOutside?: () => void, parentRef: HTMLElement, plaement?: Placement } & JSX.HTMLAttributes<HTMLDivElement>) {
    const [reference, setReference] = createSignal<HTMLElement | null>(null);
    const [floating, setFloating] = createSignal<HTMLElement | null>(null);
    const [graph, setGraph] = useContext(GraphContext)!;
  const activeClickOutside = useActiveClickOutside(graph, setGraph);

  const position = useFloating(reference, floating, {
        placement: props.plaement ?? 'bottom-start',
        strategy: 'fixed',
        whileElementsMounted: autoUpdate,
    });

    onMount(() => {
        setReference(props.parentRef);
    });

    const handleClickOutside = (event: MouseEvent) => {
        if (activeClickOutside !== graph.activeClickOutside) return;
        const path = event.composedPath();
        if (!path.includes(floating()!) && !path.includes(props.parentRef)) {
            props.onClickOutside?.();
        }
    };
    makeEventListener(window, "mousedown", handleClickOutside);
    return (
        <Portal mount={document.body}>
            <div
                class="align-items:flex-start bg:white border:1px|solid|#D1D5DB box-shadow:0|10px|15px|-3px|rgba(0,0,0,0.1),0|4px|6px|-2px|rgba(0,0,0,0.05) display:flex flex-direction:column gap:0.25rem max-height:13rem min-width:12rem overflow-y:auto padding:0.25rem z-index:999"
                ref={setFloating}
                style={{
                    left: `${position.x ?? 0}px`,
                    position: position.strategy,
                    top: `${position.y ?? 0}px`,
                }}
                {...splitProps(props, ["ref", "parentRef"])[1]}
            />
        </Portal>
    );
}