type DragPoint = {
  pageX: number;
  pageY: number;
};

export function attachPointerDrag(
  e: PointerEvent,
  onMove: (point: DragPoint) => void,
  onEnd: () => void,
) {
  e.preventDefault();
  e.stopPropagation();

  const pointerId = e.pointerId;
  let ended = false;

  const finish = () => {
    if (ended) {
      return;
    }
    ended = true;
    onEnd();
    window.removeEventListener("pointermove", onPointerMove);
    window.removeEventListener("pointerup", onPointerUp);
    window.removeEventListener("pointercancel", onPointerUp);
    window.removeEventListener("touchmove", onTouchMove);
    window.removeEventListener("touchend", onTouchEnd);
    window.removeEventListener("touchcancel", onTouchEnd);
    window.removeEventListener("contextmenu", onPointerUp);
  };

  const onPointerMove = (moveEvent: PointerEvent) => {
    moveEvent.preventDefault();
    if (moveEvent.pointerId !== pointerId) {
      return;
    }
    onMove(moveEvent);
  };

  const onPointerUp = (upEvent: PointerEvent) => {
    if (upEvent.pointerId !== pointerId) {
      return;
    }
    finish();
  };

  const onTouchMove = (touchEvent: TouchEvent) => {
    touchEvent.preventDefault();
    const touch = touchEvent.touches[0];
    if (!touch) {
      return;
    }
    onMove({ pageX: touch.pageX, pageY: touch.pageY });
  };

  const onTouchEnd = () => {
    finish();
  };

  window.addEventListener("pointermove", onPointerMove, { passive: false });
  window.addEventListener("pointerup", onPointerUp);
  window.addEventListener("pointercancel", onPointerUp);
  window.addEventListener("touchmove", onTouchMove, { passive: false });
  window.addEventListener("touchend", onTouchEnd);
  window.addEventListener("touchcancel", onTouchEnd);
  window.addEventListener("contextmenu", onPointerUp);
}
