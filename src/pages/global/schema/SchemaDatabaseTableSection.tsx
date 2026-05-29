import { For, Show } from "solid-js";
import { As } from "~/components/As";
import type {
  SchemaDatabaseInfo,
  SchemaJobStatusRow,
  SchemaOperation,
} from "~/server/schema/schemaOperationsManagement";
import {
  hasAnyJobOutput,
  hasJobOutput,
  SchemaJobOutputPopover,
  type SchemaJobOutputTab,
} from "~/pages/global/schema/SchemaJobOutputPopover";
import { SchemaDatabaseLinksMenu } from "~/pages/global/schema/SchemaDatabaseLinksMenu";
import {
  importSyncAllLabel,
  operationAllLabel,
  operationLabel,
  type SchemaDatabaseAdminLink,
  schemaOpButtonCss,
  statusLabel,
} from "~/pages/global/schema/schemaOperationsUtils";

const TABLE_GRID =
  "2fr 1fr 1fr 1.5fr minmax(280px, 3fr)";

function statusBadgeCss(
  args: any,
  status: string,
  showOutputHint: boolean,
) {
  const isErr =
    status === "failed" ||
    status === "enqueue_failed" ||
    status === "complete_with_error";
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
  ${showOutputHint ? "text-decoration: underline dotted; text-underline-offset: 2px; cursor: pointer;" : ""}
}\`;`;
}

function buildOutputTabs(
  databaseName: string,
  row: () => SchemaJobStatusRow | undefined,
  jobOutputByDb: () => Map<
    string,
    {
      import?: SchemaJobStatusRow;
      sync?: SchemaJobStatusRow;
      migrate?: SchemaJobStatusRow;
    }
  >,
): SchemaJobOutputTab[] {
  const out = jobOutputByDb().get(databaseName);
  const tabs: SchemaJobOutputTab[] = [];
  if (out?.import) {
    tabs.push({ label: "Import", row: out.import });
  }
  if (out?.sync) {
    tabs.push({ label: "Sync", row: out.sync });
  }
  if (out?.migrate) {
    tabs.push({ label: "Migrate", row: out.migrate });
  }
  if (tabs.length === 0) {
    const single = row();
    if (single) {
      tabs.push({
        label: operationLabel(single.operation),
        row: single,
      });
    }
  }
  return tabs;
}

function JobStatusCell(props: {
  databaseName: string;
  status: string;
  row: () => SchemaJobStatusRow | undefined;
  jobOutputByDb: () => Map<
    string,
    {
      import?: SchemaJobStatusRow;
      sync?: SchemaJobStatusRow;
      migrate?: SchemaJobStatusRow;
    }
  >;
}) {
  const outputTabs = () =>
    buildOutputTabs(props.databaseName, props.row, props.jobOutputByDb);
  const hasErrorOutput = () =>
    outputTabs().some((tab) => Boolean(tab.row.error || tab.row.errorDetails));
  const displayStatus = () =>
    props.status === "success" && hasErrorOutput()
      ? "complete_with_error"
      : props.status;

  const badge = (
    <As
      as="span"
      css={(args) =>
        statusBadgeCss(args, displayStatus(), hasAnyJobOutput(outputTabs()))
      }
    >
      {statusLabel(displayStatus())}
    </As>
  );

  return (
    <Show when={hasAnyJobOutput(outputTabs())} fallback={badge}>
      <SchemaJobOutputPopover tabs={outputTabs}>{badge}</SchemaJobOutputPopover>
    </Show>
  );
}

export interface SchemaDatabaseTableSectionProps {
  title: string;
  description: string;
  databases: SchemaDatabaseInfo[];
  operations: readonly SchemaOperation[];
  busy: boolean;
  activeOperation: SchemaOperation | null;
  pipelineStep: () => "import" | "sync" | null;
  statusByDb: () => Map<string, SchemaJobStatusRow>;
  jobOutputByDb: () => Map<
    string,
    {
      import?: SchemaJobStatusRow;
      sync?: SchemaJobStatusRow;
      migrate?: SchemaJobStatusRow;
    }
  >;
  onRunAll: (operation: SchemaOperation) => void;
  onRunOne: (operation: SchemaOperation, databaseName: string) => void;
  onRunAllImportThenSync?: () => void;
  onRunOneImportThenSync?: (databaseName: string) => void;
  getSignInUrl?: (databaseName: string) => string;
  /** Admin page shortcuts (app databases); opens via auto sign-in + redirect. */
  adminPageLinks?: readonly SchemaDatabaseAdminLink[];
  getAdminPageUrl?: (databaseName: string, path: string) => string;
}

export function SchemaDatabaseTableSection(props: SchemaDatabaseTableSectionProps) {
  const rowDisabled = (db: SchemaDatabaseInfo) =>
    props.busy || db.currentStatus !== "online";

  return (
    <As
      as="section"
      css={`return \`._id { margin-bottom: 2.5rem; }\`;`}
    >
      <As
        as="div"
        css={`return \`._id {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1rem;
}\`;`}
      >
        <As as="div">
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
          css={`return \`._id { display: flex; flex-wrap: wrap; gap: 0.5rem; }\`;`}
        >
          <For each={props.operations}>
            {(op) => (
              <As
                as="button"
                type="button"
                disabled={props.busy}
                onClick={() => props.onRunAll(op)}
                css={schemaOpButtonCss("primary")}
              >
                {operationAllLabel(
                  op,
                  props.busy,
                  props.activeOperation,
                  props.pipelineStep,
                )}
              </As>
            )}
          </For>
          <Show when={props.onRunAllImportThenSync}>
            <As
              as="button"
              type="button"
              disabled={props.busy}
              onClick={() => props.onRunAllImportThenSync?.()}
              css={schemaOpButtonCss("info")}
            >
              {importSyncAllLabel(props.busy, props.pipelineStep)}
            </As>
          </Show>
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
          as="div"
          css={`return \`._id {
  border: 1px solid \${args.theme.var.color.border};
  border-radius: 0.5rem;
  overflow: hidden;
}\`;`}
        >
          <As
            as="motionFragment"
            css={`return \`._id {
  display: grid;
  grid-template-columns: ${TABLE_GRID};
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
              const signInUrl = props.getSignInUrl?.(name);

              return (
                <As
                  as="motionFragment"
                  css={`return \`._id {
  display: grid;
  grid-template-columns: ${TABLE_GRID};
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
                      <JobStatusCell
                        databaseName={name}
                        status={jobStatus()!}
                        row={jobRow}
                        jobOutputByDb={props.jobOutputByDb}
                      />
                    </Show>
                    <Show when={jobRow()?.error}>
                      <As
                        as="p"
                        css={`return \`._id {
  margin: 0.25rem 0 0 0;
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
                    as="div"
                    css={`return \`._id {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
  align-items: center;
}\`;`}
                  >
                    <Show when={signInUrl}>
                      <As
                        as="a"
                        href={signInUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        title={signInUrl}
                        css={schemaOpButtonCss("link", "sm")}
                      >
                        Sign in
                      </As>
                    </Show>
                    <Show
                      when={
                        props.adminPageLinks &&
                        props.adminPageLinks.length > 0 &&
                        props.getAdminPageUrl
                      }
                    >
                      <SchemaDatabaseLinksMenu
                        databaseName={name}
                        links={props.adminPageLinks!}
                        getPageUrl={props.getAdminPageUrl!}
                        disabled={rowDisabled(database)}
                      />
                    </Show>
                    <Show when={props.onRunOneImportThenSync}>
                      <As
                        as="button"
                        type="button"
                        disabled={rowDisabled(database)}
                        onClick={() => props.onRunOneImportThenSync?.(name)}
                        title="Import from files, then sync to shops"
                        css={schemaOpButtonCss("info", "sm")}
                      >
                        Import & Sync
                      </As>
                    </Show>
                    <For each={props.operations}>
                      {(op) => (
                        <As
                          as="button"
                          type="button"
                          disabled={rowDisabled(database)}
                          onClick={() => props.onRunOne(op, name)}
                          css={schemaOpButtonCss("ghost", "sm")}
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
