import { createSignal, onCleanup, onMount } from "solid-js";

/** Grid track on mouse-first devices (desktop). */
export const DESIGNER_RESIZE_TRACK_SIZE_FINE = 10;
/** Grid track on touch-first devices (phones, tablets incl. iPad + stylus). */
export const DESIGNER_RESIZE_TRACK_SIZE_TOUCH = 24;
export const DESIGNER_RESIZE_VISIBLE_SIZE = 2;

export type ResizeAxis = "x" | "y";

function readTrackSize() {
  if (typeof window === "undefined") {
    return DESIGNER_RESIZE_TRACK_SIZE_FINE;
  }
  return window.matchMedia("(hover: none)").matches
    ? DESIGNER_RESIZE_TRACK_SIZE_TOUCH
    : DESIGNER_RESIZE_TRACK_SIZE_FINE;
}

export function useDesignerResizeTrackSize() {
  const [trackSize, setTrackSize] = createSignal(readTrackSize());

  onMount(() => {
    const mq = window.matchMedia("(hover: none)");
    const onChange = () => setTrackSize(readTrackSize());
    mq.addEventListener("change", onChange);
    onCleanup(() => mq.removeEventListener("change", onChange));
  });

  return trackSize;
}
