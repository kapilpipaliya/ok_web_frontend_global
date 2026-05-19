import { For, Show } from "solid-js";
import { As } from "~/components/As";
import { API } from "~/lib/api/endpoints";
import type {
  SchemaDatabaseInfo,
  SchemaJobStatusRow,
  SchemaOperation,
} from "~/server/schema/schemaOperationsManagement";
import {
  hasJobOutput,
  SchemaJobOutputPopover,
} from "~/pages/global/schema/SchemaJobOutputPopover";

function statusLabel(status: string) {
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

export function getAppSubdomainSignInUrl(subdomainKey: string) {
  return `${API.auth.prepareAutoSignInUrl}?subdomain=${encodeURIComponent(subdomainKey)}`;
}

/** Shop DB host is the Neo4j database name (e.g. shopattendra…). */
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

function operationLabel(op: SchemaOperation) {
  switch (op) {
    case "export":
      return "Export";
    case "import":
      return "Import";
    case "sync":
      return "Sync";
  }
}

function statusBadgeCss(
  args: { theme: { var: { color: Record<string, string> } } },
  status: string,
  showOutputHint: boolean,
) {
  const isErr = status === "failed" || status === "enqueue_failed";
  const isOk = status === "success";
  const isRun = status === "running";
  let bg = args.theme.var.color.background_light_300;
  let color = args.theme.var.color.text;
  if (isErr) {
    bg = args.theme.var.color.error_light_900;
    color = args.theme.var.color.error_dark_300;
  } else if (isOk) {
    bg = args.theme.var.color.success_light_900;
    color = args.theme.var.color.success_dark_300;
  } else if (isRun) {
    bg = args.theme.var.color.info_light_900;
    color = args.theme.var.color.info_dark_300;
  }
  return `return \`._id {
  display: inline-block;
  padding: 0.2rem 0.5rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  background: ${bg};
  color: ${color};
  ${showOutputHint ? "text-decoration: underline dotted; text-underline-offset: 2px;" : ""}
}\`;`;
}

function SchemaJobStatusBadge(props: {
  status: string;
  row: () => SchemaJobStatusRow | undefined;
}) {
  return (
    <SchemaJobOutputPopover row={props.row}>
      <As
        as="span"
        css={(args) =>
          statusBadgeCss(args, props.status, hasJobOutput(props.row()))
        }
      >
        {statusLabel(props.status)}
      </As>
    </SchemaJobOutputPopover>
  );
}

export interface SchemaDatabaseTableSectionProps {
  title: string;
  description: string;
  databases: SchemaDatabaseInfo[];
  operations: readonly SchemaOperation[];
  busy: boolean;
  activeOperation: SchemaOperation | null;
  statusByDb: () => Map<string, SchemaJobStatusRow>;
  onRunAll: (operation: SchemaOperation) => void;
  onRunOne: (operation: SchemaOperation, databaseName: string) => void;
  /** Builds sign-in URL per database row; omit to hide Sign in. */
  getSignInUrl?: (databaseName: string) => string;
}

export function SchemaDatabaseTableSection(props: SchemaDatabaseTableSectionProps) {
  return (
    <As
      as="motionFragment"
      css={`return \`._id {
  margin-bottom: 2.5rem;
}\`;`}
    >
      <As
        as="motionFragment"
        css={`return \`._id {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1rem;
}\`;`}
      >
        <As as="motionFragment">
          <As
            as="h2"
            css={`return \`._id {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0 0 0.35rem 0;
}\`;`}
          >
            {props.title} ({props.databases.length})
          </As>
          <As
            as="p"
            css={`return \`._id {
  margin: 0;
  font-size: 0.875rem;
  color: \${args.theme.var.color.muted};
  max-width: 40rem;
  line-height: 1.45;
}\`;`}
          >
            {props.description}
          </As>
        </As>
        <As
          as="motionFragment"
          css={`return \`._id {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}\`;`}
        >
          <For each={props.operations}>
            {(op) => (
              <As
                as="button"
                type="button"
                disabled={props.busy}
                onClick={() => props.onRunAll(op)}
                css={`return \`._id {
  padding: 0.5rem 0.85rem;
  border-radius: 0.375rem;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  border: none;
  background: \${args.theme.var.color.primary};
  color: \${args.theme.var.color.primary_text};
}
._id:disabled { opacity: 0.55; cursor: wait; }\`;`}
              >
                {props.busy && props.activeOperation === op
                  ? `${operationLabel(op)} all…`
                  : `${operationLabel(op)} all`}
              </As>
            )}
          </For>
        </As>
      </As>

      <Show
        when={props.databases.length > 0}
        fallback={
          <As
            as="p"
            css={`return \`._id {
  color: \${args.theme.var.color.muted};
  padding: 1.5rem;
  border: 1px solid \${args.theme.var.color.border};
  border-radius: 0.5rem;
}\`;`}
          >
            No databases in this group
          </As>
        }
      >
        <As
          as="motionFragment"
          css={`return \`._id {
  border: 1px solid \${args.theme.var.color.border};
  border-radius: 0.5rem;
  overflow: hidden;
}\`;`}
        >
          <As
            as="div"
            css={`return \`._id {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1.5fr minmax(240px, 2.5fr);
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  background: \${args.theme.var.color.background_light_200};
  color: \${args.theme.var.color.muted};
}\`;`}
          >
            <As as="span">Database</As>
            <As as="span">DB status</As>
            <As as="span">Job</As>
            <As as="span">Operation status</As>
            <As as="span">Actions</As>
          </As>
          <For each={props.databases}>
            {(database) => {
              const name = database.name;
              const jobRow = () => props.statusByDb().get(name);
              const jobStatus = () => jobRow()?.status;
              return (
                <As
                  as="motionFragment"
                  css={`return \`._id {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1.5fr minmax(240px, 2.5fr);
  gap: 0.75rem;
  padding: 0.875rem 1rem;
  align-items: center;
  border-top: 1px solid \${args.theme.var.color.border};
  font-size: 0.875rem;
  background: \${args.theme.var.color.background};
}\`;`}
                >
                  <As
                    as="span"
                    css={`return \`._id {
  font-family: monospace;
  font-weight: 500;
  color: \${args.theme.var.color.primary};
  word-break: break-all;
}\`;`}
                  >
                    {name}
                  </As>
                  <As as="span">{database.currentStatus ?? "—"}</As>
                  <As as="span">
                    {jobRow()?.operation
                      ? operationLabel(jobRow()!.operation)
                      : "—"}
                  </As>
                  <As as="span">
                    <Show when={jobStatus()} fallback={<span>—</span>}>
                      <SchemaJobStatusBadge
                        status={jobStatus()!}
                        row={jobRow}
                      />
                    </Show>
                    <Show when={jobRow()?.error}>
                      <As
                        as="motionFragment"
                        css={`return \`._id {
  margin-top: 0.25rem;
  font-size: 0.7rem;
  color: \${args.theme.var.color.error};
  word-break: break-word;
}\`;`}
                      >
                        {jobRow()?.error}
                      </As>
                    </Show>
                  </As>
                  <As
                    as="motionFragment"
                    css={`return \`._id {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
}\`;`}
                  >
                    <Show when={props.getSignInUrl}>
                      <As
                        as="a"
                        href={props.getSignInUrl!(name)}
                        target="_blank"
                        rel="noopener noreferrer"
                        title={props.getSignInUrl!(name)}
                        css={`return \`._id {
  padding: 0.35rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.7rem;
  font-weight: 600;
  cursor: pointer;
  border: 1px solid \${args.theme.var.color.primary};
  background: \${args.theme.var.color.primary};
  color: \${args.theme.var.color.primary_text};
  text-decoration: none;
  display: inline-flex;
  align-items: center;
}
._id:hover {
  background: \${args.theme.var.color.primary_dark_200};
}\`;`}
                      >
                        Sign in
                      </As>
                    </Show>
                    <For each={props.operations}>
                      {(op) => (
                        <As
                          as="button"
                          type="button"
                          disabled={
                            props.busy || database.currentStatus !== "online"
                          }
                          onClick={() => props.onRunOne(op, name)}
                          css={`return \`._id {
  padding: 0.35rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.7rem;
  font-weight: 600;
  cursor: pointer;
  border: 1px solid \${args.theme.var.color.border};
  background: \${args.theme.var.color.background_light_100};
  color: \${args.theme.var.color.text};
}
._id:disabled { opacity: 0.45; cursor: not-allowed; }\`;`}
                        >
                          {operationLabel(op)}
                        </As>
                      )}
                    </For>
                  </As>
                </As>
              );
            }}
          </For>
        </As>
      </Show>
    </As>
  );
}
