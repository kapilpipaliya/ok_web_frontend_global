/**
 * Runtime lifetime tree — scoped disposal cascades for long-lived SPA runtimes.
 */

export type LifetimeDisposeFn = () => void;

export type LifetimeNode = {
  scopeId: string;
  parentScopeId: string | null;
  kind: string;
  children: Set<string>;
  disposeCallbacks: LifetimeDisposeFn[];
  disposed: boolean;
};

export type RuntimeLifetimeTree = {
  register: (
    scopeId: string,
    options: { parentScopeId?: string | null; kind?: string; onDispose?: LifetimeDisposeFn },
  ) => void;
  addDisposeCallback: (scopeId: string, fn: LifetimeDisposeFn) => void;
  dispose: (scopeId: string) => void;
  disposeAll: () => void;
  isDisposed: (scopeId: string) => boolean;
  getNode: (scopeId: string) => LifetimeNode | undefined;
  getTreeSnapshot: () => LifetimeNode[];
};

export function createRuntimeLifetimeTree(rootScopeId: string): RuntimeLifetimeTree {
  const nodes = new Map<string, LifetimeNode>();

  const ensureNode = (scopeId: string, parentScopeId: string | null, kind: string) => {
    let node = nodes.get(scopeId);
    if (!node) {
      node = {
        scopeId,
        parentScopeId,
        kind,
        children: new Set(),
        disposeCallbacks: [],
        disposed: false,
      };
      nodes.set(scopeId, node);
    }
    return node;
  };

  const disposeNode = (scopeId: string) => {
    const node = nodes.get(scopeId);
    if (!node || node.disposed) return;

    for (const childId of [...node.children]) {
      disposeNode(childId);
    }

    for (let index = node.disposeCallbacks.length - 1; index >= 0; index--) {
      try {
        node.disposeCallbacks[index]();
      } catch (error) {
        console.error(`RuntimeLifetimeTree dispose error [${scopeId}]:`, error);
      }
    }
    node.disposeCallbacks.length = 0;
    node.disposed = true;

    if (node.parentScopeId) {
      const parent = nodes.get(node.parentScopeId);
      parent?.children.delete(scopeId);
    }
  };

  ensureNode(rootScopeId, null, "dashboard");

  return {
    register(scopeId, options = {}) {
      const parentScopeId = options.parentScopeId ?? rootScopeId;
      const node = ensureNode(scopeId, parentScopeId, options.kind || "child");
      if (options.onDispose) node.disposeCallbacks.push(options.onDispose);
      if (parentScopeId) {
        const parent = ensureNode(parentScopeId, null, "dashboard");
        parent.children.add(scopeId);
      }
    },

    addDisposeCallback(scopeId, fn) {
      const node = nodes.get(scopeId);
      if (node && !node.disposed) node.disposeCallbacks.push(fn);
    },

    dispose(scopeId) {
      disposeNode(scopeId);
    },

    disposeAll() {
      disposeNode(rootScopeId);
      for (const scopeId of [...nodes.keys()]) {
        if (scopeId !== rootScopeId) disposeNode(scopeId);
      }
    },

    isDisposed(scopeId) {
      return nodes.get(scopeId)?.disposed === true;
    },

    getNode(scopeId) {
      return nodes.get(scopeId);
    },

    getTreeSnapshot() {
      return [...nodes.values()].map((node) => ({
        ...node,
        children: new Set(node.children),
        disposeCallbacks: [],
      }));
    },
  };
}
