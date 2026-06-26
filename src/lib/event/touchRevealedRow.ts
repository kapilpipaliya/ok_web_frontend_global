import { createSignal } from "solid-js";

import type { Id } from "~/lib/graph/type/id";

const [touchRevealedItemId, setTouchRevealedItemId] = createSignal<Id | null>(
  null,
);

/** Keep one palette row's actions visible after a finger tap (until another row is tapped). */
export function revealTouchRow(itemId: Id) {
  setTouchRevealedItemId(itemId);
}

export function isTouchRevealedRow(itemId: Id) {
  return touchRevealedItemId() === itemId;
}

export function clearTouchRevealedRow() {
  setTouchRevealedItemId(null);
}

/** Clear touch-revealed row when finger taps empty panel space. */
export function handlePaletteTouchBackground(e: PointerEvent) {
  if (e.pointerType !== "touch") return;
  const target = e.target as HTMLElement;
  if (!target.closest("[data-palette-row]")) {
    clearTouchRevealedRow();
  }
}
