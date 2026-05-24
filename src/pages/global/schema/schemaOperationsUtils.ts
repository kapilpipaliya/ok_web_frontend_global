import { API } from "~/lib/api/endpoints";
import type {
  SchemaJobStatusRow,
  SchemaOperation,
} from "~/server/schema/schemaOperationsManagement";

export const TERMINAL_STATUSES = new Set([
  "success",
  "failed",
  "enqueue_failed",
]);

export const APP_OPERATIONS = ["import", "export", "sync"] as const;
export const SHOP_OPERATIONS = ["import", "export"] as const;

export function isTerminal(status: string) {
  return TERMINAL_STATUSES.has(status);
}

export function operationLabel(op: SchemaOperation) {
  switch (op) {
    case "export":
      return "Export";
    case "import":
      return "Import";
    case "sync":
      return "Sync";
  }
}

export function statusLabel(status: string) {
  switch (status) {
    case "queued":
      return "Queued";
    case "running":
      return "Running";
    case "success":
      return "Complete";
    case "failed":
      return "Failed";
    case "enqueue_failed":
      return "Queue failed";
    default:
      return status;
  }
}

export function countFailures(rows: SchemaJobStatusRow[]) {
  return rows.filter(
    (r) => r.status === "failed" || r.status === "enqueue_failed",
  ).length;
}

export function succeededDatabaseNames(rows: SchemaJobStatusRow[]) {
  return rows.filter((r) => r.status === "success").map((r) => r.databaseName);
}

export function getAppSubdomainSignInUrl(subdomainKey: string) {
  return `${API.auth.prepareAutoSignInUrl}?subdomain=${encodeURIComponent(subdomainKey)}`;
}

/** Common Shopify admin pages opened from system Schema Operations (super admin). */
export const SCHEMA_APP_DATABASE_ADMIN_LINKS = [
  { label: "Shopify Shops", path: "/ShopifyShops" },
  { label: "Support conversation", path: "/ShopifySupportConversation" },
  { label: "Support tickets", path: "/ShopifySupportTickets" },
  { label: "Dashboard", path: "/Dashboard" },
] as const;

export type SchemaDatabaseAdminLink =
  (typeof SCHEMA_APP_DATABASE_ADMIN_LINKS)[number];

/**
 * Auto sign-in on an app subdomain, then redirect to an admin page path.
 */
export function getAppSubdomainAdminPageUrl(
  subdomainKey: string,
  path: string,
) {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  const params = new URLSearchParams({
    subdomain: subdomainKey,
    redirect: normalized,
  });
  return `${API.auth.prepareAutoSignInUrl}?${params.toString()}`;
}

export function getShopDatabaseSignInUrl(databaseName: string) {
  const path = "/auth/signin";
  const db = String(databaseName ?? "").trim();
  if (db === "") {
    return path;
  }
  if (typeof window === "undefined") {
    return `https://${db}.decodecommerce.com${path}`;
  }
  const { protocol, hostname, port } = window.location;
  const portSuffix = port ? `:${port}` : "";
  if (hostname === "localhost" || hostname.endsWith(".localhost")) {
    return `${protocol}//${db}.localhost${portSuffix}${path}`;
  }
  return `${protocol}//${db}.decodecommerce.com${portSuffix}${path}`;
}

export type ButtonVariant = "primary" | "secondary" | "ghost" | "info" | "link";

export function schemaOpButtonCss(
  variant: ButtonVariant,
  size: "sm" | "md" = "md",
) {
  const pad = size === "sm" ? "0.35rem 0.5rem" : "0.5rem 0.85rem";
  const fontSize = size === "sm" ? "0.7rem" : "0.8rem";
  const base = `padding: ${pad}; border-radius: 0.375rem; font-size: ${fontSize}; font-weight: 600; cursor: pointer; transition: opacity 0.15s ease;`;
  const disabled = `._id:disabled { opacity: 0.45; cursor: not-allowed; }`;

  switch (variant) {
    case "primary":
      return `return \`._id { ${base} border: none; background: \${args.theme.var.color.primary}; color: \${args.theme.var.color.primary_text}; } ${disabled}\`;`;
    case "info":
      return `return \`._id { ${base} border: none; background: \${args.theme.var.color.info}; color: \${args.theme.var.color.info_text}; } ${disabled}\`;`;
    case "ghost":
      return `return \`._id { ${base} border: 1px solid \${args.theme.var.color.border}; background: \${args.theme.var.color.background_light_100}; color: \${args.theme.var.color.text}; } ${disabled}\`;`;
    case "link":
      return `return \`._id { ${base} border: 1px solid \${args.theme.var.color.primary}; background: \${args.theme.var.color.primary}; color: \${args.theme.var.color.primary_text}; text-decoration: none; display: inline-flex; align-items: center; } ._id:hover { background: \${args.theme.var.color.primary_dark_200}; } ${disabled}\`;`;
    case "secondary":
      return `return \`._id { ${base} border: none; background: \${args.theme.var.color.background_dark_300}; color: \${args.theme.var.color.background_dark_300_text}; } ${disabled}\`;`;
  }
}

export function importSyncAllLabel(
  busy: boolean,
  pipelineStep: () => "import" | "sync" | null,
) {
  if (!busy) {
    return "Import & Sync all";
  }
  const step = pipelineStep();
  return step === "import"
    ? "Import & Sync (import)…"
    : "Import & Sync (sync)…";
}

export function operationAllLabel(
  op: SchemaOperation,
  busy: boolean,
  activeOperation: SchemaOperation | null,
  pipelineStep: () => "import" | "sync" | null,
) {
  if (!busy) {
    return `${operationLabel(op)} all`;
  }
  const step = pipelineStep();
  if (step === "import") {
    return "Import & Sync (import)…";
  }
  if (step === "sync") {
    return "Import & Sync (sync)…";
  }
  if (activeOperation === op) {
    return `${operationLabel(op)} all…`;
  }
  return `${operationLabel(op)} all`;
}
