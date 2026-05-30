/**
 * Widget-level cache + abort controller registry for dashboard queries.
 */

/** Graph-first cache row — references vertices merged into local graph. */
export type WidgetCacheEntry = {
  dataResultVertexId?: string | null;
  rowVertexIds?: string[];
  meta?: Record<string, unknown>;
  fetchedAt: number;
  querySignature: string;
  /** When set, entry is treated as a miss after this timestamp (ms). */
  expiresAt?: number;
};

export type DashboardCache = {
  query: Map<string, WidgetCacheEntry>;
  widget: Map<string, { lastSignature: string; entry: WidgetCacheEntry }>;
  layout: Map<string, unknown>;
  preference: Map<string, unknown>;
  abort: Map<string, AbortController>;
  getQuery: (signature: string) => WidgetCacheEntry | undefined;
  setQuery: (signature: string, entry: WidgetCacheEntry) => void;
  getWidget: (widgetId: string) => WidgetCacheEntry | undefined;
  setWidget: (
    widgetId: string,
    signature: string,
    entry: WidgetCacheEntry,
    ttlSeconds?: number,
  ) => void;
  abortPending: (key: string) => void;
  createAbort: (key: string) => AbortController;
  invalidateSignatures: (signatures: string[]) => string[];
  invalidateWidgets: (widgetIds: string[]) => void;
  clear: () => void;
};

export function createDashboardCache(): DashboardCache {
  const query = new Map<string, WidgetCacheEntry>();
  const widget = new Map<string, { lastSignature: string; entry: WidgetCacheEntry }>();
  const layout = new Map<string, unknown>();
  const preference = new Map<string, unknown>();
  const abort = new Map<string, AbortController>();

  return {
    query,
    widget,
    layout,
    preference,
    abort,
    getQuery(signature) {
      return query.get(signature);
    },
    setQuery(signature, entry) {
      query.set(signature, entry);
    },
    getWidget(widgetId) {
      const row = widget.get(widgetId);
      if (!row) return undefined;
      if (row.entry.expiresAt != null && Date.now() > row.entry.expiresAt) {
        if (row.lastSignature) query.delete(row.lastSignature);
        widget.delete(widgetId);
        return undefined;
      }
      return row.entry;
    },
    setWidget(widgetId, signature, entry, ttlSeconds) {
      const ttlMs =
        ttlSeconds != null && ttlSeconds > 0 ? ttlSeconds * 1000 : undefined;
      const withExpiry: WidgetCacheEntry = {
        ...entry,
        expiresAt: ttlMs != null ? Date.now() + ttlMs : undefined,
      };
      widget.set(widgetId, { lastSignature: signature, entry: withExpiry });
      query.set(signature, withExpiry);
    },
    abortPending(key) {
      const controller = abort.get(key);
      if (controller) {
        controller.abort();
        abort.delete(key);
      }
    },
    createAbort(key) {
      this.abortPending(key);
      const controller = new AbortController();
      abort.set(key, controller);
      return controller;
    },
    invalidateSignatures(signatures) {
      const affectedWidgets: string[] = [];
      for (const signature of signatures) {
        query.delete(signature);
        for (const [widgetId, row] of widget.entries()) {
          if (row.lastSignature === signature) {
            widget.delete(widgetId);
            affectedWidgets.push(widgetId);
          }
        }
      }
      return affectedWidgets;
    },
    invalidateWidgets(widgetIds) {
      for (const widgetId of widgetIds) {
        const row = widget.get(widgetId);
        if (row?.lastSignature) query.delete(row.lastSignature);
        widget.delete(widgetId);
      }
    },
    clear() {
      query.clear();
      widget.clear();
      layout.clear();
      preference.clear();
      for (const controller of abort.values()) controller.abort();
      abort.clear();
    },
  };
}
