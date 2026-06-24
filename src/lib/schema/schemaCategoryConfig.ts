export type SchemaContentLabel =
  | "Component"
  | "Page"
  | "Theme"
  | "Function"
  | "EmailTemplate";

export interface SchemaCategoryConfig {
  contentLabel: SchemaContentLabel;
  categoryLabel: string;
  edgeType: string;
}

export const SCHEMA_CATEGORY_CONFIGS: SchemaCategoryConfig[] = [
  {
    contentLabel: "Component",
    categoryLabel: "ComponentCategory",
    edgeType: "ParentComponentCategory",
  },
  {
    contentLabel: "Page",
    categoryLabel: "PageCategory",
    edgeType: "ParentPageCategory",
  },
  {
    contentLabel: "Theme",
    categoryLabel: "ThemeCategory",
    edgeType: "ParentThemeCategory",
  },
  {
    contentLabel: "Function",
    categoryLabel: "FunctionCategory",
    edgeType: "ParentFunctionCategory",
  },
  {
    contentLabel: "EmailTemplate",
    categoryLabel: "EmailTemplateCategory",
    edgeType: "ParentEmailTemplateCategory",
  },
];

export function getSchemaCategoryConfig(
  contentLabel: SchemaContentLabel,
): SchemaCategoryConfig | undefined {
  return SCHEMA_CATEGORY_CONFIGS.find(
    (config) => config.contentLabel === contentLabel,
  );
}
