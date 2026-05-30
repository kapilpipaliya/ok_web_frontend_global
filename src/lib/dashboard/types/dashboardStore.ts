/**
 * Dashboard host store surface consumed by query engine and platform API.
 * Widget runtime fields live on graph vertices; this type is the host accessor API.
 */

export type DashboardWidgetStateSlice = {
  widgetId?: string;
  filters?: Record<string, unknown>;
  sorting?: { column: string | null; direction: string | null };
  pagination?: { page: number; pageSize: number };
  selection?: unknown[];
  expandedRows?: Record<string, boolean>;
  viewMode?: string;
  search?: string;
  loading?: boolean;
  error?: string | null;
  empty?: boolean;
  dataResultVertexId?: string | null;
  rowVertexIds?: string[];
  dataVersion?: number;
  lifecycle?: string;
  executionGeneration?: number;
};

export type DashboardSessionSlice = {
  filters?: Record<string, unknown>;
  timeRange?: unknown;
  layoutState?: Record<string, unknown>;
  layoutOverrides?: Record<string, Record<string, unknown>>;
  hiddenWidgets?: Record<string, boolean>;
  entityDrawer?: Record<string, unknown>;
};

export type DashboardQueryStore = {
  filters: () => Record<string, unknown>;
  timeRange: () => unknown;
  getWidgetState: (widgetId: string) => DashboardWidgetStateSlice | null;
};

export type DashboardRuntimeStore = DashboardQueryStore & {
  txnId?: number;
  get config(): Record<string, unknown>;
  getSession: () => DashboardSessionSlice;
  patchSession: (
    updater: (session: DashboardSessionSlice) => DashboardSessionSlice,
  ) => void;
  patchWidgetState: (
    widgetId: string,
    partial:
      | Partial<DashboardWidgetStateSlice>
      | ((prev: DashboardWidgetStateSlice) => Partial<DashboardWidgetStateSlice>),
  ) => void;
  resolveWidgetPresentation: (widgetId: string) => Record<string, unknown>;
  getWidgetStateVertexId: (widgetId: string) => string | undefined;
  ui: {
    runtimeVertexId: string | null;
    configVertexId: string | null;
    sessionVertexId: string | null;
    widgetStateIds: Record<string, string>;
    dashboard: { loading?: boolean; mode?: string };
  };
  setUi: (key: string, ...args: unknown[]) => void;
};
