export interface PaletteTreeConfig {
  parentVertexLabel: string;
  toParentEdgeType: string;
  rootKeys: { key: string };
  tableVertexLabel: string;
  relationshipType: string;
  label: string;
  loadFullTree: boolean;
  formConfig: {
    gridColumns: number;
    groups: Array<{
      key: string;
      title: string;
      gridColumns: number;
      fields: Array<Record<string, unknown>>;
    }>;
  };
}

const categoryFormConfig = {
  gridColumns: 1,
  groups: [
    {
      key: "basic",
      title: "Category",
      gridColumns: 2,
      fields: [
        {
          key: "name",
          label: "Name",
          dataType: "text",
          renderer: "text",
          required: true,
          colSpan: 2,
        },
        {
          key: "key",
          label: "Key",
          dataType: "text",
          renderer: "text",
          colSpan: 2,
        },
      ],
    },
  ],
};

export const COMPONENT_PALETTE_CONFIG: PaletteTreeConfig = {
  parentVertexLabel: "ComponentCategory",
  toParentEdgeType: "ParentComponentCategory",
  rootKeys: { key: "root" },
  tableVertexLabel: "Component",
  relationshipType: "ParentComponentCategory",
  label: "Categories",
  loadFullTree: true,
  formConfig: categoryFormConfig,
};

export const PAGE_PALETTE_CONFIG: PaletteTreeConfig = {
  parentVertexLabel: "PageCategory",
  toParentEdgeType: "ParentPageCategory",
  rootKeys: { key: "root" },
  tableVertexLabel: "Page",
  relationshipType: "ParentPageCategory",
  label: "Categories",
  loadFullTree: true,
  formConfig: categoryFormConfig,
};

export const FUNCTION_PALETTE_CONFIG: PaletteTreeConfig = {
  parentVertexLabel: "FunctionCategory",
  toParentEdgeType: "ParentFunctionCategory",
  rootKeys: { key: "root" },
  tableVertexLabel: "Function",
  relationshipType: "ParentFunctionCategory",
  label: "Categories",
  loadFullTree: true,
  formConfig: categoryFormConfig,
};

export function getUncategorizedPaletteId(config: PaletteTreeConfig) {
  return `_${config.tableVertexLabel}_uncategorized`;
}

export function isUncategorizedPaletteId(
  config: PaletteTreeConfig,
  id: string | null | undefined,
) {
  return id === getUncategorizedPaletteId(config);
}

export function resolvePaletteSaveCategoryId(
  graph: { vertexes: Record<string, { P?: { key?: string } } | undefined> },
  categoryId: string | null | undefined,
  config: PaletteTreeConfig,
): string | null {
  if (!categoryId || isUncategorizedPaletteId(config, categoryId)) {
    return null;
  }
  const vertex = graph.vertexes[categoryId];
  if (!vertex) {
    return null;
  }
  if (vertex.P?.key === config.rootKeys.key) {
    return null;
  }
  return categoryId;
}
