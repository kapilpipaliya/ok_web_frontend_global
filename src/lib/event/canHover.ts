/** True when the device has a real hover pointer (mouse/stylus), not finger touch. */
export function canHover(): boolean {
  if (typeof window === "undefined") {
    return true;
  }

  return window.matchMedia("(hover: hover) and (pointer: fine)").matches;
}
