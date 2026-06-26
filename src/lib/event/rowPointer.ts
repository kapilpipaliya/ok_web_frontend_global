import { createSignal } from "solid-js";

import type { Id } from "~/lib/graph/type/id";

const TAP_MOVE_PX = 8;
const ACTION_SELECTOR =
  "button, a, [data-row-actions], [data-palette-actions]";

/** Mouse/stylus — not finger touch. */
export function isFinePointer(event: PointerEvent) {
  return event.pointerType !== "touch";
}

function isActionTarget(target: EventTarget | null) {
  return target instanceof Element && !!target.closest(ACTION_SELECTOR);
}

function movedEnough(event: PointerEvent, x: number, y: number) {
  return (
    Math.abs(event.clientX - x) > TAP_MOVE_PX ||
    Math.abs(event.clientY - y) > TAP_MOVE_PX
  );
}

/** Stops row drag from starting on a button. */
export function stopRowDrag(event: PointerEvent) {
  event.stopPropagation();
}

/** Use on action button wrappers. */
export function actionPointerProps(keepHover: () => void) {
  return {
    onPointerDown: stopRowDrag,
    onPointerEnter: keepHover,
  };
}

/**
 * Hover for mouse/stylus only.
 * Hides after a short delay so you can move to row action buttons.
 */
export function createDelayedFineHover(
  onEnter: () => void,
  onLeave: () => void,
  delayMs = 150,
) {
  let timer: ReturnType<typeof setTimeout> | undefined;

  const clear = () => {
    if (timer !== undefined) {
      clearTimeout(timer);
      timer = undefined;
    }
  };

  return {
    onPointerEnter: (event: PointerEvent) => {
      if (!isFinePointer(event)) return;
      clear();
      onEnter();
    },
    onPointerLeave: (event: PointerEvent) => {
      if (!isFinePointer(event)) return;
      clear();
      timer = setTimeout(onLeave, delayMs);
    },
    keepVisible: clear,
    cleanup: clear,
  };
}

/** Reliable tap for pen/touch on IconButton. */
export function createTapClickHandler(handler: (event: Event) => void) {
  let pointerDown = false;
  let x = 0;
  let y = 0;
  let handledByPointer = false;

  const run = (event: Event) => {
    event.stopPropagation();
    handler(event);
  };

  return {
    onClick: (event: MouseEvent) => {
      if (handledByPointer) {
        handledByPointer = false;
        event.stopPropagation();
        return;
      }
      run(event);
    },
    onPointerDown: (event: PointerEvent) => {
      stopRowDrag(event);
      if (event.button !== 0) return;
      pointerDown = true;
      x = event.clientX;
      y = event.clientY;
    },
    onPointerUp: (event: PointerEvent) => {
      if (!pointerDown || event.button !== 0) return;
      pointerDown = false;
      if (event.pointerType !== "pen" && event.pointerType !== "touch") return;
      if (movedEnough(event, x, y)) return;
      event.preventDefault();
      event.stopPropagation();
      handledByPointer = true;
      run(event);
    },
  };
}

/** Pen/touch tap to select a layout tree row. */
export function createRowTapSelect(onSelect: () => void) {
  let pointerDown = false;
  let x = 0;
  let y = 0;
  let handledByPointer = false;

  const handlePointerDown = (event: PointerEvent) => {
    if (event.button !== 0 || isActionTarget(event.target)) return;
    pointerDown = true;
    x = event.clientX;
    y = event.clientY;
  };

  const handlePointerUp = (event: PointerEvent) => {
    if (isActionTarget(event.target) || !pointerDown || event.button !== 0) {
      return;
    }
    pointerDown = false;
    if (event.pointerType !== "pen" && event.pointerType !== "touch") return;
    if (movedEnough(event, x, y)) return;
    handledByPointer = true;
    onSelect();
  };

  const handleClick = () => {
    if (handledByPointer) {
      handledByPointer = false;
      return;
    }
    onSelect();
  };

  return { handleClick, handlePointerDown, handlePointerUp };
}

// Finger: keep one row's action buttons visible until another row is tapped.
const [touchRevealedId, setTouchRevealedId] = createSignal<Id | null>(null);

export function revealTouchRow(itemId: Id) {
  setTouchRevealedId(itemId);
}

export function isTouchRevealedRow(itemId: Id) {
  return touchRevealedId() === itemId;
}

export function clearTouchRevealedRow() {
  setTouchRevealedId(null);
}

export function handlePaletteTouchBackground(event: PointerEvent) {
  if (event.pointerType !== "touch") return;
  if (!(event.target as HTMLElement).closest("[data-palette-row]")) {
    clearTouchRevealedRow();
  }
}
