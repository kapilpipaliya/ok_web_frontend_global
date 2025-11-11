import { createAsync } from "@solidjs/router";
import { createSignal, Show, For } from "solid-js";
import { useToast } from "~/components/styled/modal/Toast";
import { As } from "~/components/As";
import {
  getBackupStatus,
  triggerManualBackup,
} from "~/server/redis/redisManagement";
import {
  listBackups,
  deleteBackup,
  downloadBackup,
  createBackup,
  restoreBackup,
  getAllSubdomains,
} from "~/server/backup/backupManagement";

export function BackupManagement() {
  const { showSuccessToast, showErrorToast } = useToast();
  const [refreshKey, setRefreshKey] = createSignal(0);
  const [confirmAction, setConfirmAction] = createSignal<string | null>(null);
  const [restoreModal, setRestoreModal] = createSignal<{
    filename: string;
    sourceDatabaseName: string;
    key: string;
  } | null>(null);
  const [targetDatabase, setTargetDatabase] = createSignal<string>("");
  const [restoreConfirmed, setRestoreConfirmed] = createSignal(false);
  const [isRestoring, setIsRestoring] = createSignal(false);

  // Feature: Search/Filter
  const [searchQuery, setSearchQuery] = createSignal("");
  const [filterDatabase, setFilterDatabase] = createSignal("");

  // Feature: Loading States
  const [creatingBackup, setCreatingBackup] = createSignal<string | null>(null);
  const [downloadingBackup, setDownloadingBackup] = createSignal<string | null>(null);

  // Feature: Bulk Operations
  const [selectedBackups, setSelectedBackups] = createSignal<Set<string>>(new Set());
  const [bulkActionInProgress, setBulkActionInProgress] = createSignal(false);

  // Feature: Comparison Tool
  const [comparisonMode, setComparisonMode] = createSignal(false);
  const [selectedForComparison, setSelectedForComparison] = createSignal<string[]>([]);

  const backupStatus = createAsync(
    async () => {
      refreshKey();
      return await getBackupStatus();
    },
    { deferStream: true },
  );

  const cloudBackups = createAsync(
    async () => {
      refreshKey();
      return await listBackups();
    },
    { deferStream: true },
  );

  const subdomains = createAsync(
    async () => {
      refreshKey();
      return await getAllSubdomains();
    },
    { deferStream: true },
  );

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
    showSuccessToast("Refreshed successfully");
  };

  const handleTriggerManualBackup = async () => {
    const result = await triggerManualBackup();
    if (result.success) {
      showSuccessToast(result.message);
      setRefreshKey((prev) => prev + 1);
    } else {
      showErrorToast(result.error || "Failed to trigger backup");
    }
  };

  const handleCreateBackup = async (databaseName?: string) => {
    if (!databaseName) return;
    setCreatingBackup(databaseName);
    try {
      const result = await createBackup(databaseName);
      if (result.success) {
        showSuccessToast(`Backup created successfully for ${databaseName}`);
        setRefreshKey((prev) => prev + 1);
      } else {
        showErrorToast(result.error || "Failed to create backup");
      }
    } finally {
      setCreatingBackup(null);
    }
  };

  const handleDeleteBackup = async (filename: string, databaseName?: string, key?: string) => {
    const result = await deleteBackup(filename, databaseName, key);
    if (result.success) {
      showSuccessToast("Backup deleted successfully");
      setRefreshKey((prev) => prev + 1);
    } else {
      showErrorToast(result.error || "Failed to delete backup");
    }
    setConfirmAction(null);
  };

  const handleDownloadBackup = async (filename: string, databaseName?: string) => {
    const backupId = `${databaseName}-${filename}`;
    setDownloadingBackup(backupId);
    try {
      const result = await downloadBackup(filename, databaseName);
      if (result.success) {
        showSuccessToast("Backup downloaded successfully");
      } else {
        showErrorToast(result.error || "Failed to download backup");
      }
    } finally {
      setDownloadingBackup(null);
    }
  };

  const handleRestoreBackup = async () => {
    const modal = restoreModal();
    if (!modal) return;

    if (!restoreConfirmed()) {
      showErrorToast("Please confirm that you understand this will delete all data");
      return;
    }

    const target = targetDatabase() || modal.sourceDatabaseName;

    setIsRestoring(true);
    try {
      const result = await restoreBackup(
        modal.filename,
        modal.sourceDatabaseName,
        target,
        true
      );

      if (result.success) {
        showSuccessToast(`Database restored successfully to ${target}`);
        setRestoreModal(null);
        setTargetDatabase("");
        setRestoreConfirmed(false);
        setRefreshKey((prev) => prev + 1);
      } else {
        showErrorToast(result.error || "Failed to restore backup");
      }
    } finally {
      setIsRestoring(false);
    }
  };

  const formatTimestamp = (timestamp?: number) => {
    if (!timestamp) return "N/A";
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return `${seconds}s ago`;
  };

  return (
    <As
      as="div"
      css={`return \`._id {
  padding: 2rem;
}\`;`}
    >
      {/* Header */}
      <As
        as="div"
        css={`return \`._id {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}\`;`}
      >
        <As
          as="h1"
          css={`return \`._id {
  font-size: 1.875rem;
  font-weight: 600;
  margin: 0;
}\`;`}
        >
          Backup Management
        </As>
        <As
          as="button"
          onClick={handleRefresh}
          css={`return \`._id {
  padding: 0.625rem 1.25rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  border: none;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s;
  background: \${args.theme.var.color.background_dark_300};
  color: \${args.theme.var.color.background_dark_300_text};
}
._id:hover {
  background: \${args.theme.var.color.background_dark_400};
}\`;`}
        >
          {"🔄 Refresh"}
        </As>
      </As>

      {/* Backup System Section */}
      <Show when={backupStatus()?.success}>
        {() => {
          const backup = backupStatus()!.data;
          return (
            <As
              as="div"
              css={`return \`._id {
  margin-bottom: 2rem;
}\`;`}
            >
              <As
                as="div"
                css={`return \`._id {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}\`;`}
              >
                <As
                  as="h2"
                  css={`return \`._id {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}\`;`}
                >
                  {"💾 Backup Status"}
                  <As
                    as="span"
                    css={`return \`._id {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
  background: ${backup.enabled ? "${args.theme.var.color.success_light_900}" : "${args.theme.var.color.error_light_900}"};
  color: ${backup.enabled ? "${args.theme.var.color.success_dark_300}" : "${args.theme.var.color.error_dark_300}"};
}\`;`}
                  >
                    {backup.enabled ? "Enabled" : "Disabled"}
                  </As>
                </As>
                <Show when={backup.enabled}>
                  <As
                    as="button"
                    onClick={handleTriggerManualBackup}
                    css={`return \`._id {
  padding: 0.625rem 1.25rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  border: none;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s;
  background: \${args.theme.var.color.primary};
  color: \${args.theme.var.color.primary_text};
}
._id:hover {
  background: \${args.theme.var.color.primary_dark_200};
}\`;`}
                  >
                    {"▶️ Trigger Manual Backup"}
                  </As>
                </Show>
              </As>

              <As
                as="div"
                css={`return \`._id {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
}\`;`}
              >
                {/* Last Successful Backup */}
                <As
                  as="div"
                  css={`return \`._id {
  padding: 1.5rem;
  border-radius: 0.5rem;
  border: 1px solid \${args.theme.var.color.border};
  background: \${args.theme.var.color.background};
}\`;`}
                >
                  <As
                    as="h3"
                    css={`return \`._id {
  font-size: 0.875rem;
  font-weight: 500;
  color: \${args.theme.var.color.muted};
  margin: 0 0 0.5rem 0;
  text-transform: uppercase;
}\`;`}
                  >
                    Last Successful
                  </As>
                  <Show
                    when={backup.lastSuccessful}
                    fallback={
                      <As
                        as="p"
                        css={`return \`._id {
  font-size: 0.875rem;
  color: \${args.theme.var.color.muted};
  margin: 0;
}\`;`}
                      >
                        No backups yet
                      </As>
                    }
                  >
                    <As
                      as="p"
                      css={`return \`._id {
  font-size: 1rem;
  font-weight: 600;
  margin: 0;
  color: \${args.theme.var.color.success};
}\`;`}
                    >
                      {formatTimestamp(backup.lastSuccessful?.timestamp)}
                    </As>
                    <Show when={backup.lastSuccessful?.duration}>
                      <As
                        as="p"
                        css={`return \`._id {
  font-size: 0.75rem;
  color: \${args.theme.var.color.muted};
  margin: 0.25rem 0 0 0;
}\`;`}
                      >
                        Duration: {Math.round((backup.lastSuccessful?.duration || 0) / 1000)}s
                      </As>
                    </Show>
                  </Show>
                </As>

                {/* Last Failed Backup */}
                <Show when={backup.lastFailed}>
                  <As
                    as="div"
                    css={`return \`._id {
  padding: 1.5rem;
  border-radius: 0.5rem;
  border: 1px solid \${args.theme.var.color.error};
  background: \${args.theme.var.color.error_light_900};
}\`;`}
                  >
                    <As
                      as="h3"
                      css={`return \`._id {
  font-size: 0.875rem;
  font-weight: 500;
  color: \${args.theme.var.color.error_dark_300};
  margin: 0 0 0.5rem 0;
  text-transform: uppercase;
}\`;`}
                    >
                      Last Failed
                    </As>
                    <As
                      as="p"
                      css={`return \`._id {
  font-size: 1rem;
  font-weight: 600;
  margin: 0;
  color: \${args.theme.var.color.error_dark_300};
}\`;`}
                    >
                      {formatTimestamp(backup.lastFailed?.timestamp)}
                    </As>
                    <As
                      as="p"
                      css={`return \`._id {
  font-size: 0.75rem;
  color: \${args.theme.var.color.error_dark_300};
  margin: 0.25rem 0 0 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}\`;`}
                      title={backup.lastFailed?.error}
                    >
                      {backup.lastFailed?.error}
                    </As>
                  </As>
                </Show>

                {/* Backup Statistics */}
                <As
                  as="div"
                  css={`return \`._id {
  padding: 1.5rem;
  border-radius: 0.5rem;
  border: 1px solid \${args.theme.var.color.border};
  background: \${args.theme.var.color.background};
}\`;`}
                >
                  <As
                    as="h3"
                    css={`return \`._id {
  font-size: 0.875rem;
  font-weight: 500;
  color: \${args.theme.var.color.muted};
  margin: 0 0 0.5rem 0;
  text-transform: uppercase;
}\`;`}
                  >
                    Total Completed
                  </As>
                  <As
                    as="p"
                    css={`return \`._id {
  font-size: 1.875rem;
  font-weight: 600;
  margin: 0;
}\`;`}
                  >
                    {backup.stats.completed}
                  </As>
                </As>

                <As
                  as="div"
                  css={`return \`._id {
  padding: 1.5rem;
  border-radius: 0.5rem;
  border: 1px solid \${args.theme.var.color.border};
  background: \${args.theme.var.color.background};
}\`;`}
                >
                  <As
                    as="h3"
                    css={`return \`._id {
  font-size: 0.875rem;
  font-weight: 500;
  color: \${args.theme.var.color.muted};
  margin: 0 0 0.5rem 0;
  text-transform: uppercase;
}\`;`}
                  >
                    Total Failed
                  </As>
                  <As
                    as="p"
                    css={`return \`._id {
  font-size: 1.875rem;
  font-weight: 600;
  margin: 0;
  color: ${backup.stats.failed > 0 ? "${args.theme.var.color.error}" : "inherit"};
}\`;`}
                  >
                    {backup.stats.failed}
                  </As>
                </As>
              </As>

              {/* Backup Configuration Info */}
              <As
                as="div"
                css={`return \`._id {
  padding: 1rem 1.5rem;
  border-radius: 0.5rem;
  background: \${args.theme.var.color.background_light_200};
  display: flex;
  gap: 2rem;
  align-items: center;
  flex-wrap: wrap;
  font-size: 0.875rem;
}\`;`}
              >
                <As
                  as="div"
                  css={`return \`._id {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}\`;`}
                >
                  <As
                    as="span"
                    css={`return \`._id {
  font-weight: 500;
  color: \${args.theme.var.color.muted};
}\`;`}
                  >
                    Schedule:
                  </As>
                  <As
                    as="span"
                    css={`return \`._id {
  font-family: monospace;
  padding: 0.25rem 0.5rem;
  background: \${args.theme.var.color.background};
  border-radius: 0.25rem;
}\`;`}
                  >
                    {backup.schedule}
                  </As>
                </As>
                <As
                  as="div"
                  css={`return \`._id {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}\`;`}
                >
                  <As
                    as="span"
                    css={`return \`._id {
  font-weight: 500;
  color: \${args.theme.var.color.muted};
}\`;`}
                  >
                    Storage:
                  </As>
                  <As
                    as="span"
                    css={`return \`._id {
  font-family: monospace;
  padding: 0.25rem 0.5rem;
  background: \${args.theme.var.color.background};
  border-radius: 0.25rem;
  text-transform: uppercase;
}\`;`}
                  >
                    {backup.storageType}
                  </As>
                </As>
                <Show when={backup.stats.active > 0}>
                  <As
                    as="div"
                    css={`return \`._id {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  color: \${args.theme.var.color.info};
}\`;`}
                  >
                    <As as="span">⏳</As>
                    <As as="span" css={`return \`._id { font-weight: 500; }\`;`}>
                      Backup in progress...
                    </As>
                  </As>
                </Show>
              </As>
            </As>
          );
        }}
      </Show>

      {/* Subdomains / Databases Section */}
      <Show when={subdomains()?.success}>
        {() => {
          const databases = subdomains()!.data;
          return (
            <As
              as="div"
              css={`return \`._id {
  margin-bottom: 2rem;
}\`;`}
            >
              <As
                as="h2"
                css={`return \`._id {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0 0 1rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}\`;`}
              >
                {`🗄️ Databases / Subdomains (${databases.length})`}
              </As>

              <Show
                when={databases.length > 0}
                fallback={
                  <As
                    as="div"
                    css={`return \`._id {
  padding: 3rem;
  text-align: center;
  color: \${args.theme.var.color.muted};
  border: 1px solid \${args.theme.var.color.border};
  border-radius: 0.5rem;
}\`;`}
                  >
                    No databases found
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
                  {/* Table Header */}
                  <As
                    as="div"
                    css={`return \`._id {
  background: \${args.theme.var.color.background_light_200};
  padding: 1rem 1.5rem;
  font-weight: 600;
  font-size: 0.875rem;
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 180px;
  gap: 1rem;
}\`;`}
                  >
                    <As as="div">Database Name</As>
                    <As as="div">Status</As>
                    <As as="div">Role</As>
                    <As as="div">Actions</As>
                  </As>

                  {/* Table Rows */}
                  <For each={databases}>
                    {(database) => (
                      <As
                        as="div"
                        css={`return \`._id {
  padding: 1rem 1.5rem;
  border-top: 1px solid \${args.theme.var.color.border};
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 180px;
  gap: 1rem;
  align-items: center;
  background: \${args.theme.var.color.background};
  transition: background 0.2s;
}
._id:hover {
  background: \${args.theme.var.color.background_light_200};
}\`;`}
                      >
                        <As
                          as="div"
                          css={`return \`._id {
  font-family: monospace;
  font-size: 0.875rem;
  font-weight: 500;
  color: \${args.theme.var.color.primary};
}\`;`}
                        >
                          {database.name}
                        </As>
                        <As as="div">
                          <As
                            as="span"
                            css={`return \`._id {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
  background: ${database.currentStatus === 'online' ? "${args.theme.var.color.success_light_900}" : "${args.theme.var.color.error_light_900}"};
  color: ${database.currentStatus === 'online' ? "${args.theme.var.color.success_dark_300}" : "${args.theme.var.color.error_dark_300}"};
}\`;`}
                          >
                            {database.currentStatus}
                          </As>
                        </As>
                        <As
                          as="div"
                          css={`return \`._id {
  font-size: 0.875rem;
  color: \${args.theme.var.color.muted};
}\`;`}
                        >
                          {database.role}
                        </As>
                        <As as="div">
                          <As
                            as="button"
                            onClick={() => handleCreateBackup(database.name)}
                            disabled={database.currentStatus !== 'online'}
                            css={`return \`._id {
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-size: 0.75rem;
  font-weight: 500;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
  background: \${args.theme.var.color.primary};
  color: \${args.theme.var.color.primary_text};
}
._id:hover:not(:disabled) {
  background: \${args.theme.var.color.primary_dark_200};
}
._id:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}\`;`}
                          >
                            📦 Create Backup
                          </As>
                        </As>
                      </As>
                    )}
                  </For>
                </As>
              </Show>
            </As>
          );
        }}
      </Show>

      {/* Cloud Backups Section */}
      <Show when={cloudBackups()?.success}>
        {() => {
          const backups = cloudBackups()!.data.backups;
          return (
            <As
              as="div"
              css={`return \`._id {
  margin-bottom: 2rem;
}\`;`}
            >
              <As
                as="h2"
                css={`return \`._id {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0 0 1rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}\`;`}
              >
                {`☁️ Cloud Backups (${backups.length})`}
              </As>

              {/* Backup List Table */}
              <Show
                when={backups.length > 0}
                fallback={
                  <As
                    as="div"
                    css={`return \`._id {
  padding: 3rem;
  text-align: center;
  color: \${args.theme.var.color.muted};
  border: 1px solid \${args.theme.var.color.border};
  border-radius: 0.5rem;
}\`;`}
                  >
                    No cloud backups found
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
                  {/* Table Header */}
                  <As
                    as="div"
                    css={`return \`._id {
  background: \${args.theme.var.color.background_light_200};
  padding: 1rem 1.5rem;
  font-weight: 600;
  font-size: 0.875rem;
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr 280px;
  gap: 1rem;
}\`;`}
                  >
                    <As as="div">Filename</As>
                    <As as="div">Database</As>
                    <As as="div">Size</As>
                    <As as="div">Date</As>
                    <As as="div">Actions</As>
                  </As>

                  {/* Table Rows */}
                  <For each={backups}>
                    {(backup) => (
                      <As
                        as="div"
                        css={`return \`._id {
  padding: 1rem 1.5rem;
  border-top: 1px solid \${args.theme.var.color.border};
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr 280px;
  gap: 1rem;
  align-items: center;
  background: \${args.theme.var.color.background};
  transition: background 0.2s;
}
._id:hover {
  background: \${args.theme.var.color.background_light_200};
}\`;`}
                      >
                        <As
                          as="div"
                          css={`return \`._id {
  font-family: monospace;
  font-size: 0.875rem;
}\`;`}
                        >
                          {backup.filename}
                        </As>
                        <As as="div">{backup.databaseName}</As>
                        <As as="div">{backup.sizeFormatted}</As>
                        <As
                          as="div"
                          css={`return \`._id {
  font-size: 0.875rem;
  color: \${args.theme.var.color.muted};
}\`;`}
                        >
                          {new Date(backup.lastModified).toLocaleDateString()}
                        </As>
                        <As
                          as="div"
                          css={`return \`._id {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}\`;`}
                        >
                          <As
                            as="button"
                            onClick={() => handleDownloadBackup(backup.filename, backup.databaseName)}
                            css={`return \`._id {
  padding: 0.25rem 0.5rem;
  border-radius: 0.375rem;
  font-size: 0.75rem;
  font-weight: 500;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
  background: \${args.theme.var.color.info};
  color: \${args.theme.var.color.info_text};
}
._id:hover {
  background: \${args.theme.var.color.info_dark_200};
}\`;`}
                          >
                            Download
                          </As>
                          <As
                            as="button"
                            onClick={() => setConfirmAction(`delete:${backup.filename}:${backup.databaseName}:${backup.key}`)}
                            css={`return \`._id {
  padding: 0.25rem 0.5rem;
  border-radius: 0.375rem;
  font-size: 0.75rem;
  font-weight: 500;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
  background: \${args.theme.var.color.error};
  color: \${args.theme.var.color.error_text};
}
._id:hover {
  background: \${args.theme.var.color.error_dark_200};
}\`;`}
                          >
                            Delete
                          </As>
                          <As
                            as="button"
                            onClick={() => setRestoreModal({
                              filename: backup.filename,
                              sourceDatabaseName: backup.databaseName,
                              key: backup.key
                            })}
                            css={`return \`._id {
  padding: 0.25rem 0.5rem;
  border-radius: 0.375rem;
  font-size: 0.75rem;
  font-weight: 500;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
  background: \${args.theme.var.color.warning};
  color: \${args.theme.var.color.warning_text};
}
._id:hover {
  background: \${args.theme.var.color.warning_dark_200};
}\`;`}
                          >
                            Restore
                          </As>
                        </As>
                      </As>
                    )}
                  </For>
                </As>
              </Show>
            </As>
          );
        }}
      </Show>

      {/* Confirmation Modal */}
      <Show when={confirmAction()}>
        {() => {
          const action = confirmAction()!;
          const [type, filename, databaseName, key] = action.split(":");
          return (
            <As
              as="div"
              css={`return \`._id {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}\`;`}
              onClick={() => setConfirmAction(null)}
            >
              <As
                as="div"
                css={`return \`._id {
  background: \${args.theme.var.color.background};
  padding: 2rem;
  border-radius: 0.5rem;
  max-width: 500px;
  border: 1px solid \${args.theme.var.color.border};
}\`;`}
                onClick={(e: MouseEvent) => e.stopPropagation()}
              >
                <As
                  as="h3"
                  css={`return \`._id {
  margin: 0 0 1rem 0;
  font-size: 1.25rem;
}\`;`}
                >
                  Confirm {type === "delete" ? "Delete" : "Action"}
                </As>
                <As
                  as="p"
                  css={`return \`._id {
  margin: 0 0 1.5rem 0;
  color: \${args.theme.var.color.muted};
}\`;`}
                >
                  Are you sure you want to {type} backup: <strong>{filename}</strong>?
                </As>
                <As
                  as="div"
                  css={`return \`._id {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}\`;`}
                >
                  <As
                    as="button"
                    onClick={() => setConfirmAction(null)}
                    css={`return \`._id {
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  border: 1px solid \${args.theme.var.color.border};
  background: \${args.theme.var.color.background};
  color: \${args.theme.var.color.text};
  transition: all 0.2s;
}
._id:hover {
  background: \${args.theme.var.color.background_light_200};
}\`;`}
                  >
                    Cancel
                  </As>
                  <As
                    as="button"
                    onClick={() => {
                      if (type === "delete") {
                        handleDeleteBackup(filename, databaseName, key);
                      }
                    }}
                    css={`return \`._id {
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  border: none;
  background: \${args.theme.var.color.error};
  color: \${args.theme.var.color.error_text};
  transition: all 0.2s;
}
._id:hover {
  background: \${args.theme.var.color.error_dark_200};
}\`;`}
                  >
                    Confirm
                  </As>
                </As>
              </As>
            </As>
          );
        }}
      </Show>

      {/* Restore Modal */}
      <Show when={restoreModal()}>
        {() => {
          const modal = restoreModal()!;
          const databases = subdomains()?.data || [];
          return (
            <As
              as="div"
              css={`return \`._id {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}\`;`}
              onClick={() => {
                if (!isRestoring()) {
                  setRestoreModal(null);
                  setTargetDatabase("");
                  setRestoreConfirmed(false);
                }
              }}
            >
              <As
                as="div"
                css={`return \`._id {
  background: \${args.theme.var.color.background};
  padding: 2rem;
  border-radius: 0.5rem;
  max-width: 600px;
  width: 90%;
  border: 1px solid \${args.theme.var.color.border};
}\`;`}
                onClick={(e: MouseEvent) => e.stopPropagation()}
              >
                <As
                  as="h3"
                  css={`return \`._id {
  margin: 0 0 1rem 0;
  font-size: 1.25rem;
  color: \${args.theme.var.color.warning};
}\`;`}
                >
                  ⚠️ Restore Database from Backup
                </As>

                <As
                  as="div"
                  css={`return \`._id {
  background: \${args.theme.var.color.warning_light_900};
  border: 1px solid \${args.theme.var.color.warning};
  border-radius: 0.375rem;
  padding: 1rem;
  margin-bottom: 1.5rem;
}\`;`}
                >
                  <As
                    as="p"
                    css={`return \`._id {
  margin: 0 0 0.5rem 0;
  color: \${args.theme.var.color.warning_dark_300};
  font-weight: 600;
}\`;`}
                  >
                    ⚠️ WARNING: This operation will DELETE all existing data!
                  </As>
                  <As
                    as="p"
                    css={`return \`._id {
  margin: 0;
  color: \${args.theme.var.color.warning_dark_300};
  font-size: 0.875rem;
}\`;`}
                  >
                    All current data in the target database will be permanently deleted and replaced with the backup data.
                  </As>
                </As>

                <As
                  as="div"
                  css={`return \`._id {
  margin-bottom: 1.5rem;
}\`;`}
                >
                  <As
                    as="div"
                    css={`return \`._id {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
}\`;`}
                  >
                    <As
                      as="label"
                      css={`return \`._id {
  font-weight: 500;
  font-size: 0.875rem;
  color: \${args.theme.var.color.muted};
}\`;`}
                    >
                      Source Backup:
                    </As>
                    <As
                      as="div"
                      css={`return \`._id {
  font-family: monospace;
  padding: 0.75rem;
  background: \${args.theme.var.color.background_light_200};
  border-radius: 0.375rem;
  font-size: 0.875rem;
}\`;`}
                    >
                      {modal.filename}
                    </As>
                  </As>

                  <As
                    as="div"
                    css={`return \`._id {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
}\`;`}
                  >
                    <As
                      as="label"
                      css={`return \`._id {
  font-weight: 500;
  font-size: 0.875rem;
  color: \${args.theme.var.color.muted};
}\`;`}
                    >
                      Original Database:
                    </As>
                    <As
                      as="div"
                      css={`return \`._id {
  font-family: monospace;
  padding: 0.75rem;
  background: \${args.theme.var.color.background_light_200};
  border-radius: 0.375rem;
  font-size: 0.875rem;
}\`;`}
                    >
                      {modal.sourceDatabaseName}
                    </As>
                  </As>

                  <As
                    as="div"
                    css={`return \`._id {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}\`;`}
                  >
                    <As
                      as="label"
                      css={`return \`._id {
  font-weight: 500;
  font-size: 0.875rem;
  color: \${args.theme.var.color.muted};
}\`;`}
                    >
                      Target Database (leave empty to restore to original):
                    </As>
                    <As
                      as="select"
                      value={targetDatabase()}
                      onChange={(e: Event) => setTargetDatabase((e.target as HTMLSelectElement).value)}
                      css={`return \`._id {
  padding: 0.75rem;
  border: 1px solid \${args.theme.var.color.border};
  border-radius: 0.375rem;
  background: \${args.theme.var.color.background};
  color: \${args.theme.var.color.text};
  font-family: monospace;
  font-size: 0.875rem;
  cursor: pointer;
}
._id:focus {
  outline: none;
  border-color: \${args.theme.var.color.primary};
}\`;`}
                    >
                      <As as="option" value="">
                        {modal.sourceDatabaseName} (original)
                      </As>
                      <For each={databases}>
                        {(db) => (
                          <As as="option" value={db.name}>
                            {db.name}
                          </As>
                        )}
                      </For>
                    </As>
                  </As>
                </As>

                <As
                  as="div"
                  css={`return \`._id {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: \${args.theme.var.color.error_light_900};
  border-radius: 0.375rem;
  border: 1px solid \${args.theme.var.color.error};
}\`;`}
                >
                  <As
                    as="input"
                    type="checkbox"
                    checked={restoreConfirmed()}
                    onChange={(e: Event) => setRestoreConfirmed((e.target as HTMLInputElement).checked)}
                    css={`return \`._id {
  width: 1.25rem;
  height: 1.25rem;
  cursor: pointer;
}\`;`}
                  />
                  <As
                    as="label"
                    css={`return \`._id {
  font-size: 0.875rem;
  color: \${args.theme.var.color.error_dark_300};
  font-weight: 500;
  cursor: pointer;
}\`;`}
                    onClick={() => setRestoreConfirmed(!restoreConfirmed())}
                  >
                    I understand this will DELETE all data in the target database
                  </As>
                </As>

                <As
                  as="div"
                  css={`return \`._id {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}\`;`}
                >
                  <As
                    as="button"
                    onClick={() => {
                      if (!isRestoring()) {
                        setRestoreModal(null);
                        setTargetDatabase("");
                        setRestoreConfirmed(false);
                      }
                    }}
                    disabled={isRestoring()}
                    css={`return \`._id {
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  border: 1px solid \${args.theme.var.color.border};
  background: \${args.theme.var.color.background};
  color: \${args.theme.var.color.text};
  transition: all 0.2s;
}
._id:hover:not(:disabled) {
  background: \${args.theme.var.color.background_light_200};
}
._id:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}\`;`}
                  >
                    Cancel
                  </As>
                  <As
                    as="button"
                    onClick={handleRestoreBackup}
                    disabled={!restoreConfirmed() || isRestoring()}
                    css={`return \`._id {
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  border: none;
  background: \${args.theme.var.color.warning};
  color: \${args.theme.var.color.warning_text};
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
._id:hover:not(:disabled) {
  background: \${args.theme.var.color.warning_dark_200};
}
._id:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}\`;`}
                  >
                    <Show
                      when={isRestoring()}
                      fallback={<>⚠️ Restore Database</>}
                    >
                      <As
                        as="span"
                        css={`return \`._id {
  width: 1rem;
  height: 1rem;
  border: 2px solid currentColor;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}\`;`}
                      />
                      <As as="span">Restoring...</As>
                    </Show>
                  </As>
                </As>
              </As>
            </As>
          );
        }}
      </Show>

      {/* Error state */}
      <Show when={backupStatus()?.error || cloudBackups()?.error || subdomains()?.error}>
        <As
          as="div"
          css={`return \`._id {
  padding: 2rem;
  text-align: center;
  color: \${args.theme.var.color.error};
  background: \${args.theme.var.color.error_light_900};
  border: 1px solid \${args.theme.var.color.error};
  border-radius: 0.5rem;
}\`;`}
        >
          {backupStatus()?.error || cloudBackups()?.error || subdomains()?.error}
        </As>
      </Show>
    </As>
  );
}
