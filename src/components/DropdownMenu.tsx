import { type JSX, onCleanup, onMount, splitProps, createSignal } from "solid-js";
import { Portal } from "solid-js/web";
import { useFloating } from 'solid-floating-ui';
import { autoUpdate } from '@floating-ui/dom';

export function DropdownMenu(props: JSX.HTMLAttributes<HTMLDivElement> & { parentRef: HTMLDivElement, onClickOutside: () => void }) {
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
                    position: position.strategy,
                    top: `${position.y ?? 0}px`,
                    left: `${position.x ?? 0}px`,
                    padding: "0.25rem",
                    "max-height": "13rem",
                    "overflow-y": "auto",
                    "box-shadow": "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
                    "z-index": "999",
                    "background-color": "white",
                    "border": "1px solid #D1D5DB",
                    "display": "flex",
                    "flex-direction": "column",
                    gap: "0.25rem",
                    "align-items": "flex-start",
                    "min-width": "12rem"
                }}
                {...splitProps(props, ["ref", "parentRef"])[1]}
            />
        </Portal>
    );
}