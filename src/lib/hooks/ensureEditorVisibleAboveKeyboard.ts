/**
 * Scrolls a focused editor into the visible area, accounting for the Android
 * soft keyboard shrinking visualViewport after focus.
 */
export function ensureEditorVisibleAboveKeyboard(el: HTMLElement) {
  if (typeof window === "undefined") {
    return;
  }

  const scroll = () => {
    const vv = window.visualViewport;
    if (!vv) {
      el.scrollIntoView({ block: "nearest", inline: "nearest" });
      return;
    }

    const rect = el.getBoundingClientRect();
    const visibleTop = vv.offsetTop;
    const visibleBottom = vv.offsetTop + vv.height;
    const pad = 16;

    if (rect.bottom > visibleBottom - pad || rect.top < visibleTop + pad) {
      el.scrollIntoView({ block: "center", inline: "nearest" });
    }
  };

  // Immediate attempt (keyboard may already be open)
  requestAnimationFrame(scroll);

  const vv = window.visualViewport;
  if (!vv) {
    return;
  }

  // Keyboard animation often finishes after focus; keep editor visible.
  const onResize = () => scroll();
  vv.addEventListener("resize", onResize);
  window.setTimeout(() => {
    vv.removeEventListener("resize", onResize);
    scroll();
  }, 600);
}
