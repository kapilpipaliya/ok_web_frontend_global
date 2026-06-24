/**
 * Canonical widget lifecycle phases — widgets transition via runtime only.
 */

export const WIDGET_LIFECYCLE = [
  "INIT",
  "LOAD",
  "READY",
  "STALE",
  "STALE_PENDING_REFRESH",
  "REFRESHING",
  "PENDING_COMMIT",
  "ERROR",
  "CANCELLED",
  "DISPOSE",
  "DISPOSED",
] as const;

export type WidgetLifecyclePhase = (typeof WIDGET_LIFECYCLE)[number];

const ALLOWED: Record<WidgetLifecyclePhase, WidgetLifecyclePhase[]> = {
  INIT: ["LOAD", "DISPOSE", "DISPOSED"],
  LOAD: [
    "READY",
    "ERROR",
    "DISPOSE",
    "DISPOSED",
    "REFRESHING",
    "STALE_PENDING_REFRESH",
  ],
  READY: [
    "STALE",
    "STALE_PENDING_REFRESH",
    "REFRESHING",
    "ERROR",
    "DISPOSE",
    "DISPOSED",
  ],
  STALE: [
    "STALE_PENDING_REFRESH",
    "REFRESHING",
    "READY",
    "ERROR",
    "DISPOSE",
    "DISPOSED",
  ],
  STALE_PENDING_REFRESH: [
    "REFRESHING",
    "READY",
    "ERROR",
    "CANCELLED",
    "DISPOSE",
    "DISPOSED",
  ],
  REFRESHING: [
    "PENDING_COMMIT",
    "READY",
    "ERROR",
    "STALE",
    "CANCELLED",
    "DISPOSE",
    "DISPOSED",
  ],
  PENDING_COMMIT: ["READY", "ERROR", "CANCELLED", "DISPOSE", "DISPOSED"],
  ERROR: ["REFRESHING", "LOAD", "STALE_PENDING_REFRESH", "DISPOSE", "DISPOSED"],
  CANCELLED: [
    "REFRESHING",
    "STALE_PENDING_REFRESH",
    "READY",
    "DISPOSE",
    "DISPOSED",
  ],
  DISPOSE: ["DISPOSED"],
  DISPOSED: [],
};

export function canTransition(
  from: WidgetLifecyclePhase,
  to: WidgetLifecyclePhase,
): boolean {
  return ALLOWED[from]?.includes(to) ?? false;
}

export function transitionLifecycle(
  current: WidgetLifecyclePhase | undefined,
  next: WidgetLifecyclePhase,
): WidgetLifecyclePhase {
  const from = current || "INIT";
  if (from === next) return from;
  if (canTransition(from, next)) return next;
  if (
    next === "REFRESHING" &&
    (from === "READY" || from === "STALE" || from === "STALE_PENDING_REFRESH")
  )
    return next;
  if (
    next === "READY" &&
    (from === "REFRESHING" || from === "LOAD" || from === "PENDING_COMMIT")
  )
    return next;
  if (
    next === "STALE_PENDING_REFRESH" &&
    (from === "READY" || from === "STALE")
  )
    return next;
  if (next === "PENDING_COMMIT" && from === "REFRESHING") return next;
  if (next === "CANCELLED") return next;
  if (next === "DISPOSED" && from === "DISPOSE") return next;
  return from;
}
