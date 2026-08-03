import { combine } from "@atlaskit/pragmatic-drag-and-drop/combine";

export type TouchPointerInput = { clientX: number; clientY: number };

export type TouchDragSource = {
  element: HTMLElement;
  getData: () => Record<string, unknown>;
  onDragStart?: () => void;
  onDragEnd?: () => void;
};

export type TouchDropTarget = {
  element: HTMLElement;
  canDrop: (data: Record<string, unknown>) => boolean;
  onDragEnter?: () => void;
  /** `hasNextTarget` is true when the pointer moved onto another drop target. */
  onDragLeave?: (hasNextTarget: boolean) => void;
  onDrag: (input: TouchPointerInput, data: Record<string, unknown>) => void;
  onDrop: (input: TouchPointerInput, data: Record<string, unknown>) => void;
};

const sources = new WeakMap<HTMLElement, TouchDragSource>();
const targets = new WeakMap<HTMLElement, TouchDropTarget>();

const HOLD_MS = 350;
const CANCEL_MOVE_PX = 12;
const GHOST_OPACITY = 0.72;

let listening = false;
let holdTimer: ReturnType<typeof setTimeout> | undefined;
let startX = 0;
let startY = 0;
let lastX = 0;
let lastY = 0;
let activeSource: TouchDragSource | null = null;
let activeData: Record<string, unknown> | null = null;
let activeTarget: TouchDropTarget | null = null;
let dragging = false;
let ghost: HTMLElement | null = null;
let ghostOffsetX = 0;
let ghostOffsetY = 0;
/** Active finger id from TouchEvent — survives Android pointercancel on long-press. */
let activeTouchId: number | null = null;
/** Timestamp when drag mode began — used to ignore spurious touchcancel. */
let dragStartedAt = 0;

function clearHoldTimer() {
  if (holdTimer !== undefined) {
    clearTimeout(holdTimer);
    holdTimer = undefined;
  }
}

function findSource(start: EventTarget | null): TouchDragSource | null {
  let node =
    start instanceof Element
      ? start
      : start instanceof Node
        ? start.parentElement
        : null;
  while (node) {
    if (node instanceof HTMLElement) {
      const entry = sources.get(node);
      if (entry) return entry;
    }
    node = node.parentElement;
  }
  return null;
}

function findTarget(
  clientX: number,
  clientY: number,
  data: Record<string, unknown>,
): TouchDropTarget | null {
  const stack = document.elementsFromPoint(clientX, clientY);
  for (const el of stack) {
    if (el === ghost) continue;
    let node: Element | null = el;
    while (node) {
      if (node instanceof HTMLElement) {
        const entry = targets.get(node);
        if (entry?.canDrop(data)) {
          return entry;
        }
      }
      node = node.parentElement;
    }
  }
  return null;
}

function removeGhost() {
  ghost?.remove();
  ghost = null;
}

function createGhost(sourceEl: HTMLElement, clientX: number, clientY: number) {
  removeGhost();
  const rect = sourceEl.getBoundingClientRect();
  ghostOffsetX = clientX - rect.left;
  ghostOffsetY = clientY - rect.top;

  const clone = sourceEl.cloneNode(true) as HTMLElement;
  clone.style.position = "fixed";
  clone.style.left = `${rect.left}px`;
  clone.style.top = `${rect.top}px`;
  clone.style.width = `${rect.width}px`;
  clone.style.height = `${rect.height}px`;
  clone.style.margin = "0";
  clone.style.opacity = String(GHOST_OPACITY);
  clone.style.pointerEvents = "none";
  clone.style.zIndex = "2147483646";
  clone.style.boxShadow = "0 8px 24px rgba(0,0,0,0.25)";
  clone.style.transform = "scale(1.03)";
  clone.style.transition = "none";
  clone.removeAttribute("draggable");
  clone.removeAttribute("data-touch-drag-source");
  clone.removeAttribute("data-touch-drop-target");
  document.body.appendChild(clone);
  ghost = clone;
}

function moveGhost(clientX: number, clientY: number) {
  if (!ghost) return;
  ghost.style.left = `${clientX - ghostOffsetX}px`;
  ghost.style.top = `${clientY - ghostOffsetY}px`;
}

function resetDrag() {
  if (activeSource) {
    activeSource.element.style.opacity = "";
  }
  clearHoldTimer();
  removeGhost();
  activeSource = null;
  activeData = null;
  activeTarget = null;
  dragging = false;
  activeTouchId = null;
  dragStartedAt = 0;
}

function endDrag(clientX: number, clientY: number, dropped: boolean) {
  const source = activeSource;
  const data = activeData;
  const target = activeTarget;

  if (dragging && data) {
    if (dropped && target) {
      target.onDrop({ clientX, clientY }, data);
    } else if (target) {
      target.onDragLeave?.(false);
    }
  }

  source?.onDragEnd?.();
  resetDrag();
}

function updateDragAt(clientX: number, clientY: number) {
  lastX = clientX;
  lastY = clientY;
  moveGhost(clientX, clientY);

  const data = activeData;
  if (!data) return;

  const next = findTarget(clientX, clientY, data);
  if (next !== activeTarget) {
    activeTarget?.onDragLeave?.(!!next);
    activeTarget = next;
    activeTarget?.onDragEnter?.();
  }
  activeTarget?.onDrag({ clientX, clientY }, data);
}

function startDrag(source: TouchDragSource, clientX: number, clientY: number) {
  const data = source.getData();
  activeSource = source;
  activeData = data;
  dragging = true;
  dragStartedAt = Date.now();
  lastX = clientX;
  lastY = clientY;
  source.onDragStart?.();
  source.element.style.opacity = "0.45";
  createGhost(source.element, clientX, clientY);
  try {
    navigator.vibrate?.(15);
  } catch {
    // ignore
  }

  // Defer hit-testing so Solid re-renders from onDragStart don't run in the
  // same turn as registration cleanup (which used to kill the drag).
  queueMicrotask(() => {
    if (!(dragging && activeData)) return;
    updateDragAt(clientX, clientY);
  });
}

function touchFromList(list: TouchList, id: number | null): Touch | undefined {
  if (id == null) return list.item(0) ?? undefined;
  for (let i = 0; i < list.length; i++) {
    const t = list.item(i);
    if (t && t.identifier === id) return t;
  }
  return undefined;
}

function isActionTarget(target: EventTarget | null) {
  return (
    target instanceof Element &&
    !!target.closest(
      "button, a, input, textarea, select, [data-row-actions], [data-palette-actions]",
    )
  );
}

function onTouchStart(event: TouchEvent) {
  if (dragging) return;
  if (event.touches.length !== 1) return;

  const touch = event.touches.item(0);
  if (!touch) return;

  const source = findSource(event.target);
  if (!source || isActionTarget(event.target)) return;

  activeTouchId = touch.identifier;
  startX = touch.clientX;
  startY = touch.clientY;
  lastX = startX;
  lastY = startY;
  activeSource = source;
  clearHoldTimer();

  holdTimer = setTimeout(() => {
    holdTimer = undefined;
    if (!activeSource || dragging) return;
    startDrag(activeSource, startX, startY);
  }, HOLD_MS);
}

function onTouchMove(event: TouchEvent) {
  const touch = touchFromList(event.touches, activeTouchId);
  if (!touch) return;

  if (!dragging) {
    if (!activeSource || holdTimer === undefined) return;
    const dx = Math.abs(touch.clientX - startX);
    const dy = Math.abs(touch.clientY - startY);
    if (dx > CANCEL_MOVE_PX || dy > CANCEL_MOVE_PX) {
      // User is scrolling — cancel pending long-press drag.
      resetDrag();
      return;
    }
    // Still holding: block scroll / browser long-press takeover before drag starts.
    event.preventDefault();
    return;
  }

  // Required on Android: only touchmove preventDefault stops scroll / cancel.
  event.preventDefault();
  updateDragAt(touch.clientX, touch.clientY);
}

function onTouchEnd(event: TouchEvent) {
  const touch = touchFromList(event.changedTouches, activeTouchId);
  if (!touch && activeTouchId != null) {
    // Different finger — ignore while our finger is still down.
    if (touchFromList(event.touches, activeTouchId)) return;
  }

  const endTouch = touch ?? touchFromList(event.changedTouches, null);
  if (!dragging) {
    resetDrag();
    return;
  }

  event.preventDefault();
  endDrag(endTouch?.clientX ?? lastX, endTouch?.clientY ?? lastY, true);
}

function onTouchCancel(_event: TouchEvent) {
  if (!dragging && holdTimer === undefined && !activeSource) return;

  // Android often fires touchcancel on long-press / contextmenu right as
  // drag starts. Ignore brief spurious cancels; real gesture end is touchend.
  if (dragging && Date.now() - dragStartedAt < 500) {
    return;
  }

  if (dragging) {
    endDrag(lastX, lastY, false);
    return;
  }
  resetDrag();
}

function onContextMenu(event: Event) {
  if (dragging || holdTimer !== undefined) {
    event.preventDefault();
  }
}

function isAndroidUa() {
  return (
    typeof navigator !== "undefined" &&
    navigator.userAgent.toLowerCase().includes("android")
  );
}

export function registerTouchDragSource(entry: TouchDragSource): () => void {
  sources.set(entry.element, entry);
  entry.element.dataset.touchDragSource = "1";

  // Android Chrome starts native HTML5 DnD on long-press for draggable=true,
  // which cancels the touch gesture and kills our drag the instant it starts.
  // iPad keeps native PDND; only strip draggable on Android.
  const previousDraggable = entry.element.getAttribute("draggable");
  if (isAndroidUa()) {
    entry.element.setAttribute("draggable", "false");
    entry.element.draggable = false;
  }

  return () => {
    // Do not kill an in-progress drag when Solid re-binds the same row
    // after onDragStart causes a re-render.
    if (activeSource?.element === entry.element && !dragging) {
      resetDrag();
    }
    sources.delete(entry.element);
    delete entry.element.dataset.touchDragSource;
    if (isAndroidUa()) {
      if (previousDraggable == null) {
        entry.element.removeAttribute("draggable");
      } else {
        entry.element.setAttribute("draggable", previousDraggable);
      }
    }
  };
}

export function registerTouchDropTarget(entry: TouchDropTarget): () => void {
  targets.set(entry.element, entry);
  entry.element.dataset.touchDropTarget = "1";
  return () => {
    if (activeTarget?.element === entry.element) {
      activeTarget = null;
    }
    targets.delete(entry.element);
    delete entry.element.dataset.touchDropTarget;
  };
}

export function withTouchDragSource(
  entry: TouchDragSource,
  ...cleanups: Array<() => void>
): () => void {
  return combine(registerTouchDragSource(entry), ...cleanups);
}

/**
 * Touch-event DnD for Android Chrome.
 * Uses TouchEvent (not PointerEvent): Android fires pointercancel on long-press,
 * which would kill a pointer-based drag the moment it starts.
 */
export function enableAndroidTouchDrag(): void {
  if (typeof navigator === "undefined" || listening) return;
  if (!navigator.userAgent.toLowerCase().includes("android")) return;

  listening = true;
  const touchOpts: AddEventListenerOptions = { capture: true, passive: false };
  document.addEventListener("touchstart", onTouchStart, touchOpts);
  document.addEventListener("touchmove", onTouchMove, touchOpts);
  document.addEventListener("touchend", onTouchEnd, touchOpts);
  document.addEventListener("touchcancel", onTouchCancel, touchOpts);
  document.addEventListener("contextmenu", onContextMenu, { capture: true });
}
