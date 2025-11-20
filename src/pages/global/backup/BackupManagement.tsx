import { createAsync } from "@solidjs/router";
import { createSignal, createMemo, Show, For } from "solid-js";
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
  saveBackupNote as saveBackupNoteServer,
  getBackupNotes as getBackupNotesServer,
  compareBackups as compareBackupsServer,
  previewBackup as previewBackupServer,
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
  const [downloadingBackup, setDownloadingBackup] = createSignal<string | null>(
    null,
  );

  // Feature: Bulk Operations
  const [selectedBackups, setSelectedBackups] = createSignal<Set<string>>(
    new Set(),
  );
  const [bulkActionInProgress, setBulkActionInProgress] = createSignal(false);

  // Feature: Comparison Tool
  const [comparisonMode, setComparisonMode] = createSignal(false);
  const [selectedForComparison, setSelectedForComparison] = createSignal<
    string[]
  >([]);
  const [comparisonModal, setComparisonModal] = createSignal<any | null>(null);
  const [isComparing, setIsComparing] = createSignal(false);

  // Feature: Backup Preview
  const [previewModal, setPreviewModal] = createSignal<any | null>(null);
  const [isPreviewing, setIsPreviewing] = createSignal(false);

  // Feature: Backup Verification
  const [verifyingBackup, setVerifyingBackup] = createSignal<string | null>(
    null,
  );

  // Feature: Backup Notes/Tags
  const [noteModal, setNoteModal] = createSignal<{
    backupKey: string;
    currentNote: string;
  } | null>(null);
  const [noteInput, setNoteInput] = createSignal("");

  // Feature: Upload Backup
  const [uploadModal, setUploadModal] = createSignal(false);
  const [uploadFile, setUploadFile] = createSignal<File | null>(null);
  const [uploadTargetDb, setUploadTargetDb] = createSignal("");
  const [uploadShouldRestore, setUploadShouldRestore] = createSignal(false);
  const [uploadConfirmed, setUploadConfirmed] = createSignal(false);
  const [isUploading, setIsUploading] = createSignal(false);

  // Load notes from database initially
  const initialNotesVertices = createAsync(
    async () => {
      const result = await getBackupNotesServer();
      return result.success ? result.data : [];
    },
    { deferStream: true },
  );

  // Store notes locally in a signal
  const [notesVertices, setNotesVertices] = createSignal<any[]>([]);

  // Initialize notes from server
  createMemo(() => {
    const initial = initialNotesVertices();
    if (initial && initial.length >= 0) {
      setNotesVertices(initial);
    }
  });

  // Convert vertices to key-value map for easy access
  const backupNotes = createMemo(() => {
    const vertices = notesVertices();
    const notesMap: Record<string, string> = {};
    vertices.forEach((vertex: any) => {
      if (vertex.P?.backupKey && vertex.P?.note) {
        notesMap[vertex.P.backupKey] = vertex.P.note;
      }
    });
    return notesMap;
  });

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

  const handleDeleteBackup = async (
    filename: string,
    databaseName?: string,
    key?: string,
  ) => {
    const result = await deleteBackup(filename, databaseName, key);
    if (result.success) {
      showSuccessToast("Backup deleted successfully");
      setRefreshKey((prev) => prev + 1);
    } else {
      showErrorToast(result.error || "Failed to delete backup");
    }
    setConfirmAction(null);
  };

  const handleDownloadBackup = async (
    filename: string,
    databaseName?: string,
  ) => {
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
      showErrorToast(
        "Please confirm that you understand this will delete all data",
      );
      return;
    }

    const target = targetDatabase() || modal.sourceDatabaseName;

    setIsRestoring(true);
    try {
      const result = await restoreBackup(
        modal.filename,
        modal.sourceDatabaseName,
        target,
        true,
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

  const handleVerifyBackup = async (filename: string, databaseName: string) => {
    const backupId = `${databaseName}-${filename}`;
    const testDbName = `${databaseName}_verify`;

    setVerifyingBackup(backupId);
    try {
      showSuccessToast(
        `Starting verification: Restoring ${filename} to ${testDbName}...`,
      );

      const result = await restoreBackup(
        filename,
        databaseName,
        testDbName,
        true,
      );

      if (result.success) {
        showSuccessToast(
          `✅ Backup verified successfully! ` +
            `The backup was restored to ${testDbName} without errors. ` +
            `You can delete the test database if not needed.`,
        );
      } else {
        showErrorToast(
          `❌ Backup verification failed: ${result.error || "Unknown error"}. ` +
            `The backup may be corrupted or incompatible.`,
        );
      }
    } catch (error: any) {
      showErrorToast(`Verification error: ${error.message}`);
    } finally {
      setVerifyingBackup(null);
    }
  };

  const handleOpenNoteModal = (backupKey: string) => {
    const notes = backupNotes() || {};
    const currentNote = notes[backupKey] || "";
    setNoteInput(currentNote);
    setNoteModal({ backupKey, currentNote });
  };

  const handleSaveNote = async () => {
    const modal = noteModal();
    if (!modal) return;

    try {
      const result = await saveBackupNoteServer(modal.backupKey, noteInput());
      if (result.success) {
        showSuccessToast(result.message || "Note saved successfully");

        // Update local state with the new vertex
        if (result.data) {
          // Add or update the vertex in the local array
          setNotesVertices((prev) => {
            const index = prev.findIndex(
              (v: any) => v.P?.backupKey === modal.backupKey,
            );
            if (index >= 0) {
              // Update existing
              const updated = [...prev];
              updated[index] = result.data;
              return updated;
            } else {
              // Add new
              return [...prev, result.data];
            }
          });
        } else {
          // Note was deleted (empty note)
          setNotesVertices((prev) =>
            prev.filter((v: any) => v.P?.backupKey !== modal.backupKey),
          );
        }
      } else {
        showErrorToast(result.error || "Failed to save note");
      }
    } catch (error: any) {
      showErrorToast(`Error saving note: ${error.message}`);
    }

    setNoteModal(null);
    setNoteInput("");
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

  // Helper: Get size warning color
  const getSizeWarning = (size: number) => {
    const mb = size / (1024 * 1024);
    if (mb < 100) return "success"; // Green
    if (mb < 500) return "warning"; // Yellow
    return "error"; // Red
  };

  // Helper: Calculate storage cost (estimated)
  const calculateStorageCost = (totalSize: number) => {
    const gb = totalSize / (1024 * 1024 * 1024);
    const costPerGB = 0.023; // AWS S3 standard storage (adjust as needed)
    return (gb * costPerGB).toFixed(2);
  };

  // Helper: Get most recent backup size for a database
  const getRecentBackupSize = (databaseName: string) => {
    const backups = cloudBackups()?.data?.backups || [];
    const dbBackups = backups
      .filter((b) => b.databaseName === databaseName)
      .sort(
        (a, b) =>
          new Date(b.lastModified).getTime() -
          new Date(a.lastModified).getTime(),
      );

    if (dbBackups.length > 0) {
      return dbBackups[0].sizeFormatted;
    }
    return "No backups";
  };

  // Helper: Get total storage cost for a database
  const getDatabaseCost = (databaseName: string) => {
    const backups = cloudBackups()?.data?.backups || [];
    const dbBackups = backups.filter((b) => b.databaseName === databaseName);
    const totalSize = dbBackups.reduce((sum, b) => sum + b.size, 0);

    if (totalSize === 0) return "$0.00";

    const gb = totalSize / (1024 * 1024 * 1024);
    const costPerGB = 0.023; // AWS S3 standard storage
    return `$${(gb * costPerGB).toFixed(2)}`;
  };

  // Helper: Filter backups based on search and filters
  const filteredBackups = createMemo(() => {
    const backups = cloudBackups()?.data?.backups || [];
    const query = searchQuery().toLowerCase();
    const dbFilter = filterDatabase();

    return backups.filter((backup) => {
      const matchesSearch =
        !query ||
        backup.filename.toLowerCase().includes(query) ||
        backup.databaseName.toLowerCase().includes(query);

      const matchesDb = !dbFilter || backup.databaseName === dbFilter;

      return matchesSearch && matchesDb;
    });
  });

  // Helper: Toggle backup selection
  const toggleBackupSelection = (backupKey: string) => {
    const newSet = new Set(selectedBackups());
    if (newSet.has(backupKey)) {
      newSet.delete(backupKey);
    } else {
      newSet.add(backupKey);
    }
    setSelectedBackups(newSet);
  };

  // Helper: Select all visible backups
  const toggleSelectAll = () => {
    const backups = filteredBackups();
    if (selectedBackups().size === backups.length) {
      setSelectedBackups(new Set());
    } else {
      setSelectedBackups(new Set(backups.map((b) => b.key)));
    }
  };

  // Feature: Bulk delete
  const handleBulkDelete = async () => {
    if (selectedBackups().size === 0) return;

    setBulkActionInProgress(true);
    try {
      const backups = cloudBackups()?.data?.backups || [];
      const selected = Array.from(selectedBackups());

      for (const key of selected) {
        const backup = backups.find((b) => b.key === key);
        if (backup) {
          await deleteBackup(backup.filename, backup.databaseName, backup.key);
        }
      }

      showSuccessToast(`Deleted ${selected.length} backup(s) successfully`);
      setSelectedBackups(new Set());
      setRefreshKey((prev) => prev + 1);
    } catch (error: any) {
      showErrorToast(`Bulk delete failed: ${error.message}`);
    } finally {
      setBulkActionInProgress(false);
    }
  };

  // Feature: Bulk download
  const handleBulkDownload = async () => {
    if (selectedBackups().size === 0) return;

    setBulkActionInProgress(true);
    try {
      const backups = cloudBackups()?.data?.backups || [];
      const selected = Array.from(selectedBackups());

      for (const key of selected) {
        const backup = backups.find((b) => b.key === key);
        if (backup) {
          await downloadBackup(backup.filename, backup.databaseName);
        }
      }

      showSuccessToast(`Downloaded ${selected.length} backup(s) successfully`);
      setSelectedBackups(new Set());
    } catch (error: any) {
      showErrorToast(`Bulk download failed: ${error.message}`);
    } finally {
      setBulkActionInProgress(false);
    }
  };

  // Feature: Toggle comparison mode
  const toggleComparisonSelection = (backupKey: string) => {
    const current = selectedForComparison();
    if (current.includes(backupKey)) {
      setSelectedForComparison(current.filter((k) => k !== backupKey));
    } else if (current.length < 2) {
      setSelectedForComparison([...current, backupKey]);
    } else {
      showErrorToast("Can only compare 2 backups at a time");
    }
  };

  // Feature: Compare backups
  const handleCompareBackups = async () => {
    if (selectedForComparison().length !== 2) {
      showErrorToast("Please select exactly 2 backups to compare");
      return;
    }

    const backups = cloudBackups()?.data?.backups || [];
    const backup1 = backups.find((b) => b.key === selectedForComparison()[0]);
    const backup2 = backups.find((b) => b.key === selectedForComparison()[1]);

    if (!backup1 || !backup2) return;

    setIsComparing(true);
    try {
      showSuccessToast("Comparing backups... This may take a moment.");

      const result = await compareBackupsServer(
        backup1.filename,
        backup1.databaseName,
        backup2.filename,
        backup2.databaseName,
      );

      if (result.success) {
        const sizeDiff = Math.abs(backup1.size - backup2.size);
        const sizeDiffMB = (sizeDiff / (1024 * 1024)).toFixed(2);
        const timeDiff = Math.abs(
          new Date(backup1.lastModified).getTime() -
            new Date(backup2.lastModified).getTime(),
        );
        const daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));

        setComparisonModal({
          backup1,
          backup2,
          sizeDiff: sizeDiffMB,
          timeDiff: daysDiff,
          diffData: result.data,
        });
      } else {
        showErrorToast(result.error || "Failed to compare backups");
      }
    } catch (error: any) {
      showErrorToast(`Comparison error: ${error.message}`);
    } finally {
      setIsComparing(false);
    }
  };

  const handlePreviewBackup = async (
    filename: string,
    databaseName: string,
  ) => {
    setIsPreviewing(true);
    try {
      showSuccessToast("Loading backup preview... This may take a moment.");

      const result = await previewBackupServer(filename, databaseName);

      if (result.success) {
        setPreviewModal(result.data);
      } else {
        showErrorToast(result.error || "Failed to preview backup");
      }
    } catch (error: any) {
      showErrorToast(`Preview error: ${error.message}`);
    } finally {
      setIsPreviewing(false);
    }
  };

  const handleUploadBackup = async () => {
    const file = uploadFile();
    const targetDb = uploadTargetDb();

    if (!file) {
      showErrorToast("Please select a backup file");
      return;
    }

    if (!targetDb) {
      showErrorToast("Please select a target database");
      return;
    }

    if (uploadShouldRestore() && !uploadConfirmed()) {
      showErrorToast(
        "Please confirm that you understand this will delete all data",
      );
      return;
    }

    setIsUploading(true);
    try {
      showSuccessToast("Uploading backup file... This may take a while.");

      // Create FormData for multipart upload
      const formData = new FormData();
      formData.append("file", file);
      formData.append("targetDatabase", targetDb);
      formData.append("shouldRestore", uploadShouldRestore().toString());
      formData.append("confirmed", uploadConfirmed().toString());

      // Upload file using fetch API
      const response = await fetch("/api/backup/upload", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        if (uploadShouldRestore()) {
          showSuccessToast(`Backup uploaded and restored successfully to ${targetDb}`);
        } else {
          showSuccessToast("Backup uploaded successfully");
        }
        setUploadModal(false);
        setUploadFile(null);
        setUploadTargetDb("");
        setUploadShouldRestore(false);
        setUploadConfirmed(false);
        setRefreshKey((prev) => prev + 1);
      } else {
        showErrorToast(result.error || "Failed to upload backup");
      }
    } catch (error: any) {
      showErrorToast(`Upload error: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
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
          as="div"
          css={`return \`._id {
  display: flex;
  gap: 1rem;
}\`;`}
        >
          <As
            as="button"
            onClick={() => setUploadModal(true)}
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
            {"⬆️ Upload Backup"}
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
                        Duration:{" "}
                        {Math.round(
                          (backup.lastSuccessful?.duration || 0) / 1000,
                        )}
                        s
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
                    <As
                      as="span"
                      css={`return \`._id { font-weight: 500; }\`;`}
                    >
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
  grid-template-columns: 2fr 1fr 1fr 1fr 1fr 180px;
  gap: 1rem;
}\`;`}
                  >
                    <As as="div">Database Name</As>
                    <As as="div">Status</As>
                    <As as="div">Role</As>
                    <As as="div">Latest Size</As>
                    <As as="div">Monthly Cost</As>
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
  grid-template-columns: 2fr 1fr 1fr 1fr 1fr 180px;
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
  background: ${database.currentStatus === "online" ? "${args.theme.var.color.success_light_900}" : "${args.theme.var.color.error_light_900}"};
  color: ${database.currentStatus === "online" ? "${args.theme.var.color.success_dark_300}" : "${args.theme.var.color.error_dark_300}"};
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
                        <As
                          as="div"
                          css={`return \`._id {
  font-size: 0.875rem;
  font-weight: 500;
  color: \${args.theme.var.color.info};
}\`;`}
                        >
                          {getRecentBackupSize(database.name)}
                        </As>
                        <As
                          as="div"
                          css={`return \`._id {
  font-size: 0.875rem;
  font-weight: 500;
  color: \${args.theme.var.color.success};
}\`;`}
                        >
                          ${getDatabaseCost(database.name)}
                        </As>
                        <As as="div">
                          <As
                            as="button"
                            onClick={() => handleCreateBackup(database.name)}
                            disabled={
                              database.currentStatus !== "online" ||
                              creatingBackup() === database.name
                            }
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
  display: flex;
  align-items: center;
  gap: 0.5rem;
  justify-content: center;
  min-width: 120px;
}
._id:hover:not(:disabled) {
  background: \${args.theme.var.color.primary_dark_200};
}
._id:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}\`;`}
                          >
                            <Show
                              when={creatingBackup() === database.name}
                              fallback={<>📦 Create Backup</>}
                            >
                              <As
                                as="span"
                                css={`return \`._id {
  width: 0.875rem;
  height: 0.875rem;
  border: 2px solid currentColor;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}\`;`}
                              />
                              <As as="span">Creating...</As>
                            </Show>
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
      <Show when={cloudBackups()?.success && cloudBackups()?.data?.backups}>
        {() => {
          const allBackups = cloudBackups()!.data!.backups;
          const totalSize = allBackups.reduce((sum, b) => sum + b.size, 0);
          const uniqueDatabases = [
            ...new Set(allBackups.map((b) => b.databaseName)),
          ];

          return (
            <As
              as="div"
              css={`return \`._id {
  margin-bottom: 2rem;
}\`;`}
            >
              {/* Header with Stats */}
              <As
                as="div"
                css={`return \`._id {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  flex-wrap: wrap;
  gap: 1rem;
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
                  {`☁️ Cloud Backups (${allBackups.length})`}
                </As>

                {/* Retention Policy & Cost Display */}
                <As
                  as="div"
                  css={`return \`._id {
  display: flex;
  gap: 1rem;
  align-items: center;
  font-size: 0.875rem;
  flex-wrap: wrap;
}\`;`}
                >
                  <As
                    as="div"
                    css={`return \`._id {
  padding: 0.5rem 1rem;
  background: \${args.theme.var.color.info_light_900};
  border-radius: 0.375rem;
  border: 1px solid \${args.theme.var.color.info};
}\`;`}
                  >
                    <As
                      as="span"
                      css={`return \`._id {
  color: \${args.theme.var.color.info_dark_300};
  font-weight: 500;
}\`;`}
                    >
                      💾 Total: {(totalSize / (1024 * 1024 * 1024)).toFixed(2)}{" "}
                      GB
                    </As>
                  </As>
                  <As
                    as="div"
                    css={`return \`._id {
  padding: 0.5rem 1rem;
  background: \${args.theme.var.color.success_light_900};
  border-radius: 0.375rem;
  border: 1px solid \${args.theme.var.color.success};
}\`;`}
                  >
                    <As
                      as="span"
                      css={`return \`._id {
  color: \${args.theme.var.color.success_dark_300};
  font-weight: 500;
}\`;`}
                    >
                      💵 Est. Cost: ${calculateStorageCost(totalSize)}/month
                    </As>
                  </As>
                  <As
                    as="div"
                    title="Retention Policy: Daily (7 days), Weekly (4 weeks), Monthly (12 months)"
                    css={`return \`._id {
  padding: 0.5rem 1rem;
  background: \${args.theme.var.color.warning_light_900};
  border-radius: 0.375rem;
  border: 1px solid \${args.theme.var.color.warning};
  cursor: help;
  position: relative;
}
._id:hover {
  background: \${args.theme.var.color.warning_light_800};
}\`;`}
                  >
                    <As
                      as="span"
                      css={`return \`._id {
  color: \${args.theme.var.color.warning_dark_300};
  font-weight: 500;
}\`;`}
                    >
                      🔄 Auto-Cleanup: 7d / 4w / 12m
                    </As>
                  </As>
                </As>
              </As>

              {/* Search/Filter Controls */}
              <As
                as="div"
                css={`return \`._id {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
  align-items: center;
}\`;`}
              >
                <As
                  as="input"
                  type="text"
                  placeholder="🔍 Search backups..."
                  value={searchQuery()}
                  onInput={(e: Event) => {
                    const target = e.target as HTMLInputElement;
                    setSearchQuery(target.value);
                  }}
                  onKeyDown={(e: KeyboardEvent) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                    }
                  }}
                  css={`return \`._id {
  flex: 1;
  min-width: 250px;
  padding: 0.625rem 1rem;
  border: 1px solid \${args.theme.var.color.border};
  border-radius: 0.375rem;
  background: \${args.theme.var.color.background};
  color: \${args.theme.var.color.text};
  font-size: 0.875rem;
}
._id:focus {
  outline: none;
  border-color: \${args.theme.var.color.primary};
}\`;`}
                />

                <As
                  as="select"
                  value={filterDatabase()}
                  onChange={(e: Event) =>
                    setFilterDatabase((e.target as HTMLSelectElement).value)
                  }
                  css={`return \`._id {
  padding: 0.625rem 1rem;
  border: 1px solid \${args.theme.var.color.border};
  border-radius: 0.375rem;
  background: \${args.theme.var.color.background};
  color: \${args.theme.var.color.text};
  font-size: 0.875rem;
  cursor: pointer;
}
._id:focus {
  outline: none;
  border-color: \${args.theme.var.color.primary};
}\`;`}
                >
                  <As as="option" value="">
                    All Databases
                  </As>
                  <For each={uniqueDatabases}>
                    {(db) => (
                      <As as="option" value={db}>
                        {db}
                      </As>
                    )}
                  </For>
                </As>

                {/* Comparison Mode Toggle */}
                <As
                  as="button"
                  onClick={() => {
                    setComparisonMode(!comparisonMode());
                    setSelectedForComparison([]);
                  }}
                  css={`return \`._id {
  padding: 0.625rem 1rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  border: 1px solid \${args.theme.var.color.border};
  background: ${comparisonMode() ? "${args.theme.var.color.warning}" : "${args.theme.var.color.background}"};
  color: ${comparisonMode() ? "${args.theme.var.color.warning_text}" : "${args.theme.var.color.text}"};
  transition: all 0.2s;
}
._id:hover {
  background: ${comparisonMode() ? "${args.theme.var.color.warning_dark_200}" : "${args.theme.var.color.background_light_200}"};
}\`;`}
                >
                  {comparisonMode() ? "🔄 Exit Compare" : "🔍 Compare"}
                </As>

                <Show
                  when={
                    comparisonMode() && selectedForComparison().length === 2
                  }
                >
                  <As
                    as="button"
                    onClick={handleCompareBackups}
                    disabled={isComparing()}
                    css={`return \`._id {
  padding: 0.625rem 1rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  border: none;
  background: \${args.theme.var.color.primary};
  color: \${args.theme.var.color.primary_text};
  transition: all 0.2s;
}
._id:hover {
  background: \${args.theme.var.color.primary_dark_200};
}\`;`}
                  >
                    ⚡ Show Comparison
                  </As>
                </Show>
              </As>

              {/* Bulk Actions Bar */}
              <Show when={selectedBackups().size > 0 && !comparisonMode()}>
                <As
                  as="div"
                  css={`return \`._id {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  padding: 1rem;
  background: \${args.theme.var.color.background_light_200};
  border-radius: 0.375rem;
  align-items: center;
}\`;`}
                >
                  <As
                    as="span"
                    css={`return \`._id {
  font-weight: 500;
  font-size: 0.875rem;
}\`;`}
                  >
                    {selectedBackups().size} selected
                  </As>

                  <As
                    as="button"
                    onClick={handleBulkDownload}
                    disabled={bulkActionInProgress()}
                    css={`return \`._id {
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  border: none;
  background: \${args.theme.var.color.info};
  color: \${args.theme.var.color.info_text};
  transition: all 0.2s;
}
._id:hover:not(:disabled) {
  background: \${args.theme.var.color.info_dark_200};
}
._id:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}\`;`}
                  >
                    ⬇️ Download All
                  </As>

                  <As
                    as="button"
                    onClick={handleBulkDelete}
                    disabled={bulkActionInProgress()}
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
._id:hover:not(:disabled) {
  background: \${args.theme.var.color.error_dark_200};
}
._id:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}\`;`}
                  >
                    🗑️ Delete All
                  </As>

                  <As
                    as="button"
                    onClick={() => setSelectedBackups(new Set())}
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
  margin-left: auto;
}
._id:hover {
  background: \${args.theme.var.color.background_light_200};
}\`;`}
                  >
                    ✕ Clear Selection
                  </As>
                </As>
              </Show>

              {/* Backup List Table */}
              <Show
                when={filteredBackups().length > 0}
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
  grid-template-columns: ${comparisonMode() ? "40px" : "40px"} 2fr 1fr 1fr 1fr 1.2fr ${comparisonMode() ? "100px" : "400px"};
  gap: 1rem;
  align-items: center;
}\`;`}
                  >
                    <Show
                      when={!comparisonMode()}
                      fallback={<As as="div">Compare</As>}
                    >
                      <As
                        as="input"
                        type="checkbox"
                        checked={
                          selectedBackups().size === filteredBackups().length &&
                          filteredBackups().length > 0
                        }
                        onChange={toggleSelectAll}
                        css={`return \`._id {
  width: 1.125rem;
  height: 1.125rem;
  cursor: pointer;
}\`;`}
                      />
                    </Show>
                    <As as="div">Filename</As>
                    <As as="div">Database</As>
                    <As as="div">Size</As>
                    <As as="div">Date</As>
                    <As as="div">Encryption</As>
                    <As as="div">Actions</As>
                  </As>

                  {/* Table Rows */}
                  <For each={filteredBackups()}>
                    {(backup) => {
                      const backupId = `${backup.databaseName}-${backup.filename}`;
                      const isDownloading = downloadingBackup() === backupId;
                      const sizeWarning = getSizeWarning(backup.size);

                      return (
                        <As
                          as="div"
                          css={`return \`._id {
  padding: 1rem 1.5rem;
  border-top: 1px solid \${args.theme.var.color.border};
  display: grid;
  grid-template-columns: ${comparisonMode() ? "40px" : "40px"} 2fr 1fr 1fr 1fr 1.2fr ${comparisonMode() ? "100px" : "400px"};
  gap: 1rem;
  align-items: center;
  background: \${args.theme.var.color.background};
  transition: background 0.2s;
}
._id:hover {
  background: \${args.theme.var.color.background_light_200};
}\`;`}
                        >
                          {/* Checkbox/Radio for Selection or Comparison */}
                          <Show
                            when={!comparisonMode()}
                            fallback={
                              <As
                                as="input"
                                type="checkbox"
                                checked={selectedForComparison().includes(
                                  backup.key,
                                )}
                                onChange={() =>
                                  toggleComparisonSelection(backup.key)
                                }
                                disabled={
                                  selectedForComparison().length >= 2 &&
                                  !selectedForComparison().includes(backup.key)
                                }
                                css={`return \`._id {
  width: 1.125rem;
  height: 1.125rem;
  cursor: pointer;
}
._id:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}\`;`}
                              />
                            }
                          >
                            <As
                              as="input"
                              type="checkbox"
                              checked={selectedBackups().has(backup.key)}
                              onChange={() => toggleBackupSelection(backup.key)}
                              css={`return \`._id {
  width: 1.125rem;
  height: 1.125rem;
  cursor: pointer;
}\`;`}
                            />
                          </Show>

                          {/* Filename with Note Indicator */}
                          <As
                            as="div"
                            css={`return \`._id {
  font-family: monospace;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}\`;`}
                          >
                            <As as="span">{backup.filename}</As>
                            <Show when={(backupNotes() || {})[backup.key]}>
                              <As
                                as="span"
                                title={(backupNotes() || {})[backup.key]}
                                css={`return \`._id {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.25rem;
  height: 1.25rem;
  border-radius: 50%;
  background: \${args.theme.var.color.info_light_900};
  color: \${args.theme.var.color.info};
  font-size: 0.75rem;
  cursor: help;
}\`;`}
                              >
                                📝
                              </As>
                            </Show>
                          </As>

                          {/* Database Name */}
                          <As as="div">{backup.databaseName}</As>

                          {/* Size with Color Coding */}
                          <As
                            as="div"
                            css={`return \`._id {
  font-weight: 600;
  color: \${args.theme.var.color[${JSON.stringify(sizeWarning)}]};
}\`;`}
                          >
                            {backup.sizeFormatted}
                          </As>

                          {/* Date */}
                          <As
                            as="div"
                            css={`return \`._id {
  font-size: 0.875rem;
  color: \${args.theme.var.color.muted};
}\`;`}
                          >
                            {new Date(backup.lastModified).toLocaleDateString()}
                          </As>

                          {/* Encryption Status */}
                          <As
                            as="div"
                            css={`return \`._id {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}\`;`}
                          >
                            <Show
                              when={backup.encryption?.enabled}
                              fallback={
                                <As
                                  as="span"
                                  css={`return \`._id {
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  background: \${args.theme.var.color.error_light_900};
  color: \${args.theme.var.color.error};
  font-weight: 500;
}\`;`}
                                >
                                  🔓 Not Encrypted
                                </As>
                              }
                            >
                              <As
                                as="span"
                                css={`return \`._id {
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  background: \${args.theme.var.color.success_light_900};
  color: \${args.theme.var.color.success};
  font-weight: 500;
}\`;`}
                              >
                                🔒 {backup.encryption?.algorithm || "Encrypted"}
                              </As>
                              <As
                                as="span"
                                css={`return \`._id {
  font-size: 0.7rem;
  color: \${args.theme.var.color.muted};
}\`;`}
                              >
                                {backup.encryption?.keyManagement || ""}
                              </As>
                            </Show>
                          </As>

                          {/* Actions */}
                          <Show
                            when={!comparisonMode()}
                            fallback={
                              <As
                                as="div"
                                css={`return \`._id {
  font-size: 0.75rem;
  color: \${args.theme.var.color.muted};
  text-align: center;
}\`;`}
                              >
                                Select 2 to compare
                              </As>
                            }
                          >
                            <As
                              as="div"
                              css={`return \`._id {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}\`;`}
                            >
                              {/* Preview Button */}
                              <As
                                as="button"
                                onClick={() =>
                                  handlePreviewBackup(
                                    backup.filename,
                                    backup.databaseName,
                                  )
                                }
                                disabled={isPreviewing()}
                                css={`return \`._id {
  padding: 0.25rem 0.5rem;
  border-radius: 0.375rem;
  font-size: 0.75rem;
  font-weight: 500;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
  background: \${args.theme.var.color.primary};
  color: \${args.theme.var.color.primary_text};
  display: flex;
  align-items: center;
  gap: 0.375rem;
  min-width: 80px;
  justify-content: center;
}
._id:hover:not(:disabled) {
  background: \${args.theme.var.color.primary_dark_200};
}
._id:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}\`;`}
                              >
                                <Show
                                  when={isPreviewing()}
                                  fallback={<>👁️ Preview</>}
                                >
                                  <As
                                    as="span"
                                    css={`return \`._id {
  width: 0.75rem;
  height: 0.75rem;
  border: 2px solid currentColor;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}\`;`}
                                  />
                                  <As as="span">...</As>
                                </Show>
                              </As>

                              {/* Download Button with Loading State */}
                              <As
                                as="button"
                                onClick={() =>
                                  handleDownloadBackup(
                                    backup.filename,
                                    backup.databaseName,
                                  )
                                }
                                disabled={isDownloading}
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
  display: flex;
  align-items: center;
  gap: 0.375rem;
  min-width: 80px;
  justify-content: center;
}
._id:hover:not(:disabled) {
  background: \${args.theme.var.color.info_dark_200};
}
._id:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}\`;`}
                              >
                                <Show
                                  when={isDownloading}
                                  fallback={<>⬇️ Download</>}
                                >
                                  <As
                                    as="span"
                                    css={`return \`._id {
  width: 0.75rem;
  height: 0.75rem;
  border: 2px solid currentColor;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}\`;`}
                                  />
                                  <As as="span">...</As>
                                </Show>
                              </As>

                              {/* Delete Button */}
                              <As
                                as="button"
                                onClick={() =>
                                  setConfirmAction(
                                    `delete:${backup.filename}:${backup.databaseName}:${backup.key}`,
                                  )
                                }
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
                                🗑️ Delete
                              </As>

                              {/* Restore Button */}
                              <As
                                as="button"
                                onClick={() =>
                                  setRestoreModal({
                                    filename: backup.filename,
                                    sourceDatabaseName: backup.databaseName,
                                    key: backup.key,
                                  })
                                }
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
                                ⚠️ Restore
                              </As>

                              {/* Verify Button */}
                              <As
                                as="button"
                                onClick={() =>
                                  handleVerifyBackup(
                                    backup.filename,
                                    backup.databaseName,
                                  )
                                }
                                disabled={verifyingBackup() === backupId}
                                css={`return \`._id {
  padding: 0.25rem 0.5rem;
  border-radius: 0.375rem;
  font-size: 0.75rem;
  font-weight: 500;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
  background: \${args.theme.var.color.primary};
  color: \${args.theme.var.color.primary_text};
  display: flex;
  align-items: center;
  gap: 0.375rem;
  min-width: 70px;
  justify-content: center;
}
._id:hover:not(:disabled) {
  background: \${args.theme.var.color.primary_dark_200};
}
._id:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}\`;`}
                              >
                                <Show
                                  when={verifyingBackup() === backupId}
                                  fallback={<>✓ Verify</>}
                                >
                                  <As
                                    as="span"
                                    css={`return \`._id {
  width: 0.75rem;
  height: 0.75rem;
  border: 2px solid currentColor;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}\`;`}
                                  />
                                  <As as="span">...</As>
                                </Show>
                              </As>

                              {/* Note Button */}
                              <As
                                as="button"
                                onClick={() => handleOpenNoteModal(backup.key)}
                                title={
                                  (backupNotes() || {})[backup.key] ||
                                  "Add note"
                                }
                                css={`return \`._id {
  padding: 0.25rem 0.5rem;
  border-radius: 0.375rem;
  font-size: 0.75rem;
  font-weight: 500;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
  background: ${(backupNotes() || {})[backup.key] ? "${args.theme.var.color.info}" : "${args.theme.var.color.background_light_300}"};
  color: ${(backupNotes() || {})[backup.key] ? "${args.theme.var.color.info_text}" : "${args.theme.var.color.text}"};
  min-width: 60px;
}
._id:hover {
  background: ${(backupNotes() || {})[backup.key] ? "${args.theme.var.color.info_dark_200}" : "${args.theme.var.color.background_light_400}"};
}\`;`}
                              >
                                📝 Note
                              </As>
                            </As>
                          </Show>
                        </As>
                      );
                    }}
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
                  Are you sure you want to {type} backup:{" "}
                  <strong>{filename}</strong>?
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
                    All current data in the target database will be permanently
                    deleted and replaced with the backup data.
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
                      onChange={(e: Event) =>
                        setTargetDatabase((e.target as HTMLSelectElement).value)
                      }
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
                    onChange={(e: Event) =>
                      setRestoreConfirmed(
                        (e.target as HTMLInputElement).checked,
                      )
                    }
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
                    I understand this will DELETE all data in the target
                    database
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

      {/* Note Modal */}
      <Show when={noteModal()}>
        {() => {
          const modal = noteModal()!;
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
              onClick={() => setNoteModal(null)}
            >
              <As
                as="div"
                css={`return \`._id {
  background: \${args.theme.var.color.background};
  padding: 2rem;
  border-radius: 0.5rem;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  max-width: 500px;
  width: 90%;
}\`;`}
                onClick={(e: Event) => e.stopPropagation()}
              >
                <As
                  as="h3"
                  css={`return \`._id {
  margin: 0 0 1rem 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: \${args.theme.var.color.text};
}\`;`}
                >
                  📝 Backup Note
                </As>

                <As
                  as="div"
                  css={`return \`._id {
  margin-bottom: 1rem;
  padding: 0.75rem;
  background: \${args.theme.var.color.background_light_200};
  border-radius: 0.375rem;
  font-family: monospace;
  font-size: 0.875rem;
  color: \${args.theme.var.color.muted};
}\`;`}
                >
                  {modal.backupKey.split("/").pop()}
                </As>

                <As
                  as="textarea"
                  value={noteInput()}
                  onInput={(e: Event) =>
                    setNoteInput((e.target as HTMLTextAreaElement).value)
                  }
                  placeholder="Add a note for this backup (e.g., 'Before major deployment', 'Production rollback point', etc.)"
                  css={`return \`._id {
  width: 100%;
  min-height: 120px;
  padding: 0.75rem;
  border: 1px solid \${args.theme.var.color.border};
  border-radius: 0.375rem;
  font-family: inherit;
  font-size: 0.875rem;
  resize: vertical;
  background: \${args.theme.var.color.background};
  color: \${args.theme.var.color.text};
  margin-bottom: 1rem;
}
._id:focus {
  outline: none;
  border-color: \${args.theme.var.color.primary};
}\`;`}
                />

                <As
                  as="div"
                  css={`return \`._id {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
}\`;`}
                >
                  <As
                    as="button"
                    onClick={() => setNoteModal(null)}
                    css={`return \`._id {
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  border: none;
  background: \${args.theme.var.color.background_light_300};
  color: \${args.theme.var.color.text};
  transition: all 0.2s;
}
._id:hover {
  background: \${args.theme.var.color.background_light_400};
}\`;`}
                  >
                    Cancel
                  </As>
                  <As
                    as="button"
                    onClick={handleSaveNote}
                    css={`return \`._id {
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  border: none;
  background: \${args.theme.var.color.primary};
  color: \${args.theme.var.color.primary_text};
  transition: all 0.2s;
}
._id:hover {
  background: \${args.theme.var.color.primary_dark_200};
}\`;`}
                  >
                    💾 Save Note
                  </As>
                </As>
              </As>
            </As>
          );
        }}
      </Show>

      {/* Comparison Modal */}
      <Show when={comparisonModal()}>
        {() => {
          const modal = comparisonModal()!;
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
  overflow: auto;
}\`;`}
              onClick={() => setComparisonModal(null)}
            >
              <As
                as="div"
                css={`return \`._id {
  background: \${args.theme.var.color.background};
  padding: 2rem;
  border-radius: 0.5rem;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  max-width: 900px;
  width: 90%;
  max-height: 85vh;
  overflow: auto;
}\`;`}
                onClick={(e: Event) => e.stopPropagation()}
              >
                <As
                  as="h3"
                  css={`return \`._id {
  margin: 0 0 1.5rem 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: \${args.theme.var.color.text};
}\`;`}
                >
                  🔍 Backup Comparison
                </As>

                {/* Comparison Summary */}
                <As
                  as="div"
                  css={`return \`._id {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1.5rem;
}\`;`}
                >
                  <As
                    as="div"
                    css={`return \`._id {
  padding: 1rem;
  background: \${args.theme.var.color.error_light_900};
  border-radius: 0.375rem;
  border: 1px solid \${args.theme.var.color.error};
}\`;`}
                  >
                    <As
                      as="div"
                      css={`return \`._id {
  font-size: 0.75rem;
  color: \${args.theme.var.color.muted};
  margin-bottom: 0.5rem;
}\`;`}
                    >
                      Backup 1 (Older)
                    </As>
                    <As
                      as="div"
                      css={`return \`._id {
  font-family: monospace;
  font-size: 0.875rem;
  font-weight: 500;
  color: \${args.theme.var.color.error_dark_300};
}\`;`}
                    >
                      {modal.backup1.filename}
                    </As>
                    <As
                      as="div"
                      css={`return \`._id {
  font-size: 0.75rem;
  color: \${args.theme.var.color.muted};
  margin-top: 0.25rem;
}\`;`}
                    >
                      {modal.backup1.sizeFormatted} •{" "}
                      {new Date(
                        modal.backup1.lastModified,
                      ).toLocaleDateString()}
                    </As>
                  </As>

                  <As
                    as="div"
                    css={`return \`._id {
  padding: 1rem;
  background: \${args.theme.var.color.success_light_900};
  border-radius: 0.375rem;
  border: 1px solid \${args.theme.var.color.success};
}\`;`}
                  >
                    <As
                      as="div"
                      css={`return \`._id {
  font-size: 0.75rem;
  color: \${args.theme.var.color.muted};
  margin-bottom: 0.5rem;
}\`;`}
                    >
                      Backup 2 (Newer)
                    </As>
                    <As
                      as="div"
                      css={`return \`._id {
  font-family: monospace;
  font-size: 0.875rem;
  font-weight: 500;
  color: \${args.theme.var.color.success_dark_300};
}\`;`}
                    >
                      {modal.backup2.filename}
                    </As>
                    <As
                      as="div"
                      css={`return \`._id {
  font-size: 0.75rem;
  color: \${args.theme.var.color.muted};
  margin-top: 0.25rem;
}\`;`}
                    >
                      {modal.backup2.sizeFormatted} •{" "}
                      {new Date(
                        modal.backup2.lastModified,
                      ).toLocaleDateString()}
                    </As>
                  </As>
                </As>

                {/* Statistics */}
                <As
                  as="div"
                  css={`return \`._id {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}\`;`}
                >
                  <As
                    as="div"
                    css={`return \`._id {
  padding: 0.75rem 1rem;
  background: \${args.theme.var.color.info_light_900};
  border-radius: 0.375rem;
  border: 1px solid \${args.theme.var.color.info};
}\`;`}
                  >
                    <As
                      as="span"
                      css={`return \`._id {
  color: \${args.theme.var.color.info_dark_300};
  font-weight: 500;
  font-size: 0.875rem;
}\`;`}
                    >
                      📊 Size Diff: {modal.sizeDiff} MB
                    </As>
                  </As>
                  <As
                    as="div"
                    css={`return \`._id {
  padding: 0.75rem 1rem;
  background: \${args.theme.var.color.warning_light_900};
  border-radius: 0.375rem;
  border: 1px solid \${args.theme.var.color.warning};
}\`;`}
                  >
                    <As
                      as="span"
                      css={`return \`._id {
  color: \${args.theme.var.color.warning_dark_300};
  font-weight: 500;
  font-size: 0.875rem;
}\`;`}
                    >
                      ⏱️ Time Diff: {modal.timeDiff} days
                    </As>
                  </As>
                  <As
                    as="div"
                    css={`return \`._id {
  padding: 0.75rem 1rem;
  background: \${args.theme.var.color.primary_light_900};
  border-radius: 0.375rem;
  border: 1px solid \${args.theme.var.color.primary};
}\`;`}
                  >
                    <As
                      as="span"
                      css={`return \`._id {
  color: \${args.theme.var.color.primary_dark_300};
  font-weight: 500;
  font-size: 0.875rem;
}\`;`}
                    >
                      📝 Lines: {modal.diffData.totalLines1} →{" "}
                      {modal.diffData.totalLines2}
                    </As>
                  </As>
                </As>

                {/* Diff Display */}
                <As
                  as="div"
                  css={`return \`._id {
  margin-bottom: 1.5rem;
}\`;`}
                >
                  <As
                    as="h4"
                    css={`return \`._id {
  margin: 0 0 1rem 0;
  font-size: 1rem;
  font-weight: 600;
  color: \${args.theme.var.color.text};
}\`;`}
                  >
                    Content Differences{" "}
                    {modal.diffData.truncated ? "(First 100 changes)" : ""}
                  </As>

                  <Show
                    when={modal.diffData.differences.length > 0}
                    fallback={
                      <As
                        as="div"
                        css={`return \`._id {
  padding: 2rem;
  text-align: center;
  background: \${args.theme.var.color.success_light_900};
  border-radius: 0.375rem;
  color: \${args.theme.var.color.success_dark_300};
  font-weight: 500;
}\`;`}
                      >
                        ✅ No differences found - backups are identical!
                      </As>
                    }
                  >
                    <As
                      as="div"
                      css={`return \`._id {
  max-height: 400px;
  overflow-y: auto;
  background: \${args.theme.var.color.background_light_100};
  border: 1px solid \${args.theme.var.color.border};
  border-radius: 0.375rem;
  font-family: monospace;
  font-size: 0.75rem;
}\`;`}
                    >
                      <For each={modal.diffData.differences}>
                        {(diff: any) => (
                          <As
                            as="div"
                            css={`return \`._id {
  padding: 0.5rem 1rem;
  border-bottom: 1px solid \${args.theme.var.color.border};
  background: ${diff.type === "added" ? "${args.theme.var.color.success_light_900}" : diff.type === "removed" ? "${args.theme.var.color.error_light_900}" : "transparent"};
  color: ${diff.type === "added" ? "${args.theme.var.color.success_dark_300}" : diff.type === "removed" ? "${args.theme.var.color.error_dark_300}" : "${args.theme.var.color.text}"};
  display: flex;
  gap: 1rem;
}
._id:last-child {
  border-bottom: none;
}\`;`}
                          >
                            <As
                              as="span"
                              css={`return \`._id {
  color: \${args.theme.var.color.muted};
  min-width: 60px;
}\`;`}
                            >
                              Line {diff.lineNumber}
                            </As>
                            <As
                              as="span"
                              css={`return \`._id {
  min-width: 20px;
  font-weight: 600;
}\`;`}
                            >
                              {diff.type === "added"
                                ? "+"
                                : diff.type === "removed"
                                  ? "-"
                                  : " "}
                            </As>
                            <As
                              as="span"
                              css={`return \`._id {
  flex: 1;
  word-break: break-all;
}\`;`}
                            >
                              {diff.content || "(empty line)"}
                            </As>
                          </As>
                        )}
                      </For>
                    </As>
                  </Show>
                </As>

                {/* Close Button */}
                <As
                  as="div"
                  css={`return \`._id {
  display: flex;
  justify-content: flex-end;
}\`;`}
                >
                  <As
                    as="button"
                    onClick={() => setComparisonModal(null)}
                    css={`return \`._id {
  padding: 0.75rem 1.5rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  border: none;
  background: \${args.theme.var.color.primary};
  color: \${args.theme.var.color.primary_text};
  transition: all 0.2s;
}
._id:hover {
  background: \${args.theme.var.color.primary_dark_200};
}\`;`}
                  >
                    Close
                  </As>
                </As>
              </As>
            </As>
          );
        }}
      </Show>

      {/* Preview Modal */}
      <Show when={previewModal()}>
        {(modal) => {
          const preview = modal();
          return (
            <As
              as="div"
              onClick={() => setPreviewModal(null)}
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
  padding: 2rem;
}\`;`}
            >
              <As
                as="div"
                onClick={(e: Event) => e.stopPropagation()}
                css={`return \`._id {
  background: \${args.theme.var.color.background};
  border-radius: 0.5rem;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
  max-width: 900px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
}\`;`}
              >
                {/* Modal Header */}
                <As
                  as="div"
                  css={`return \`._id {
  padding: 2rem;
  border-bottom: 1px solid \${args.theme.var.color.border};
  background: \${args.theme.var.color.background_light_200};
}\`;`}
                >
                  <As
                    as="h2"
                    css={`return \`._id {
  margin: 0 0 0.5rem 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: \${args.theme.var.color.primary};
}\`;`}
                  >
                    👁️ Backup Preview
                  </As>
                  <As
                    as="div"
                    css={`return \`._id {
  font-size: 0.875rem;
  color: \${args.theme.var.color.muted};
  font-family: monospace;
}\`;`}
                  >
                    {preview.filename} ({preview.databaseName})
                  </As>
                </As>

                {/* Modal Body */}
                <As
                  as="div"
                  css={`return \`._id {
  padding: 2rem;
}\`;`}
                >
                  {/* Statistics Grid */}
                  <As
                    as="div"
                    css={`return \`._id {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}\`;`}
                  >
                    <As
                      as="div"
                      css={`return \`._id {
  padding: 1rem;
  background: \${args.theme.var.color.primary_light_900};
  border-radius: 0.375rem;
  text-align: center;
}\`;`}
                    >
                      <As
                        as="div"
                        css={`return \`._id {
  font-size: 1.5rem;
  font-weight: 600;
  color: \${args.theme.var.color.primary};
}\`;`}
                      >
                        {preview.totalLines.toLocaleString()}
                      </As>
                      <As
                        as="div"
                        css={`return \`._id {
  font-size: 0.75rem;
  color: \${args.theme.var.color.muted};
  margin-top: 0.25rem;
}\`;`}
                      >
                        Total Lines
                      </As>
                    </As>

                    <As
                      as="div"
                      css={`return \`._id {
  padding: 1rem;
  background: \${args.theme.var.color.success_light_900};
  border-radius: 0.375rem;
  text-align: center;
}\`;`}
                    >
                      <As
                        as="div"
                        css={`return \`._id {
  font-size: 1.5rem;
  font-weight: 600;
  color: \${args.theme.var.color.success};
}\`;`}
                      >
                        {preview.totalNodes.toLocaleString()}
                      </As>
                      <As
                        as="div"
                        css={`return \`._id {
  font-size: 0.75rem;
  color: \${args.theme.var.color.muted};
  margin-top: 0.25rem;
}\`;`}
                      >
                        Total Nodes
                      </As>
                    </As>

                    <As
                      as="div"
                      css={`return \`._id {
  padding: 1rem;
  background: \${args.theme.var.color.info_light_900};
  border-radius: 0.375rem;
  text-align: center;
}\`;`}
                    >
                      <As
                        as="div"
                        css={`return \`._id {
  font-size: 1.5rem;
  font-weight: 600;
  color: \${args.theme.var.color.info};
}\`;`}
                      >
                        {preview.totalRelationships.toLocaleString()}
                      </As>
                      <As
                        as="div"
                        css={`return \`._id {
  font-size: 0.75rem;
  color: \${args.theme.var.color.muted};
  margin-top: 0.25rem;
}\`;`}
                      >
                        Total Relationships
                      </As>
                    </As>
                  </As>

                  {/* Node Types */}
                  <As
                    as="div"
                    css={`return \`._id {
  margin-bottom: 2rem;
}\`;`}
                  >
                    <As
                      as="h3"
                      css={`return \`._id {
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 1rem 0;
  color: \${args.theme.var.color.success};
}\`;`}
                    >
                      📦 Node Types
                    </As>
                    <As
                      as="div"
                      css={`return \`._id {
  background: \${args.theme.var.color.background_light_100};
  border: 1px solid \${args.theme.var.color.border};
  border-radius: 0.375rem;
  padding: 1rem;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 0.5rem;
}\`;`}
                    >
                      <For
                        each={Object.entries(preview.nodeTypes)}
                        fallback={
                          <As
                            as="div"
                            css={`return \`._id {
  color: \${args.theme.var.color.muted};
  font-size: 0.875rem;
}\`;`}
                          >
                            No nodes found
                          </As>
                        }
                      >
                        {([label, count]) => (
                          <As
                            as="div"
                            css={`return \`._id {
  display: flex;
  justify-content: space-between;
  font-size: 0.875rem;
}\`;`}
                          >
                            <As
                              as="span"
                              css={`return \`._id {
  font-family: monospace;
  color: \${args.theme.var.color.text};
}\`;`}
                            >
                              {label}
                            </As>
                            <As
                              as="span"
                              css={`return \`._id {
  font-weight: 600;
  color: \${args.theme.var.color.success};
}\`;`}
                            >
                              {count as number}
                            </As>
                          </As>
                        )}
                      </For>
                    </As>
                  </As>

                  {/* Relationship Types */}
                  <As
                    as="div"
                    css={`return \`._id {
  margin-bottom: 2rem;
}\`;`}
                  >
                    <As
                      as="h3"
                      css={`return \`._id {
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 1rem 0;
  color: \${args.theme.var.color.info};
}\`;`}
                    >
                      🔗 Relationship Types
                    </As>
                    <As
                      as="div"
                      css={`return \`._id {
  background: \${args.theme.var.color.background_light_100};
  border: 1px solid \${args.theme.var.color.border};
  border-radius: 0.375rem;
  padding: 1rem;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 0.5rem;
}\`;`}
                    >
                      <For
                        each={Object.entries(preview.relationshipTypes)}
                        fallback={
                          <As
                            as="div"
                            css={`return \`._id {
  color: \${args.theme.var.color.muted};
  font-size: 0.875rem;
}\`;`}
                          >
                            No relationships found
                          </As>
                        }
                      >
                        {([type, count]) => (
                          <As
                            as="div"
                            css={`return \`._id {
  display: flex;
  justify-content: space-between;
  font-size: 0.875rem;
}\`;`}
                          >
                            <As
                              as="span"
                              css={`return \`._id {
  font-family: monospace;
  color: \${args.theme.var.color.text};
}\`;`}
                            >
                              {type}
                            </As>
                            <As
                              as="span"
                              css={`return \`._id {
  font-weight: 600;
  color: \${args.theme.var.color.info};
}\`;`}
                            >
                              {count as number}
                            </As>
                          </As>
                        )}
                      </For>
                    </As>
                  </As>

                  {/* Preview Lines */}
                  <As as="div">
                    <As
                      as="h3"
                      css={`return \`._id {
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 1rem 0;
}\`;`}
                    >
                      📄 First 50 Lines
                    </As>
                    <As
                      as="pre"
                      css={`return \`._id {
  background: \${args.theme.var.color.background_dark_800};
  color: \${args.theme.var.color.background_dark_800_text};
  border: 1px solid \${args.theme.var.color.border};
  border-radius: 0.375rem;
  padding: 1rem;
  font-family: monospace;
  font-size: 0.75rem;
  max-height: 400px;
  overflow: auto;
  line-height: 1.5;
}\`;`}
                    >
                      {preview.previewLines.join("\n")}
                    </As>
                  </As>
                </As>

                {/* Modal Footer */}
                <As
                  as="div"
                  css={`return \`._id {
  padding: 1.5rem 2rem;
  border-top: 1px solid \${args.theme.var.color.border};
  display: flex;
  justify-content: flex-end;
}\`;`}
                >
                  <As
                    as="button"
                    onClick={() => setPreviewModal(null)}
                    css={`return \`._id {
  padding: 0.625rem 1.5rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  border: none;
  background: \${args.theme.var.color.primary};
  color: \${args.theme.var.color.primary_text};
  transition: background 0.2s;
}
._id:hover {
  background: \${args.theme.var.color.primary_dark_200};
}\`;`}
                  >
                    Close
                  </As>
                </As>
              </As>
            </As>
          );
        }}
      </Show>

      {/* Upload Backup Modal */}
      <Show when={uploadModal()}>
        {() => {
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
                if (!isUploading()) {
                  setUploadModal(false);
                  setUploadFile(null);
                  setUploadTargetDb("");
                  setUploadShouldRestore(false);
                  setUploadConfirmed(false);
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
  margin: 0 0 1.5rem 0;
  font-size: 1.25rem;
}\`;`}
                >
                  ⬆️ Upload Backup File
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
                      Select Backup File (.gz):
                    </As>
                    <As
                      as="input"
                      type="file"
                      accept=".gz"
                      onChange={(e: Event) => {
                        const target = e.target as HTMLInputElement;
                        const file = target.files?.[0];
                        if (file) {
                          setUploadFile(file);
                        }
                      }}
                      css={`return \`._id {
  padding: 0.75rem;
  border: 1px solid \${args.theme.var.color.border};
  border-radius: 0.375rem;
  background: \${args.theme.var.color.background};
  color: \${args.theme.var.color.text};
  font-size: 0.875rem;
  cursor: pointer;
}
._id:focus {
  outline: none;
  border-color: \${args.theme.var.color.primary};
}\`;`}
                    />
                    <Show when={uploadFile()}>
                      <As
                        as="div"
                        css={`return \`._id {
  font-size: 0.875rem;
  color: \${args.theme.var.color.muted};
  padding: 0.5rem;
  background: \${args.theme.var.color.background_light_200};
  border-radius: 0.375rem;
}\`;`}
                      >
                        Selected: {uploadFile()!.name} (
                        {(uploadFile()!.size / (1024 * 1024)).toFixed(2)} MB)
                      </As>
                    </Show>
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
                      Target Database:
                    </As>
                    <As
                      as="select"
                      value={uploadTargetDb()}
                      onChange={(e: Event) =>
                        setUploadTargetDb((e.target as HTMLSelectElement).value)
                      }
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
                        Select database...
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

                  <As
                    as="div"
                    css={`return \`._id {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
  padding: 1rem;
  background: \${args.theme.var.color.background_light_200};
  border-radius: 0.375rem;
}\`;`}
                  >
                    <As
                      as="input"
                      type="checkbox"
                      checked={uploadShouldRestore()}
                      onChange={(e: Event) =>
                        setUploadShouldRestore(
                          (e.target as HTMLInputElement).checked,
                        )
                      }
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
  color: \${args.theme.var.color.text};
  cursor: pointer;
}\`;`}
                      onClick={() => setUploadShouldRestore(!uploadShouldRestore())}
                    >
                      Restore to database immediately without upload
                    </As>
                  </As>

                  <Show when={uploadShouldRestore()}>
                    <As
                      as="div"
                      css={`return \`._id {
  background: \${args.theme.var.color.warning_light_900};
  border: 1px solid \${args.theme.var.color.warning};
  border-radius: 0.375rem;
  padding: 1rem;
  margin-bottom: 1rem;
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
                        ⚠️ WARNING: This will DELETE all existing data!
                      </As>
                      <As
                        as="p"
                        css={`return \`._id {
  margin: 0;
  color: \${args.theme.var.color.warning_dark_300};
  font-size: 0.875rem;
}\`;`}
                      >
                        All current data in the target database will be
                        permanently deleted and replaced with the backup data.
                      </As>
                    </As>

                    <As
                      as="div"
                      css={`return \`._id {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: \${args.theme.var.color.error_light_900};
  border-radius: 0.375rem;
  border: 1px solid \${args.theme.var.color.error};
  margin-bottom: 1rem;
}\`;`}
                    >
                      <As
                        as="input"
                        type="checkbox"
                        checked={uploadConfirmed()}
                        onChange={(e: Event) =>
                          setUploadConfirmed(
                            (e.target as HTMLInputElement).checked,
                          )
                        }
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
                        onClick={() => setUploadConfirmed(!uploadConfirmed())}
                      >
                        I understand this will DELETE all data in the target
                        database
                      </As>
                    </As>
                  </Show>
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
                      if (!isUploading()) {
                        setUploadModal(false);
                        setUploadFile(null);
                        setUploadTargetDb("");
                        setUploadShouldRestore(false);
                        setUploadConfirmed(false);
                      }
                    }}
                    disabled={isUploading()}
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
                    onClick={handleUploadBackup}
                    disabled={!uploadFile() || !uploadTargetDb() || isUploading()}
                    css={`return \`._id {
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  border: none;
  background: \${args.theme.var.color.primary};
  color: \${args.theme.var.color.primary_text};
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
._id:hover:not(:disabled) {
  background: \${args.theme.var.color.primary_dark_200};
}
._id:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}\`;`}
                  >
                    <Show
                      when={isUploading()}
                      fallback={
                        <>
                          {uploadShouldRestore()
                            ? "⬆️ Upload & Restore"
                            : "⬆️ Upload"}
                        </>
                      }
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
                      <As as="span">Uploading...</As>
                    </Show>
                  </As>
                </As>
              </As>
            </As>
          );
        }}
      </Show>

      {/* Error state */}
      <Show
        when={
          backupStatus()?.error || cloudBackups()?.error || subdomains()?.error
        }
      >
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
          {backupStatus()?.error ||
            cloudBackups()?.error ||
            subdomains()?.error}
        </As>
      </Show>
    </As>
  );
}
