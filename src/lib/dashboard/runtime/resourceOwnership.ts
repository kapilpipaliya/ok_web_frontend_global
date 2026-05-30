/**
 * Resource ownership graph — parent scope, cleanup contract, dependency chain.
 */

import type { RuntimeLifetimeTree } from "./lifetimeTree";

export type ResourceCleanupPolicy = "dispose" | "cancel" | "detach";
export type ResourceLifetimeMode = "scope" | "session" | "ephemeral";

export type OwnedResource = {
  resourceId: string;
  scopeId: string;
  kind: string;
  parentScopeId?: string | null;
  cleanupPolicy: ResourceCleanupPolicy;
  dependsOn?: string[];
  lifetimeMode: ResourceLifetimeMode;
};

export type ResourceOwnershipGraph = {
  register: (
    resource: OwnedResource,
    onCleanup?: () => void,
  ) => void;
  unregister: (resourceId: string) => void;
  disposeScope: (scopeId: string) => void;
  getSnapshot: () => OwnedResource[];
  bindLifetimeTree: (tree: RuntimeLifetimeTree) => void;
};

export function createResourceOwnershipGraph(): ResourceOwnershipGraph {
  const resources = new Map<string, { resource: OwnedResource; onCleanup?: () => void }>();
  let lifetimeTree: RuntimeLifetimeTree | null = null;

  const disposeResource = (resourceId: string) => {
    const entry = resources.get(resourceId);
    if (!entry) return;
    try {
      entry.onCleanup?.();
    } catch (error) {
      console.error(`ResourceOwnershipGraph cleanup error [${resourceId}]:`, error);
    }
    resources.delete(resourceId);
  };

  return {
    register(resource, onCleanup) {
      resources.set(resource.resourceId, { resource, onCleanup });
      if (lifetimeTree) {
        lifetimeTree.addDisposeCallback(resource.scopeId, () => disposeResource(resource.resourceId));
      }
    },
    unregister(resourceId) {
      disposeResource(resourceId);
    },
    disposeScope(scopeId) {
      for (const [resourceId, entry] of resources.entries()) {
        if (entry.resource.scopeId === scopeId) disposeResource(resourceId);
      }
    },
    getSnapshot() {
      return [...resources.values()].map((entry) => ({ ...entry.resource }));
    },
    bindLifetimeTree(tree) {
      lifetimeTree = tree;
    },
  };
}
