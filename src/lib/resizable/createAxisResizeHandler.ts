import { attachPointerDrag } from "./attachPointerDrag";
import type { ResizeAxis } from "./useDesignerResizeTrackSize";

export function createAxisResizeHandler(options: {
  axis: ResizeAxis;
  getStartSize: () => number;
  growOnDragPositive: boolean;
  minSize?: number;
  onEnd?: () => void;
  onResize: (size: number) => void;
  onStart?: () => void;
}) {
  return (e: PointerEvent) => {
    const startSize = options.getStartSize();
    const startPos = options.axis === "x" ? e.pageX : e.pageY;
    const minSize = options.minSize ?? 50;

    options.onStart?.();

    attachPointerDrag(
      e,
      (point) => {
        const pos = options.axis === "x" ? point.pageX : point.pageY;
        const diff = pos - startPos;
        const newSize = Math.max(
          minSize,
          startSize + (options.growOnDragPositive ? diff : -diff),
        );
        options.onResize(Math.round(newSize * 100) / 100);
      },
      () => options.onEnd?.(),
    );
  };
}
