export type WidgetCapabilities = {
  filterable: boolean;
  drilldown: boolean;
  exportable: boolean;
  realtime: boolean;
  editable: boolean;
  selectable: boolean;
};

export type WidgetEditorMeta = {
  configurableFields: string[];
  supportedLayouts: string[];
  defaultSize: { w: number; h: number };
};

const DEFAULT_BY_TYPE: Record<string, Partial<WidgetCapabilities>> = {
  metricCard: {
    filterable: true,
    drilldown: false,
    exportable: false,
    realtime: true,
    editable: false,
    selectable: false,
  },
  chart: {
    filterable: true,
    drilldown: true,
    exportable: false,
    realtime: true,
    editable: false,
    selectable: false,
  },
  crudTable: {
    filterable: true,
    drilldown: true,
    exportable: true,
    realtime: true,
    editable: true,
    selectable: true,
  },
  markdown: {
    filterable: false,
    drilldown: false,
    exportable: false,
    realtime: false,
    editable: false,
    selectable: false,
  },
  html: {
    filterable: false,
    drilldown: false,
    exportable: false,
    realtime: false,
    editable: false,
    selectable: false,
  },
  quickActions: {
    filterable: false,
    drilldown: false,
    exportable: false,
    realtime: false,
    editable: false,
    selectable: false,
  },
};

export function resolveWidgetCapabilities(widget: {
  type?: string;
  capabilities?: Partial<WidgetCapabilities>;
}): WidgetCapabilities {
  const type = widget.type || "";
  const defaults = DEFAULT_BY_TYPE[type] || DEFAULT_BY_TYPE.metricCard;
  return {
    filterable: widget.capabilities?.filterable ?? defaults.filterable ?? false,
    drilldown: widget.capabilities?.drilldown ?? defaults.drilldown ?? false,
    exportable: widget.capabilities?.exportable ?? defaults.exportable ?? false,
    realtime: widget.capabilities?.realtime ?? defaults.realtime ?? false,
    editable: widget.capabilities?.editable ?? defaults.editable ?? false,
    selectable: widget.capabilities?.selectable ?? defaults.selectable ?? false,
  };
}

export function resolveWidgetEditorMeta(widget: {
  type?: string;
  layout?: { w?: number; h?: number };
  editor?: Partial<WidgetEditorMeta>;
}): WidgetEditorMeta {
  const layout = widget.layout || {};
  return {
    configurableFields: widget.editor?.configurableFields ?? [
      "title",
      "layout",
      "dataSource",
      "interactions",
    ],
    supportedLayouts: widget.editor?.supportedLayouts ?? ["grid"],
    defaultSize: widget.editor?.defaultSize ?? {
      w: Number(layout.w ?? 3),
      h: Number(layout.h ?? 2),
    },
  };
}
