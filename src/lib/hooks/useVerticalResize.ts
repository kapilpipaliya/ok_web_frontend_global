import { createSignal, type Accessor } from "solid-js";

export function useVerticalResize(options: {
  minHeight?: number;
  initialHeight: Accessor<string>;
  autoHeight?: Accessor<string>;
  enabled?: Accessor<boolean>;
}) {
  const minHeight = options.minHeight ?? 100;
  const [manualHeight, setManualHeight] = createSignal<string | null>(null);

  const height = () => manualHeight() ?? options.autoHeight?.() ?? options.initialHeight();

  const createPointerDown =
    (direction: "top" | "bottom") => (e: PointerEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const startHeight = Number.parseFloat(height().replace("px", ""));
      const startY = e.clientY;
      const handle = e.currentTarget as HTMLDivElement;
      const pointerId = e.pointerId;

      const onPointerMove = (moveEvent: PointerEvent) => {
        if (moveEvent.pointerId !== pointerId) {
          return;
        }
        const deltaY = moveEvent.clientY - startY;
        const newHeight =
          direction === "bottom"
            ? startHeight + deltaY
            : startHeight - deltaY;
        setManualHeight(`${Math.max(minHeight, newHeight)}px`);
      };

      const onPointerUp = (upEvent: PointerEvent) => {
        if (upEvent.pointerId !== pointerId) {
          return;
        }
        document.removeEventListener("pointermove", onPointerMove);
        document.removeEventListener("pointerup", onPointerUp);
        document.removeEventListener("pointercancel", onPointerUp);
      };

      handle.setPointerCapture(pointerId);
      document.addEventListener("pointermove", onPointerMove);
      document.addEventListener("pointerup", onPointerUp);
      document.addEventListener("pointercancel", onPointerUp);
    };

  const resetManualHeight = () => setManualHeight(null);

  return {
    height,
    resetManualHeight,
    onTopPointerDown: createPointerDown("top"),
    onBottomPointerDown: createPointerDown("bottom"),
  };
}
