import { createSignal, type Accessor } from "solid-js";

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
 * Optional enter delay avoids flashing actions when moving quickly across rows.
 * Leave is delayed so you can move to row action buttons or portaled menus.
 */
export function createDelayedFineHover(
  onEnter: () => void,
  onLeave: () => void,
  options?: {
    enterDelayMs?: number;
    leaveDelayMs?: number;
    onImmediateLeave?: () => void;
  },
) {
  const enterDelayMs = options?.enterDelayMs ?? 0;
  const leaveDelayMs = options?.leaveDelayMs ?? 150;
  let enterTimer: ReturnType<typeof setTimeout> | undefined;
  let leaveTimer: ReturnType<typeof setTimeout> | undefined;
  let isActive = false;

  const clearEnterTimer = () => {
    if (enterTimer !== undefined) {
      clearTimeout(enterTimer);
      enterTimer = undefined;
    }
  };

  const clearLeaveTimer = () => {
    if (leaveTimer !== undefined) {
      clearTimeout(leaveTimer);
      leaveTimer = undefined;
    }
  };

  const clear = () => {
    clearEnterTimer();
    clearLeaveTimer();
  };

  const activate = () => {
    isActive = true;
    onEnter();
  };

  const deactivate = () => {
    clear();
    if (!isActive) return;
    isActive = false;
    onLeave();
  };

  return {
    onPointerEnter: (event: PointerEvent) => {
      if (!isFinePointer(event)) return;
      clearLeaveTimer();
      options?.onImmediateLeave?.();
      if (isActive) return;
      clearEnterTimer();
      if (enterDelayMs <= 0) {
        activate();
        return;
      }
      enterTimer = setTimeout(() => {
        enterTimer = undefined;
        activate();
      }, enterDelayMs);
    },
    onPointerLeave: (event: PointerEvent) => {
      if (!isFinePointer(event)) return;
      clearEnterTimer();
      if (!isActive) return;
      clearLeaveTimer();
      leaveTimer = setTimeout(() => {
        leaveTimer = undefined;
        deactivate();
      }, leaveDelayMs);
    },
    /** Cancel pending leave — e.g. moving onto a portaled action menu. */
    keepVisible: () => {
      clearLeaveTimer();
    },
    /** Immediately hide — e.g. another row took over fine hover. */
    deactivateImmediate: deactivate,
    cleanup: () => {
      clearEnterTimer();
      if (isActive) {
        isActive = false;
        onLeave();
      } else {
        clearLeaveTimer();
      }
    },
    isActive: () => isActive,
  };
}

let activeFineHoverItemId: Id | null = null;
const fineHoverDeactivateByItemId = new Map<Id, () => void>();

function deactivateFineHoverExcept(keepItemId: Id | null) {
  if (
    activeFineHoverItemId != null &&
    activeFineHoverItemId !== keepItemId
  ) {
    fineHoverDeactivateByItemId.get(activeFineHoverItemId)?.();
    activeFineHoverItemId = null;
  }
}

export function createTreeRowInteraction(options: {
  itemId: Id;
  pinWhile?: Accessor<boolean> | (() => boolean);
  onFineEnter?: () => void;
  onFineLeave?: () => void;
  /** Delay before row action buttons appear (0 = instant, same as highlight). */
  actionsEnterDelayMs?: number;
  actionsLeaveDelayMs?: number;
}) {
  const [isHighlighted, setIsHighlighted] = createSignal(false);
  const [actionsVisible, setActionsVisible] = createSignal(false);
  const [isPointerOverRow, setIsPointerOverRow] = createSignal(false);

  let actionsEnterTimer: ReturnType<typeof setTimeout> | undefined;
  let actionsLeaveTimer: ReturnType<typeof setTimeout> | undefined;
  let coordinatorLeaveTimer: ReturnType<typeof setTimeout> | undefined;

  const isPinned = () => {
    const pin = options.pinWhile;
    return pin ? pin() : false;
  };

  const clearActionsEnterTimer = () => {
    if (actionsEnterTimer !== undefined) {
      clearTimeout(actionsEnterTimer);
      actionsEnterTimer = undefined;
    }
  };

  const clearActionsLeaveTimer = () => {
    if (actionsLeaveTimer !== undefined) {
      clearTimeout(actionsLeaveTimer);
      actionsLeaveTimer = undefined;
    }
  };

  const clearCoordinatorLeaveTimer = () => {
    if (coordinatorLeaveTimer !== undefined) {
      clearTimeout(coordinatorLeaveTimer);
      coordinatorLeaveTimer = undefined;
    }
  };

  const deactivateRow = () => {
    clearActionsEnterTimer();
    clearActionsLeaveTimer();
    clearCoordinatorLeaveTimer();
    setIsHighlighted(false);
    setIsPointerOverRow(false);
    if (!isPinned()) {
      setActionsVisible(false);
    }
    options.onFineLeave?.();
    if (activeFineHoverItemId === options.itemId) {
      activeFineHoverItemId = null;
    }
  };

  fineHoverDeactivateByItemId.set(options.itemId, deactivateRow);

  const scheduleShowActions = () => {
    clearActionsEnterTimer();
    const delay = options.actionsEnterDelayMs ?? 0;
    if (delay <= 0) {
      setActionsVisible(true);
      return;
    }
    actionsEnterTimer = setTimeout(() => {
      actionsEnterTimer = undefined;
      setActionsVisible(true);
    }, delay);
  };

  const scheduleHideActions = () => {
    clearActionsEnterTimer();
    if (!actionsVisible()) return;
    clearActionsLeaveTimer();
    const delay = options.actionsLeaveDelayMs ?? 150;
    actionsLeaveTimer = setTimeout(() => {
      actionsLeaveTimer = undefined;
      if (!isPinned()) {
        setActionsVisible(false);
      }
      scheduleCoordinatorLeave();
    }, delay);
  };

  const scheduleCoordinatorLeave = () => {
    clearCoordinatorLeaveTimer();
    const delay = options.actionsLeaveDelayMs ?? 150;
    coordinatorLeaveTimer = setTimeout(() => {
      coordinatorLeaveTimer = undefined;
      if (isPointerOverRow() || isPinned() || actionsVisible()) {
        return;
      }
      options.onFineLeave?.();
      if (activeFineHoverItemId === options.itemId) {
        activeFineHoverItemId = null;
      }
    }, delay);
  };

  const keepActionsVisible = () => {
    clearActionsLeaveTimer();
    clearCoordinatorLeaveTimer();
  };

  const onPointerLeaveRow = (event: PointerEvent) => {
    if (!isFinePointer(event)) return;
    setIsPointerOverRow(false);
    setIsHighlighted(false);
    if (!actionsVisible() && !isPinned()) {
      scheduleCoordinatorLeave();
    }
    scheduleHideActions();
  };

  const showActions = () =>
    actionsVisible() ||
    isTouchRevealedRow(options.itemId) ||
    isPinned();

  const isRowHighlighted = () =>
    isHighlighted() ||
    actionsVisible() ||
    isTouchRevealedRow(options.itemId) ||
    isPinned();

  const rowPointerProps = {
    onPointerEnter: (event: PointerEvent) => {
      if (!isFinePointer(event)) return;
      deactivateFineHoverExcept(options.itemId);
      activeFineHoverItemId = options.itemId;
      setIsHighlighted(true);
      setIsPointerOverRow(true);
      options.onFineEnter?.();
      scheduleShowActions();
    },
    onPointerLeave: onPointerLeaveRow,
    onPointerDown: (event: PointerEvent) => {
      if (event.pointerType === "touch") {
        revealTouchRow(options.itemId);
      }
    },
  };

  const actionAreaProps = actionPointerProps(keepActionsVisible);

  const floatingBridgeProps = {
    onPointerEnter: keepActionsVisible,
    onPointerLeave: onPointerLeaveRow,
  };

  const pin = () => {
    setIsHighlighted(true);
    setActionsVisible(true);
  };

  const unpinIfNotOverRow = () => {
    if (!isPointerOverRow()) {
      setIsHighlighted(false);
      if (!isPinned()) {
        setActionsVisible(false);
        options.onFineLeave?.();
      }
    }
  };

  const cleanup = () => {
    fineHoverDeactivateByItemId.delete(options.itemId);
    if (activeFineHoverItemId === options.itemId) {
      activeFineHoverItemId = null;
    }
    clearActionsEnterTimer();
    clearActionsLeaveTimer();
    clearCoordinatorLeaveTimer();
    setIsHighlighted(false);
    if (!isPinned()) {
      setActionsVisible(false);
    }
  };

  return {
    actionAreaProps,
    cleanup,
    floatingBridgeProps,
    isHighlighted: isRowHighlighted,
    isFineHovered: actionsVisible,
    isPointerOverRow,
    pin,
    rowPointerProps,
    showActions,
    unpinIfNotOverRow,
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
