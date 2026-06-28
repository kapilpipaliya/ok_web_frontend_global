import { createSignal, type Accessor } from "solid-js";

import { createAxisResizeHandler } from "~/lib/resizable/createAxisResizeHandler";
import { useResizeOverlay } from "~/lib/resizable/ResizeOverlayContext";

type VerticalResizeEdge = "bottom" | "top";

export function useVerticalResize(options: {
  minHeight?: number;
  initialHeight: Accessor<string>;
  autoHeight?: Accessor<string>;
  enabled?: Accessor<boolean>;
}) {
  const minHeight = options.minHeight ?? 100;
  const [manualHeight, setManualHeight] = createSignal<string | null>(null);
  const [activeKey, setActiveKey] = createSignal<null | VerticalResizeEdge>(
    null,
  );
  const { setResizing } = useResizeOverlay();

  const height = () =>
    manualHeight() ?? options.autoHeight?.() ?? options.initialHeight();

  const parseHeight = () =>
    Number.parseFloat(height().replace("px", "")) || minHeight;

  const createHandler = (edge: VerticalResizeEdge) =>
    createAxisResizeHandler({
      axis: "y",
      getStartSize: parseHeight,
      growOnDragPositive: edge === "bottom",
      minSize: minHeight,
      onEnd: () => {
        setActiveKey(null);
        setResizing(false);
      },
      onResize: (size) => setManualHeight(`${size}px`),
      onStart: () => {
        setActiveKey(edge);
        setResizing(true);
      },
    });

  const resetManualHeight = () => setManualHeight(null);

  return {
    activeKey,
    height,
    resetManualHeight,
    onTopPointerDown: createHandler("top"),
    onBottomPointerDown: createHandler("bottom"),
  };
}
