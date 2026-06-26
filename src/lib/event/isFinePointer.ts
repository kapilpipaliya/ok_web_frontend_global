/** Mouse and stylus; excludes finger touch (which uses tap-to-reveal instead). */
export function isFinePointer(e: PointerEvent): boolean {
  return e.pointerType !== "touch";
}
