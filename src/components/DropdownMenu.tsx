import { type JSX, onCleanup, onMount, splitProps } from "solid-js";
import { Portal } from "solid-js/web";

export function handleResize(dropdownRef: HTMLDivElement, parentRef: HTMLDivElement) {
    console.log('resizeobj')
    const menuEntryRect = parentRef.getBoundingClientRect();
    const menuEntryBottom = menuEntryRect.bottom;
    const menuEntryLeft = menuEntryRect.left;
    const menuEntryWidth = menuEntryRect.width;
    const scrollY = window.scrollY;
    const scrollX = window.scrollX;

    dropdownRef!.style.top = `${menuEntryBottom + scrollY}px`;
    dropdownRef!.style.left = `${menuEntryLeft + scrollX}px`;
    dropdownRef!.style.width = `${menuEntryWidth}px`;
}

export function DropdownMenu(props: JSX.HTMLAttributes<HTMLDivElement> & { parentRef: HTMLDivElement, onClickOutside: () => void }) {
    let dropdownRef: HTMLDivElement;
    let resizeObserver: ResizeObserver;

    onMount(() => {
        handleResize(dropdownRef, props.parentRef);
        resizeObserver = new ResizeObserver(() => handleResize(dropdownRef, props.parentRef));
        resizeObserver.observe(dropdownRef!);
    });

    onCleanup(() => {
        resizeObserver?.disconnect();
    });

    const handleClickOutside = (event: MouseEvent) => {
        const path = event.composedPath();
        if (!path.includes(dropdownRef) && !path.includes(props.parentRef)) {
          props.onClickOutside?.();
        }
      };
    
      document.addEventListener('mousedown', handleClickOutside);
    
      onCleanup(() => {
        document.removeEventListener('mousedown', handleClickOutside);
      });

    return (
        <Portal mount={document.body}>
            <div
                // can use mergeRef hook:
                ref={dropdownRef!}
                // used inline style because master css is not working!
                style={{
                    position: "absolute",
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