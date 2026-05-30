/**
 * Runtime scope isolation for nested dashboards, drawers, and embedded runtimes.
 */

let scopeCounter = 0;

export type RuntimeScope = {
  scopeId: string;
  parentScopeId: string | null;
  namespace: string;
  kind: "dashboard" | "drawer" | "entity" | "nested";
};

export function createRuntimeScope(
  kind: RuntimeScope["kind"] = "dashboard",
  parentScopeId: string | null = null,
): RuntimeScope {
  scopeCounter += 1;
  const scopeId = `${kind}_${scopeCounter}_${Date.now().toString(36)}`;
  const namespace = parentScopeId ? `${parentScopeId}/${scopeId}` : scopeId;
  return { scopeId, parentScopeId, namespace, kind };
}

export function scopedInteractionKey(scope: RuntimeScope, eventType: string): string {
  return `${scope.namespace}:${eventType}`;
}

export function isInteractionInScope(
  eventScopeId: string | undefined,
  runtimeScope: RuntimeScope,
): boolean {
  if (!eventScopeId) return true;
  return (
    eventScopeId === runtimeScope.scopeId ||
    eventScopeId.startsWith(`${runtimeScope.namespace}/`)
  );
}
