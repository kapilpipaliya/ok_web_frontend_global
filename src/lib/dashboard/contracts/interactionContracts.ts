/**
 * Canonical dashboard interaction event contracts (v1).
 * Keep payloads small and versioned — widgets must not invent ad-hoc action names.
 */

export const DASHBOARD_INTERACTION_VERSION = 1;

export const DASHBOARD_EVENT_TYPES = [
  "SET_FILTER",
  "NAVIGATE",
  "OPEN_ENTITY_DRAWER",
  "REFRESH_WIDGET",
  "REFRESH_DASHBOARD",
  "SET_TIME_RANGE",
  "ROW_SELECTED",
  "SELECT_ENTITY",
  "ENTITY_CREATED",
  "ENTITY_UPDATED",
  "ENTITY_DELETED",
  "RELATION_CREATED",
  "RELATION_REMOVED",
] as const;

export type DashboardEventType = (typeof DASHBOARD_EVENT_TYPES)[number];

export type DashboardInteractionEvent = {
  version?: number;
  type: DashboardEventType | string;
  sourceWidgetId?: string;
  targetWidgetId?: string;
  payload?: Record<string, unknown>;
  to?: string;
  value?: unknown;
  widgetId?: string;
};

/** Widget config interaction — UI trigger + canonical event type. */
export type WidgetInteractionConfig = {
  trigger: string;
  type: DashboardEventType;
  targetWidgetId?: string;
  sourceWidgetId?: string;
  payload?: Record<string, unknown>;
  to?: string;
  widgetId?: string;
};

const TEMPLATE_ROW_ID = /\{\{row\.id\}\}/g;
const TEMPLATE_ROW_PROP = /\{\{row\.P\.(\w+)\}\}/g;
const TEMPLATE_CLICKED_VALUE = /\{\{clicked\.value\}\}/g;

export function substituteTemplateString(
  template: string,
  context: {
    row?: { id?: string; P?: Record<string, unknown> };
    clicked?: { value?: unknown };
  },
): string {
  let result = String(template);
  if (context.row) {
    result = result.replace(TEMPLATE_ROW_ID, String(context.row.id ?? ""));
    result = result.replace(TEMPLATE_ROW_PROP, (_, key: string) =>
      String(context.row?.P?.[key] ?? ""),
    );
  }
  if (context.clicked?.value != null) {
    result = result.replace(
      TEMPLATE_CLICKED_VALUE,
      String(context.clicked.value),
    );
  }
  return result;
}

export function substitutePayloadTemplates(
  payload: Record<string, unknown> | undefined,
  context: {
    row?: { id?: string; P?: Record<string, unknown> };
    clicked?: { value?: unknown };
  },
): Record<string, unknown> {
  if (!payload || typeof payload !== "object") return {};
  const out: Record<string, unknown> = {};
  for (const key of Object.keys(payload)) {
    const value = payload[key];
    if (typeof value === "string") {
      out[key] = substituteTemplateString(value, context);
    } else if (
      value != null &&
      typeof value === "object" &&
      !Array.isArray(value)
    ) {
      out[key] = substitutePayloadTemplates(
        value as Record<string, unknown>,
        context,
      );
    } else {
      out[key] = value;
    }
  }
  return out;
}

export function normalizeInteractionEvent(
  raw: DashboardInteractionEvent | null | undefined,
): DashboardInteractionEvent | null {
  if (!raw?.type) return null;
  const type = String(raw.type).toUpperCase();
  if (!DASHBOARD_EVENT_TYPES.includes(type as DashboardEventType)) {
    return null;
  }
  return {
    version: Number(raw.version ?? DASHBOARD_INTERACTION_VERSION),
    type,
    sourceWidgetId: raw.sourceWidgetId,
    targetWidgetId: raw.targetWidgetId,
    payload:
      raw.payload && typeof raw.payload === "object" ? { ...raw.payload } : {},
    to: raw.to,
    value: raw.value,
    widgetId: raw.widgetId,
  };
}

export function resolveWidgetInteraction(
  config: WidgetInteractionConfig | null | undefined,
  eventPayload?: {
    row?: { id?: string; P?: Record<string, unknown> };
    clicked?: { value?: unknown; label?: unknown; count?: unknown };
  },
): DashboardInteractionEvent | null {
  if (!(config?.trigger && config?.type)) return null;
  const payload = substitutePayloadTemplates(
    {
      ...(config.payload || {}),
      ...(eventPayload?.row ? { row: eventPayload.row } : {}),
    },
    eventPayload || {},
  );
  return normalizeInteractionEvent({
    type: config.type,
    targetWidgetId: config.targetWidgetId,
    sourceWidgetId: config.sourceWidgetId,
    payload,
    to: config.to,
    widgetId: config.widgetId,
  });
}

export function buildOpenEntityDrawerEvent(
  payload: Record<string, unknown>,
  sourceWidgetId?: string,
): DashboardInteractionEvent {
  return normalizeInteractionEvent({
    type: "OPEN_ENTITY_DRAWER",
    sourceWidgetId,
    payload,
  })!;
}
