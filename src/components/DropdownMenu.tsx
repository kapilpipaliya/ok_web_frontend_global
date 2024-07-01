import { autoUpdate } from '@floating-ui/dom';
import { useFloating } from 'solid-floating-ui';
import { type JSX, createSignal, onCleanup, onMount, splitProps } from "solid-js";
import { Portal } from "solid-js/web";

export function DropdownMenu(props: { onClickOutside: () => void, parentRef: HTMLElement } & JSX.HTMLAttributes<HTMLDivElement>) {
    let dropdownRef: HTMLDivElement;

    const [reference, setReference] = createSignal<HTMLElement | null>(null);
    const [floating, setFloating] = createSignal<HTMLElement | null>(null);

    const position = useFloating(reference, floating, {
        placement: 'bottom-start',
        strategy: 'fixed',
        whileElementsMounted: autoUpdate,
    });

    onMount(() => {
        setReference(props.parentRef);
    });

    onCleanup(() => {
        document.removeEventListener('mousedown', handleClickOutside);
    });

    const handleClickOutside = (event: MouseEvent) => {
        const path = event.composedPath();
        if (!path.includes(dropdownRef) && !path.includes(props.parentRef)) {
            props.onClickOutside?.();
        }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return (
        <Portal mount={document.body}>
            <div
                // used inline style because master css is not working!
                ref={setFloating}
                style={{
                    "align-items": "flex-start",
                    "background-color": "white",
                    "border": "1px solid #D1D5DB",
                    "box-shadow": "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
                    "display": "flex",
                    "flex-direction": "column",
                    gap: "0.25rem",
                    left: `${position.x ?? 0}px`,
                    "max-height": "13rem",
                    "min-width": "12rem",
                    "overflow-y": "auto",
                    padding: "0.25rem",
                    position: position.strategy,
                    top: `${position.y ?? 0}px`,
                    "z-index": "999"
                }}
                {...splitProps(props, ["ref", "parentRef"])[1]}
            />
        </Portal>
    );
}