/**
 * Reactive query dependency graph: widget ↔ query signatures / logical keys.
 */

export type WidgetSubscription = {
  widgetId: string;
  querySignatures: string[];
  logicalKeys: string[];
};

export type QuerySubscriptionGraph = {
  register: (
    widgetId: string,
    querySignatures: string[],
    logicalKeys?: string[],
  ) => void;
  unregister: (widgetId: string) => void;
  update: (
    widgetId: string,
    querySignatures: string[],
    logicalKeys?: string[],
  ) => void;
  resolveWidgetsForSignatures: (signatures: string[]) => string[];
  resolveWidgetsForLogicalKeys: (keys: string[]) => string[];
  getWidgetSignatures: (widgetId: string) => string[];
  getWidgetLogicalKeys: (widgetId: string) => string[];
  getAllSubscriptions: () => WidgetSubscription[];
};

export function createQuerySubscriptionGraph(): QuerySubscriptionGraph {
  const byWidget = new Map<string, WidgetSubscription>();
  const signatureToWidgets = new Map<string, Set<string>>();
  const logicalToWidgets = new Map<string, Set<string>>();

  const link = (
    map: Map<string, Set<string>>,
    key: string,
    widgetId: string,
  ) => {
    if (!key) return;
    let set = map.get(key);
    if (!set) {
      set = new Set();
      map.set(key, set);
    }
    set.add(widgetId);
  };

  const unlink = (
    map: Map<string, Set<string>>,
    key: string,
    widgetId: string,
  ) => {
    const set = map.get(key);
    if (!set) return;
    set.delete(widgetId);
    if (set.size === 0) map.delete(key);
  };

  const reindex = (sub: WidgetSubscription, previous?: WidgetSubscription) => {
    if (previous) {
      for (const sig of previous.querySignatures)
        unlink(signatureToWidgets, sig, sub.widgetId);
      for (const key of previous.logicalKeys)
        unlink(logicalToWidgets, key, sub.widgetId);
    }
    for (const sig of sub.querySignatures)
      link(signatureToWidgets, sig, sub.widgetId);
    for (const key of sub.logicalKeys)
      link(logicalToWidgets, key, sub.widgetId);
  };

  return {
    register(widgetId, querySignatures, logicalKeys = []) {
      const sub: WidgetSubscription = {
        widgetId,
        querySignatures: [...new Set(querySignatures.filter(Boolean))],
        logicalKeys: [...new Set(logicalKeys.filter(Boolean))],
      };
      const prev = byWidget.get(widgetId);
      byWidget.set(widgetId, sub);
      reindex(sub, prev);
    },
    unregister(widgetId) {
      const prev = byWidget.get(widgetId);
      if (!prev) return;
      reindex({ widgetId, querySignatures: [], logicalKeys: [] }, prev);
      byWidget.delete(widgetId);
    },
    update(widgetId, querySignatures, logicalKeys) {
      this.register(widgetId, querySignatures, logicalKeys);
    },
    resolveWidgetsForSignatures(signatures) {
      const out = new Set<string>();
      for (const sig of signatures) {
        const set = signatureToWidgets.get(sig);
        if (set) for (const id of set) out.add(id);
      }
      return [...out];
    },
    resolveWidgetsForLogicalKeys(keys) {
      const out = new Set<string>();
      for (const key of keys) {
        const set = logicalToWidgets.get(key);
        if (set) for (const id of set) out.add(id);
      }
      return [...out];
    },
    getWidgetSignatures(widgetId) {
      return byWidget.get(widgetId)?.querySignatures ?? [];
    },
    getWidgetLogicalKeys(widgetId) {
      return byWidget.get(widgetId)?.logicalKeys ?? [];
    },
    getAllSubscriptions() {
      return [...byWidget.values()];
    },
  };
}
