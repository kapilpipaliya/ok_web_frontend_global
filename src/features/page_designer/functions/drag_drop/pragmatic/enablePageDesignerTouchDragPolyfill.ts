import { enableAndroidTouchDrag } from "~/features/page_designer/functions/drag_drop/pragmatic/androidTouchDrag";

/**
 * Android Chrome often never fires HTML5 dragstart from a finger long-press.
 * Enable our pointer-based touch drag (bypasses HTML5 / Pragmatic native path).
 */
export function enablePageDesignerTouchDragPolyfill(): void {
  enableAndroidTouchDrag();
}
