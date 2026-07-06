import { createAsync } from "@solidjs/router";
import { createSignal, For, Show, createMemo } from "solid-js";
import { useToast } from "~/components/styled/modal/Toast";
import { As } from "~/components/As";
import {
  getAllRedisQueues,
  deleteQueue,
  cleanQueue,
  getJobsByState,
  getJobCount,
  deleteJob,
  retryFailedJobs,
  pauseQueue,
  resumeQueue,
  getRedisInfo,
  deleteRedisKeys,
  emptyQueue,
} from "~/server/redis/redisManagement";

interface QueueInfo {
  name: string;
  waiting: number;
  active: number;
  completed: number;
  failed: number;
  delayed: number;
  paused: boolean;
  total: number;
}

interface JobInfo {
  id: string;
  name: string;
  data: any;
  timestamp: number;
  processedOn?: number;
  finishedOn?: number;
  failedReason?: string;
  attemptsMade?: number;
  returnvalue?: any;
}

export function RedisManagement() {
  const { showSuccessToast, showErrorToast } = useToast();
  const [refreshKey, setRefreshKey] = createSignal(0);
  const [selectedQueue, setSelectedQueue] = createSignal<string | null>(null);
  const [expandedQueue, setExpandedQueue] = createSignal<string | null>(null);
  const [selectedJob, setSelectedJob] = createSignal<JobInfo | null>(null);
  const [selectedState, setSelectedState] = createSignal<
    "waiting" | "active" | "completed" | "failed" | "delayed"
  >("waiting");
  const [searchPattern, setSearchPattern] = createSignal("");
  const [confirmAction, setConfirmAction] = createSignal<string | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = createSignal(1);
  const [pageSize, setPageSize] = createSignal(
    parseInt(localStorage.getItem("redisJobPageSize") || "50"),
  );

  // Search and filter state
  const [jobSearchQuery, setJobSearchQuery] = createSignal("");
  const [attemptFilter, setAttemptFilter] = createSignal<{
    min?: number;
    max?: number;
  }>({});

  // Bulk selection state
  const [selectedJobs, setSelectedJobs] = createSignal<Set<string>>(new Set());

  const queues = createAsync(
    async () => {
      refreshKey();
      return await getAllRedisQueues();
    },
    { deferStream: true },
  );

  const jobs = createAsync(
    async () => {
      refreshKey(); // Add dependency on refreshKey to trigger refetch
      const queue = expandedQueue();
      const state = selectedState();
      const page = currentPage();
      const size = pageSize();
      if (!queue) return null;

      // Calculate start and end for pagination
      const start = (page - 1) * size;
      const end = start + size - 1;

      return await getJobsByState(queue, state, start, end);
    },
    { deferStream: true },
  );

  const jobCount = createAsync(
    async () => {
      refreshKey();
      const queue = expandedQueue();
      const state = selectedState();
      if (!queue) return null;
      return await getJobCount(queue, state);
    },
    { deferStream: true },
  );

  const redisInfo = createAsync(
    async () => {
      refreshKey();
      return await getRedisInfo();
    },
    { deferStream: true },
  );

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
    showSuccessToast("Refreshed successfully");
  };

  const handleDeleteQueue = async (queueName: string) => {
    const result = await deleteQueue(queueName);
    if (result.success) {
      showSuccessToast(result.message);
      setSelectedQueue(null);
      setRefreshKey((prev) => prev + 1);
    } else {
      showErrorToast(result.error || "Failed to delete queue");
    }
    setConfirmAction(null);
  };

  const handleCleanQueue = async (
    queueName: string,
    state: "completed" | "failed" | "delayed" | "wait" | "active",
  ) => {
    const result = await cleanQueue(queueName, state);
    if (result.success) {
      showSuccessToast(result.message);
      setRefreshKey((prev) => prev + 1);
    } else {
      showErrorToast(result.error || "Failed to clean queue");
    }
    setConfirmAction(null);
  };

  const handleEmptyQueue = async (queueName: string) => {
    const result = await emptyQueue(queueName);
    if (result.success) {
      showSuccessToast(result.message);
      setRefreshKey((prev) => prev + 1);
    } else {
      showErrorToast(result.error || "Failed to empty queue");
    }
    setConfirmAction(null);
  };

  const handlePauseQueue = async (queueName: string) => {
    const result = await pauseQueue(queueName);
    if (result.success) {
      showSuccessToast(result.message);
      setRefreshKey((prev) => prev + 1);
    } else {
      showErrorToast(result.error || "Failed to pause queue");
    }
  };

  const handleResumeQueue = async (queueName: string) => {
    const result = await resumeQueue(queueName);
    if (result.success) {
      showSuccessToast(result.message);
      setRefreshKey((prev) => prev + 1);
    } else {
      showErrorToast(result.error || "Failed to resume queue");
    }
  };

  const handleRetryFailedJobs = async (queueName: string) => {
    const result = await retryFailedJobs(queueName);
    if (result.success) {
      showSuccessToast(result.message);
      setRefreshKey((prev) => prev + 1);
    } else {
      showErrorToast(result.error || "Failed to retry jobs");
    }
    setConfirmAction(null);
  };

  const handleDeleteJob = async (queueName: string, jobId: string) => {
    const result = await deleteJob(queueName, jobId);
    if (result.success) {
      showSuccessToast(result.message);
      setRefreshKey((prev) => prev + 1);
    } else {
      showErrorToast(result.error || "Failed to delete job");
    }
  };

  const handleDeleteKeysByPattern = async () => {
    const pattern = searchPattern();
    if (!pattern) {
      showErrorToast("Please enter a key pattern");
      return;
    }

    const result = await deleteRedisKeys(pattern);
    if (result.success) {
      showSuccessToast(result.message);
      setSearchPattern("");
      setRefreshKey((prev) => prev + 1);
    } else {
      showErrorToast(result.error || "Failed to delete keys");
    }
    setConfirmAction(null);
  };

  const handleToggleQueue = (queueName: string) => {
    if (expandedQueue() === queueName) {
      setExpandedQueue(null);
    } else {
      setExpandedQueue(queueName);
      setSelectedState("waiting");
      setCurrentPage(1);
      setJobSearchQuery("");
      setAttemptFilter({});
      setSelectedJobs(new Set());
    }
  };

  const handleRetryJob = async (queueName: string, jobId: string) => {
    const result = await retryFailedJobs(queueName, [jobId]);
    if (result.success) {
      showSuccessToast(`Job ${jobId} retried successfully`);
      setRefreshKey((prev) => prev + 1);
    } else {
      showErrorToast(result.error || "Failed to retry job");
    }
  };

  // Pagination handlers
  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1); // Reset to first page
    localStorage.setItem("redisJobPageSize", size.toString());
  };

  const handleNextPage = () => {
    const total = jobCount()?.count || 0;
    const maxPage = Math.ceil(total / pageSize());
    if (currentPage() < maxPage) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage() > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  // Bulk selection handlers
  const handleToggleJobSelection = (jobId: string) => {
    setSelectedJobs((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(jobId)) {
        newSet.delete(jobId);
      } else {
        newSet.add(jobId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    const allJobIds = jobs()?.data?.map((j) => j.id) || [];
    setSelectedJobs(new Set(allJobIds));
  };

  const handleDeselectAll = () => {
    setSelectedJobs(new Set());
  };

  const handleBulkDelete = async () => {
    const queueName = expandedQueue();
    if (!queueName) return;

    const jobIds = Array.from(selectedJobs());
    let successCount = 0;
    let errorCount = 0;

    for (const jobId of jobIds) {
      const result = await deleteJob(queueName, jobId);
      if (result.success) {
        successCount++;
      } else {
        errorCount++;
      }
    }

    if (successCount > 0) {
      showSuccessToast(`Deleted ${successCount} job(s)`);
    }
    if (errorCount > 0) {
      showErrorToast(`Failed to delete ${errorCount} job(s)`);
    }

    setSelectedJobs(new Set());
    setRefreshKey((prev) => prev + 1);
    setConfirmAction(null);
  };

  const handleBulkRetry = async () => {
    const queueName = expandedQueue();
    if (!queueName) return;

    const jobIds = Array.from(selectedJobs());
    const result = await retryFailedJobs(queueName, jobIds);

    if (result.success) {
      showSuccessToast(result.message);
    } else {
      showErrorToast(result.error || "Failed to retry jobs");
    }

    setSelectedJobs(new Set());
    setRefreshKey((prev) => prev + 1);
    setConfirmAction(null);
  };

  // Filtered jobs based on search and filters
  const filteredJobs = createMemo(() => {
    const jobsList = jobs()?.data || [];
    const searchQuery = jobSearchQuery().toLowerCase();
    const attemptFilters = attemptFilter();

    return jobsList.filter((job) => {
      // Search filter
      if (searchQuery) {
        const matchesId = job.id.toLowerCase().includes(searchQuery);
        const matchesName = job.name.toLowerCase().includes(searchQuery);
        const matchesData = JSON.stringify(job.data)
          .toLowerCase()
          .includes(searchQuery);
        if (!(matchesId || matchesName || matchesData)) {
          return false;
        }
      }

      // Attempt count filter
      if (
        attemptFilters.min !== undefined &&
        (job.attemptsMade || 0) < attemptFilters.min
      ) {
        return false;
      }
      if (
        attemptFilters.max !== undefined &&
        (job.attemptsMade || 0) > attemptFilters.max
      ) {
        return false;
      }

      return true;
    });
  });

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

  const formatJSON = (obj: any) => {
    try {
      return JSON.stringify(obj, null, 2);
    } catch (e) {
      return String(obj);
    }
  };

  const filteredQueues = () => {
    const data = queues()?.data || [];
    const search = searchPattern().toLowerCase();
    if (!search) return data;
    return data.filter((q) => q.name.toLowerCase().includes(search));
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
          Redis Data Management
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

      {/* Redis Info Section */}
      <Show when={redisInfo()?.success}>
        {() => {
          const info = redisInfo()!.data;
          return (
            <As
              as="div"
              css={`return \`._id {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}\`;`}
            >
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
  color: \${args.theme.var.color.text_light_500};
  margin: 0 0 0.5rem 0;
  text-transform: uppercase;
}\`;`}
                >
                  Total Keys
                </As>
                <As
                  as="p"
                  css={`return \`._id {
  font-size: 1.875rem;
  font-weight: 600;
  margin: 0;
}\`;`}
                >
                  {info.dbSize.toLocaleString()}
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
  color: \${args.theme.var.color.text_light_500};
  margin: 0 0 0.5rem 0;
  text-transform: uppercase;
}\`;`}
                >
                  Memory Used
                </As>
                <As
                  as="p"
                  css={`return \`._id {
  font-size: 1.875rem;
  font-weight: 600;
  margin: 0;
}\`;`}
                >
                  {info.usedMemory}
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
  color: \${args.theme.var.color.text_light_500};
  margin: 0 0 0.5rem 0;
  text-transform: uppercase;
}\`;`}
                >
                  Peak Memory
                </As>
                <As
                  as="p"
                  css={`return \`._id {
  font-size: 1.875rem;
  font-weight: 600;
  margin: 0;
}\`;`}
                >
                  {info.peakMemory}
                </As>
              </As>
            </As>
          );
        }}
      </Show>

      {/* Search and Bulk Actions */}
      <As
        as="div"
        css={`return \`._id {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  align-items: center;
}\`;`}
      >
        <As
          as="input"
          type="text"
          placeholder="Search queues or enter key pattern..."
          value={searchPattern()}
          onInput={(e) => setSearchPattern(e.currentTarget.value)}
          css={`return \`._id {
  flex: 1;
  padding: 0.625rem 1rem;
  border: 1px solid \${args.theme.var.color.border};
  border-radius: 0.375rem;
  font-size: 0.875rem;
  background: \${args.theme.var.color.background};
  color: \${args.theme.var.color.text};
}
._id:focus {
  outline: none;
  border-color: \${args.theme.var.color.primary};
}\`;`}
        />
        <As
          as="button"
          onClick={() => setConfirmAction("deleteKeys")}
          disabled={!searchPattern()}
          css={`return \`._id {
  padding: 0.625rem 1.25rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
  background: \${args.theme.var.color.error};
  color: \${args.theme.var.color.error_text};
}
._id:hover:not(:disabled) {
  background: \${args.theme.var.color.error_dark_200};
}
._id:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}\`;`}
        >
          Delete Keys by Pattern
        </As>
      </As>

      {/* Queue List */}
      <Show
        when={queues()?.success}
        fallback={
          <As
            as="div"
            css={`return \`._id {
  padding: 3rem;
  text-align: center;
  color: \${args.theme.var.color.text_light_500};
}\`;`}
          >
            {queues()?.error || "Loading queues..."}
          </As>
        }
      >
        <Show
          when={filteredQueues().length > 0}
          fallback={
            <As
              as="div"
              css={`return \`._id {
  padding: 3rem;
  text-align: center;
  color: \${args.theme.var.color.text_light_500};
}\`;`}
            >
              No queues found
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
              as="div"
              css={`return \`._id {
  background: \${args.theme.var.color.background_light_200};
  padding: 1rem 1.5rem;
  font-weight: 600;
  font-size: 0.875rem;
  display: grid;
  grid-template-columns: 2fr 80px 80px 80px 80px 80px 80px 200px;
  gap: 1rem;
}\`;`}
            >
              <As as="div">Queue Name</As>
              <As as="div">Waiting</As>
              <As as="div">Active</As>
              <As as="div">Done</As>
              <As as="div">Failed</As>
              <As as="div">Delayed</As>
              <As as="div">Status</As>
              <As as="div">Actions</As>
            </As>
            <For each={filteredQueues()}>
              {(queue: QueueInfo) => (
                <As
                  as="div"
                  css={`return \`._id {
  padding: 1rem 1.5rem;
  border-top: 1px solid \${args.theme.var.color.border};
  display: grid;
  grid-template-columns: 2fr 80px 80px 80px 80px 80px 80px 200px;
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
  font-weight: 500;
  font-family: monospace;
  cursor: pointer;
  color: \${args.theme.var.color.primary};
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
._id:hover {
  text-decoration: underline;
}\`;`}
                    onClick={() => handleToggleQueue(queue.name)}
                  >
                    <As as="span">
                      {expandedQueue() === queue.name ? "▼" : "▶"}
                    </As>
                    <As as="span">{queue.name}</As>
                  </As>
                  <As as="div">{queue.waiting}</As>
                  <As as="div">{queue.active}</As>
                  <As as="div">{queue.completed}</As>
                  <As
                    as="div"
                    css={`return \`._id {
  color: ${queue.failed > 0 ? "${args.theme.var.color.error}" : "inherit"};
  font-weight: ${queue.failed > 0 ? "600" : "normal"};
}\`;`}
                  >
                    {queue.failed}
                  </As>
                  <As as="div">{queue.delayed}</As>
                  <As as="div">
                    <As
                      as="span"
                      css={`return \`._id {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
  background: ${queue.paused ? "${args.theme.var.color.warning_light_900}" : "${args.theme.var.color.success_light_900}"};
  color: ${queue.paused ? "${args.theme.var.color.warning_dark_300}" : "${args.theme.var.color.success_dark_300}"};
}\`;`}
                    >
                      {queue.paused ? "Paused" : "Active"}
                    </As>
                  </As>
                  <As
                    as="div"
                    css={`return \`._id {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}\`;`}
                  >
                    <Show when={!queue.paused}>
                      <As
                        as="button"
                        onClick={() => handlePauseQueue(queue.name)}
                        css={`return \`._id {
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
  border-radius: 0.25rem;
  cursor: pointer;
  border: none;
  font-weight: 500;
  transition: all 0.2s;
  background: \${args.theme.var.color.warning};
  color: \${args.theme.var.color.warning_text};
}
._id:hover {
  background: \${args.theme.var.color.warning_dark_200};
}\`;`}
                      >
                        Pause
                      </As>
                    </Show>
                    <Show when={queue.paused}>
                      <As
                        as="button"
                        onClick={() => handleResumeQueue(queue.name)}
                        css={`return \`._id {
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
  border-radius: 0.25rem;
  cursor: pointer;
  border: none;
  font-weight: 500;
  transition: all 0.2s;
  background: \${args.theme.var.color.success};
  color: \${args.theme.var.color.success_text};
}
._id:hover {
  background: \${args.theme.var.color.success_dark_200};
}\`;`}
                      >
                        Resume
                      </As>
                    </Show>
                    <As
                      as="button"
                      onClick={() => setConfirmAction(`empty:${queue.name}`)}
                      css={`return \`._id {
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
  border-radius: 0.25rem;
  cursor: pointer;
  border: none;
  font-weight: 500;
  transition: all 0.2s;
  background: \${args.theme.var.color.background_dark_300};
  color: \${args.theme.var.color.background_dark_300_text};
}
._id:hover {
  background: \${args.theme.var.color.background_dark_400};
}\`;`}
                    >
                      Empty
                    </As>
                    <As
                      as="button"
                      onClick={() => setConfirmAction(`delete:${queue.name}`)}
                      css={`return \`._id {
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
  border-radius: 0.25rem;
  cursor: pointer;
  border: none;
  font-weight: 500;
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
                  </As>

                  {/* Expandable Job Section */}
                  <Show when={expandedQueue() === queue.name}>
                    <As
                      as="div"
                      css={`return \`._id {
  grid-column: 1 / -1;
  padding: 1.5rem;
  background: \${args.theme.var.color.background_light_100};
  border-top: 1px solid \${args.theme.var.color.border};
  margin-top: 1rem;
}\`;`}
                    >
                      {/* Bulk Action Bar */}
                      <Show when={selectedJobs().size > 0}>
                        <As
                          as="div"
                          css={`return \`._id {
  background: \${args.theme.var.color.primary_light_900};
  border: 1px solid \${args.theme.var.color.primary};
  border-radius: 0.375rem;
  padding: 1rem 1.5rem;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}\`;`}
                        >
                          <As
                            as="div"
                            css={`return \`._id {
  font-weight: 500;
  color: \${args.theme.var.color.primary_dark_300};
}\`;`}
                          >
                            {selectedJobs().size} job(s) selected
                          </As>
                          <As
                            as="div"
                            css={`return \`._id {
  display: flex;
  gap: 0.5rem;
}\`;`}
                          >
                            <Show when={selectedState() === "failed"}>
                              <As
                                as="button"
                                onClick={() =>
                                  setConfirmAction(`bulkRetry:${queue.name}`)
                                }
                                css={`return \`._id {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  border-radius: 0.375rem;
  cursor: pointer;
  border: none;
  font-weight: 500;
  transition: all 0.2s;
  background: \${args.theme.var.color.success};
  color: \${args.theme.var.color.success_text};
}
._id:hover {
  background: \${args.theme.var.color.success_dark_200};
}\`;`}
                              >
                                Retry Selected
                              </As>
                            </Show>
                            <As
                              as="button"
                              onClick={() =>
                                setConfirmAction(`bulkDelete:${queue.name}`)
                              }
                              css={`return \`._id {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  border-radius: 0.375rem;
  cursor: pointer;
  border: none;
  font-weight: 500;
  transition: all 0.2s;
  background: \${args.theme.var.color.error};
  color: \${args.theme.var.color.error_text};
}
._id:hover {
  background: \${args.theme.var.color.error_dark_200};
}\`;`}
                            >
                              Delete Selected
                            </As>
                            <As
                              as="button"
                              onClick={handleDeselectAll}
                              css={`return \`._id {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  border-radius: 0.375rem;
  cursor: pointer;
  border: 1px solid \${args.theme.var.color.border};
  background: \${args.theme.var.color.background};
  color: \${args.theme.var.color.text};
  font-weight: 500;
  transition: all 0.2s;
}
._id:hover {
  background: \${args.theme.var.color.background_light_200};
}\`;`}
                            >
                              Clear Selection
                            </As>
                          </As>
                        </As>
                      </Show>

                      {/* Search and Filters */}
                      <As
                        as="div"
                        css={`return \`._id {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  align-items: center;
  flex-wrap: wrap;
}\`;`}
                      >
                        <As
                          as="input"
                          type="text"
                          placeholder="Search by job ID, name, or data..."
                          value={jobSearchQuery()}
                          onInput={(e) =>
                            setJobSearchQuery(e.currentTarget.value)
                          }
                          css={`return \`._id {
  flex: 1;
  min-width: 250px;
  padding: 0.625rem 1rem;
  border: 1px solid \${args.theme.var.color.border};
  border-radius: 0.375rem;
  font-size: 0.875rem;
  background: \${args.theme.var.color.background};
  color: \${args.theme.var.color.text};
}
._id:focus {
  outline: none;
  border-color: \${args.theme.var.color.primary};
}\`;`}
                        />
                        <As
                          as="input"
                          type="number"
                          placeholder="Min attempts"
                          value={attemptFilter().min || ""}
                          onInput={(e) =>
                            setAttemptFilter((prev) => ({
                              ...prev,
                              min: e.currentTarget.value
                                ? parseInt(e.currentTarget.value)
                                : undefined,
                            }))
                          }
                          css={`return \`._id {
  width: 120px;
  padding: 0.625rem 1rem;
  border: 1px solid \${args.theme.var.color.border};
  border-radius: 0.375rem;
  font-size: 0.875rem;
  background: \${args.theme.var.color.background};
  color: \${args.theme.var.color.text};
}
._id:focus {
  outline: none;
  border-color: \${args.theme.var.color.primary};
}\`;`}
                        />
                        <As
                          as="input"
                          type="number"
                          placeholder="Max attempts"
                          value={attemptFilter().max || ""}
                          onInput={(e) =>
                            setAttemptFilter((prev) => ({
                              ...prev,
                              max: e.currentTarget.value
                                ? parseInt(e.currentTarget.value)
                                : undefined,
                            }))
                          }
                          css={`return \`._id {
  width: 120px;
  padding: 0.625rem 1rem;
  border: 1px solid \${args.theme.var.color.border};
  border-radius: 0.375rem;
  font-size: 0.875rem;
  background: \${args.theme.var.color.background};
  color: \${args.theme.var.color.text};
}
._id:focus {
  outline: none;
  border-color: \${args.theme.var.color.primary};
}\`;`}
                        />
                        <Show
                          when={
                            jobSearchQuery() ||
                            attemptFilter().min ||
                            attemptFilter().max
                          }
                        >
                          <As
                            as="button"
                            onClick={() => {
                              setJobSearchQuery("");
                              setAttemptFilter({});
                            }}
                            css={`return \`._id {
  padding: 0.625rem 1rem;
  font-size: 0.875rem;
  border-radius: 0.375rem;
  cursor: pointer;
  border: 1px solid \${args.theme.var.color.border};
  background: \${args.theme.var.color.background};
  color: \${args.theme.var.color.text};
  font-weight: 500;
  transition: all 0.2s;
  white-space: nowrap;
}
._id:hover {
  background: \${args.theme.var.color.background_light_200};
}\`;`}
                          >
                            Clear Filters
                          </As>
                        </Show>
                        <Show
                          when={
                            filteredJobs().length !==
                            (jobs()?.data?.length || 0)
                          }
                        >
                          <As
                            as="div"
                            css={`return \`._id {
  font-size: 0.875rem;
  color: \${args.theme.var.color.text_light_500};
  white-space: nowrap;
}\`;`}
                          >
                            {filteredJobs().length} of{" "}
                            {jobs()?.data?.length || 0} jobs
                          </As>
                        </Show>
                      </As>

                      {/* State Filter Tabs */}
                      <As
                        as="div"
                        css={`return \`._id {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  border-bottom: 2px solid \${args.theme.var.color.border};
}\`;`}
                      >
                        <For
                          each={
                            [
                              "waiting",
                              "active",
                              "completed",
                              "failed",
                              "delayed",
                            ] as const
                          }
                        >
                          {(state) => (
                            <As
                              as="button"
                              onClick={() => {
                                setSelectedState(state);
                                setCurrentPage(1);
                                setSelectedJobs(new Set());
                              }}
                              css={`return \`._id {
  padding: 0.75rem 1.5rem;
  border: none;
  background: none;
  cursor: pointer;
  font-weight: 500;
  font-size: 0.875rem;
  color: ${selectedState() === state ? "${args.theme.var.color.primary}" : "${args.theme.var.color.text_light_500}"};
  border-bottom: 2px solid ${selectedState() === state ? "${args.theme.var.color.primary}" : "transparent"};
  margin-bottom: -2px;
  transition: all 0.2s;
  text-transform: capitalize;
}
._id:hover {
  color: \${args.theme.var.color.primary};
}\`;`}
                            >
                              {state}
                            </As>
                          )}
                        </For>
                      </As>

                      {/* Job List */}
                      <Show
                        when={jobs()?.success}
                        fallback={
                          <As
                            as="div"
                            css={`return \`._id {
  padding: 2rem;
  text-align: center;
  color: \${args.theme.var.color.text_light_500};
}\`;`}
                          >
                            Loading jobs...
                          </As>
                        }
                      >
                        <Show
                          when={filteredJobs().length > 0}
                          fallback={
                            <As
                              as="div"
                              css={`return \`._id {
  padding: 2rem;
  text-align: center;
  color: \${args.theme.var.color.text_light_500};
}\`;`}
                            >
                              No {selectedState()} jobs found
                            </As>
                          }
                        >
                          <As
                            as="div"
                            css={`return \`._id {
  border: 1px solid \${args.theme.var.color.border};
  border-radius: 0.375rem;
  overflow: hidden;
}\`;`}
                          >
                            {/* Job Table Header */}
                            <As
                              as="div"
                              css={`return \`._id {
  background: \${args.theme.var.color.background_light_300};
  padding: 0.75rem 1rem;
  font-weight: 600;
  font-size: 0.8125rem;
  display: grid;
  grid-template-columns: 40px 150px 120px 2fr 120px 80px 200px;
  gap: 1rem;
  color: \${args.theme.var.color.text_light_500};
  align-items: center;
}\`;`}
                            >
                              <As
                                as="input"
                                type="checkbox"
                                checked={
                                  filteredJobs().length > 0 &&
                                  filteredJobs().every((j) =>
                                    selectedJobs().has(j.id),
                                  )
                                }
                                onChange={() => {
                                  if (
                                    filteredJobs().every((j) =>
                                      selectedJobs().has(j.id),
                                    )
                                  ) {
                                    handleDeselectAll();
                                  } else {
                                    handleSelectAll();
                                  }
                                }}
                                css={`return \`._id {
  width: 18px;
  height: 18px;
  cursor: pointer;
}\`;`}
                              />
                              <As as="div">Job ID</As>
                              <As as="div">Job Name</As>
                              <As as="div">Data Preview</As>
                              <As as="div">Timestamp</As>
                              <As as="div">Attempts</As>
                              <As as="div">Actions</As>
                            </As>

                            {/* Job Rows */}
                            <For each={filteredJobs()}>
                              {(job: JobInfo) => (
                                <As
                                  as="div"
                                  css={`return \`._id {
  padding: 0.75rem 1rem;
  border-top: 1px solid \${args.theme.var.color.border};
  display: grid;
  grid-template-columns: 40px 150px 120px 2fr 120px 80px 200px;
  gap: 1rem;
  align-items: center;
  background: \${args.theme.var.color.background};
  transition: background 0.2s;
  font-size: 0.8125rem;
}
._id:hover {
  background: \${args.theme.var.color.background_light_200};
}\`;`}
                                >
                                  <As
                                    as="input"
                                    type="checkbox"
                                    checked={selectedJobs().has(job.id)}
                                    onChange={() =>
                                      handleToggleJobSelection(job.id)
                                    }
                                    css={`return \`._id {
  width: 18px;
  height: 18px;
  cursor: pointer;
}\`;`}
                                  />
                                  <As
                                    as="div"
                                    css={`return \`._id {
  font-family: monospace;
  font-size: 0.75rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}\`;`}
                                  >
                                    {job.id}
                                  </As>
                                  <As
                                    as="div"
                                    css={`return \`._id {
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}\`;`}
                                  >
                                    {job.name}
                                  </As>
                                  <As
                                    as="div"
                                    css={`return \`._id {
  font-family: monospace;
  font-size: 0.75rem;
  color: \${args.theme.var.color.text_light_500};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}\`;`}
                                  >
                                    {formatJSON(job.data).substring(0, 100)}...
                                  </As>
                                  <As
                                    as="div"
                                    css={`return \`._id {
  color: \${args.theme.var.color.text_light_500};
  font-size: 0.75rem;
}\`;`}
                                  >
                                    {formatTimestamp(job.timestamp)}
                                  </As>
                                  <As as="div">{job.attemptsMade || 0}</As>
                                  <As
                                    as="div"
                                    css={`return \`._id {
  display: flex;
  gap: 0.5rem;
}\`;`}
                                  >
                                    <As
                                      as="button"
                                      onClick={() => setSelectedJob(job)}
                                      css={`return \`._id {
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
  border-radius: 0.25rem;
  cursor: pointer;
  border: none;
  font-weight: 500;
  transition: all 0.2s;
  background: \${args.theme.var.color.info};
  color: \${args.theme.var.color.info_text};
}
._id:hover {
  background: \${args.theme.var.color.info_dark_200};
}\`;`}
                                    >
                                      View
                                    </As>
                                    <Show when={selectedState() === "failed"}>
                                      <As
                                        as="button"
                                        onClick={() =>
                                          handleRetryJob(queue.name, job.id)
                                        }
                                        css={`return \`._id {
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
  border-radius: 0.25rem;
  cursor: pointer;
  border: none;
  font-weight: 500;
  transition: all 0.2s;
  background: \${args.theme.var.color.success};
  color: \${args.theme.var.color.success_text};
}
._id:hover {
  background: \${args.theme.var.color.success_dark_200};
}\`;`}
                                      >
                                        Retry
                                      </As>
                                    </Show>
                                    <As
                                      as="button"
                                      onClick={() =>
                                        handleDeleteJob(queue.name, job.id)
                                      }
                                      css={`return \`._id {
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
  border-radius: 0.25rem;
  cursor: pointer;
  border: none;
  font-weight: 500;
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
                                  </As>
                                </As>
                              )}
                            </For>
                          </As>

                          {/* Pagination Controls */}
                          <As
                            as="div"
                            css={`return \`._id {
  padding: 1rem 1.5rem;
  border-top: 1px solid \${args.theme.var.color.border};
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
  background: \${args.theme.var.color.background_light_200};
}\`;`}
                          >
                            <As
                              as="div"
                              css={`return \`._id {
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 0.875rem;
  color: \${args.theme.var.color.text_light_500};
}\`;`}
                            >
                              <As as="span">
                                Showing {(currentPage() - 1) * pageSize() + 1}-
                                {Math.min(
                                  currentPage() * pageSize(),
                                  jobCount()?.count || 0,
                                )}{" "}
                                of {jobCount()?.count || 0} jobs
                              </As>
                              <As
                                as="select"
                                value={pageSize()}
                                onChange={(e) =>
                                  handlePageSizeChange(
                                    parseInt(e.currentTarget.value),
                                  )
                                }
                                css={`return \`._id {
  padding: 0.375rem 0.75rem;
  border: 1px solid \${args.theme.var.color.border};
  border-radius: 0.375rem;
  font-size: 0.875rem;
  background: \${args.theme.var.color.background};
  color: \${args.theme.var.color.text};
  cursor: pointer;
}
._id:focus {
  outline: none;
  border-color: \${args.theme.var.color.primary};
}\`;`}
                              >
                                <As as="option" value="25">
                                  25 per page
                                </As>
                                <As as="option" value="50">
                                  50 per page
                                </As>
                                <As as="option" value="100">
                                  100 per page
                                </As>
                                <As as="option" value="200">
                                  200 per page
                                </As>
                              </As>
                            </As>
                            <As
                              as="div"
                              css={`return \`._id {
  display: flex;
  gap: 0.5rem;
}\`;`}
                            >
                              <As
                                as="button"
                                onClick={handlePrevPage}
                                disabled={currentPage() === 1}
                                css={`return \`._id {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  border-radius: 0.375rem;
  cursor: pointer;
  border: 1px solid \${args.theme.var.color.border};
  background: \${args.theme.var.color.background};
  color: \${args.theme.var.color.text};
  font-weight: 500;
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
                                Previous
                              </As>
                              <As
                                as="span"
                                css={`return \`._id {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  color: \${args.theme.var.color.text_light_500};
}\`;`}
                              >
                                Page {currentPage()} of{" "}
                                {Math.ceil(
                                  (jobCount()?.count || 0) / pageSize(),
                                )}
                              </As>
                              <As
                                as="button"
                                onClick={handleNextPage}
                                disabled={
                                  currentPage() >=
                                  Math.ceil(
                                    (jobCount()?.count || 0) / pageSize(),
                                  )
                                }
                                css={`return \`._id {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  border-radius: 0.375rem;
  cursor: pointer;
  border: 1px solid \${args.theme.var.color.border};
  background: \${args.theme.var.color.background};
  color: \${args.theme.var.color.text};
  font-weight: 500;
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
                                Next
                              </As>
                            </As>
                          </As>
                        </Show>
                      </Show>
                    </As>
                  </Show>
                </As>
              )}
            </For>
          </As>
        </Show>
      </Show>

      {/* Confirmation Dialog */}
      <Show when={confirmAction()}>
        {() => {
          const action = confirmAction()!;
          const [type, queueName] = action.split(":");

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
  border: 1px solid \${args.theme.var.color.border};
  border-radius: 0.5rem;
  padding: 2rem;
  max-width: 500px;
  width: 90%;
}\`;`}
                onClick={(e: MouseEvent) => e.stopPropagation()}
              >
                <As
                  as="h2"
                  css={`return \`._id {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0 0 1rem 0;
}\`;`}
                >
                  Confirm Action
                </As>
                <As
                  as="p"
                  css={`return \`._id {
  margin: 0 0 1.5rem 0;
  color: \${args.theme.var.color.text_light_500};
}\`;`}
                >
                  {type === "delete" &&
                    `Are you sure you want to delete queue "${queueName}"? This action cannot be undone.`}
                  {type === "empty" &&
                    `Are you sure you want to empty all jobs from queue "${queueName}"?`}
                  {type === "deleteKeys" &&
                    `Are you sure you want to delete all keys matching pattern "${searchPattern()}"?`}
                  {type === "bulkDelete" &&
                    `Are you sure you want to delete ${selectedJobs().size} selected job(s)? This action cannot be undone.`}
                  {type === "bulkRetry" &&
                    `Are you sure you want to retry ${selectedJobs().size} selected failed job(s)?`}
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
  padding: 0.625rem 1.25rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  border: 1px solid \${args.theme.var.color.border};
  background: \${args.theme.var.color.background};
  color: \${args.theme.var.color.text};
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
                        handleDeleteQueue(queueName);
                      } else if (type === "empty") {
                        handleEmptyQueue(queueName);
                      } else if (type === "deleteKeys") {
                        handleDeleteKeysByPattern();
                      } else if (type === "bulkDelete") {
                        handleBulkDelete();
                      } else if (type === "bulkRetry") {
                        handleBulkRetry();
                      }
                    }}
                    css={`return \`._id {
  padding: 0.625rem 1.25rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  border: none;
  background: \${args.theme.var.color.error};
  color: \${args.theme.var.color.error_text};
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

      {/* Job Detail Modal */}
      <Show when={selectedJob()}>
        {() => {
          const job = selectedJob()!;

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
  overflow-y: auto;
  padding: 2rem;
}\`;`}
              onClick={() => setSelectedJob(null)}
            >
              <As
                as="div"
                css={`return \`._id {
  background: \${args.theme.var.color.background};
  border: 1px solid \${args.theme.var.color.border};
  border-radius: 0.5rem;
  max-width: 800px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
}\`;`}
                onClick={(e: MouseEvent) => e.stopPropagation()}
              >
                {/* Modal Header */}
                <As
                  as="div"
                  css={`return \`._id {
  padding: 1.5rem 2rem;
  border-bottom: 1px solid \${args.theme.var.color.border};
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  position: sticky;
  top: 0;
  background: \${args.theme.var.color.background};
  z-index: 1;
}\`;`}
                >
                  <As as="div">
                    <As
                      as="h2"
                      css={`return \`._id {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
}\`;`}
                    >
                      Job Details
                    </As>
                    <As
                      as="div"
                      css={`return \`._id {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}\`;`}
                    >
                      <As
                        as="div"
                        css={`return \`._id {
  font-family: monospace;
  font-size: 0.8125rem;
  color: \${args.theme.var.color.text_light_500};
}\`;`}
                      >
                        ID: {job.id}
                      </As>
                      <As
                        as="div"
                        css={`return \`._id {
  font-size: 0.875rem;
  font-weight: 500;
}\`;`}
                      >
                        Name: {job.name}
                      </As>
                    </As>
                  </As>
                  <As
                    as="button"
                    onClick={() => setSelectedJob(null)}
                    css={`return \`._id {
  padding: 0.5rem;
  border: none;
  background: none;
  cursor: pointer;
  font-size: 1.5rem;
  color: \${args.theme.var.color.text_light_500};
  line-height: 1;
  transition: color 0.2s;
}
._id:hover {
  color: \${args.theme.var.color.text};
}\`;`}
                  >
                    ×
                  </As>
                </As>

                {/* Modal Body */}
                <As
                  as="div"
                  css={`return \`._id {
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}\`;`}
                >
                  {/* Timestamps Section */}
                  <As as="div">
                    <As
                      as="h3"
                      css={`return \`._id {
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 1rem 0;
  color: \${args.theme.var.color.text_light_500};
  text-transform: uppercase;
  font-size: 0.8125rem;
}\`;`}
                    >
                      Timestamps
                    </As>
                    <As
                      as="div"
                      css={`return \`._id {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}\`;`}
                    >
                      <As
                        as="div"
                        css={`return \`._id {
  padding: 1rem;
  background: \${args.theme.var.color.background_light_200};
  border-radius: 0.375rem;
}\`;`}
                      >
                        <As
                          as="div"
                          css={`return \`._id {
  font-size: 0.75rem;
  color: \${args.theme.var.color.text_light_500};
  margin-bottom: 0.25rem;
}\`;`}
                        >
                          Created
                        </As>
                        <As
                          as="div"
                          css={`return \`._id {
  font-size: 0.875rem;
  font-weight: 500;
}\`;`}
                        >
                          {job.timestamp
                            ? new Date(job.timestamp).toLocaleString()
                            : "N/A"}
                        </As>
                        <As
                          as="div"
                          css={`return \`._id {
  font-size: 0.75rem;
  color: \${args.theme.var.color.text_light_500};
  margin-top: 0.25rem;
}\`;`}
                        >
                          {formatTimestamp(job.timestamp)}
                        </As>
                      </As>
                      <Show when={job.processedOn}>
                        <As
                          as="div"
                          css={`return \`._id {
  padding: 1rem;
  background: \${args.theme.var.color.background_light_200};
  border-radius: 0.375rem;
}\`;`}
                        >
                          <As
                            as="div"
                            css={`return \`._id {
  font-size: 0.75rem;
  color: \${args.theme.var.color.text_light_500};
  margin-bottom: 0.25rem;
}\`;`}
                          >
                            Processed
                          </As>
                          <As
                            as="div"
                            css={`return \`._id {
  font-size: 0.875rem;
  font-weight: 500;
}\`;`}
                          >
                            {new Date(job.processedOn!).toLocaleString()}
                          </As>
                          <As
                            as="div"
                            css={`return \`._id {
  font-size: 0.75rem;
  color: \${args.theme.var.color.text_light_500};
  margin-top: 0.25rem;
}\`;`}
                          >
                            {formatTimestamp(job.processedOn)}
                          </As>
                        </As>
                      </Show>
                      <Show when={job.finishedOn}>
                        <As
                          as="div"
                          css={`return \`._id {
  padding: 1rem;
  background: \${args.theme.var.color.background_light_200};
  border-radius: 0.375rem;
}\`;`}
                        >
                          <As
                            as="div"
                            css={`return \`._id {
  font-size: 0.75rem;
  color: \${args.theme.var.color.text_light_500};
  margin-bottom: 0.25rem;
}\`;`}
                          >
                            Finished
                          </As>
                          <As
                            as="div"
                            css={`return \`._id {
  font-size: 0.875rem;
  font-weight: 500;
}\`;`}
                          >
                            {new Date(job.finishedOn!).toLocaleString()}
                          </As>
                          <As
                            as="div"
                            css={`return \`._id {
  font-size: 0.75rem;
  color: \${args.theme.var.color.text_light_500};
  margin-top: 0.25rem;
}\`;`}
                          >
                            {formatTimestamp(job.finishedOn)}
                          </As>
                        </As>
                      </Show>
                    </As>
                  </As>

                  {/* Attempts Section */}
                  <As as="div">
                    <As
                      as="h3"
                      css={`return \`._id {
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 1rem 0;
  color: \${args.theme.var.color.text_light_500};
  text-transform: uppercase;
  font-size: 0.8125rem;
}\`;`}
                    >
                      Attempt Information
                    </As>
                    <As
                      as="div"
                      css={`return \`._id {
  padding: 1rem;
  background: \${args.theme.var.color.background_light_200};
  border-radius: 0.375rem;
  font-size: 0.875rem;
}\`;`}
                    >
                      Attempts Made:{" "}
                      <As
                        as="span"
                        css={"return `._id { font-weight: 600; }`;"}
                      >
                        {job.attemptsMade || 0}
                      </As>
                    </As>
                  </As>

                  {/* Error Message Section */}
                  <Show when={job.failedReason}>
                    <As as="div">
                      <As
                        as="h3"
                        css={`return \`._id {
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 1rem 0;
  color: \${args.theme.var.color.error};
  text-transform: uppercase;
  font-size: 0.8125rem;
}\`;`}
                      >
                        Error Message
                      </As>
                      <As
                        as="pre"
                        css={`return \`._id {
  padding: 1rem;
  background: \${args.theme.var.color.error_light_900};
  color: \${args.theme.var.color.error_dark_300};
  border: 1px solid \${args.theme.var.color.error};
  border-radius: 0.375rem;
  font-family: monospace;
  font-size: 0.8125rem;
  overflow-x: auto;
  white-space: pre-wrap;
  word-wrap: break-word;
  margin: 0;
}\`;`}
                      >
                        {job.failedReason}
                      </As>
                    </As>
                  </Show>

                  {/* Return Value Section */}
                  <Show when={job.returnvalue}>
                    <As as="div">
                      <As
                        as="h3"
                        css={`return \`._id {
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 1rem 0;
  color: \${args.theme.var.color.text_light_500};
  text-transform: uppercase;
  font-size: 0.8125rem;
}\`;`}
                      >
                        Return Value
                      </As>
                      <As
                        as="pre"
                        css={`return \`._id {
  padding: 1rem;
  background: \${args.theme.var.color.background_light_200};
  border: 1px solid \${args.theme.var.color.border};
  border-radius: 0.375rem;
  font-family: monospace;
  font-size: 0.8125rem;
  overflow-x: auto;
  white-space: pre-wrap;
  word-wrap: break-word;
  margin: 0;
}\`;`}
                      >
                        {formatJSON(job.returnvalue)}
                      </As>
                    </As>
                  </Show>

                  {/* Job Data Section */}
                  <As as="div">
                    <As
                      as="h3"
                      css={`return \`._id {
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 1rem 0;
  color: \${args.theme.var.color.text_light_500};
  text-transform: uppercase;
  font-size: 0.8125rem;
}\`;`}
                    >
                      Job Data
                    </As>
                    <As
                      as="pre"
                      css={`return \`._id {
  padding: 1rem;
  background: \${args.theme.var.color.background_light_200};
  border: 1px solid \${args.theme.var.color.border};
  border-radius: 0.375rem;
  font-family: monospace;
  font-size: 0.8125rem;
  overflow-x: auto;
  white-space: pre-wrap;
  word-wrap: break-word;
  margin: 0;
}\`;`}
                    >
                      {formatJSON(job.data)}
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
  gap: 1rem;
  justify-content: flex-end;
  position: sticky;
  bottom: 0;
  background: \${args.theme.var.color.background};
}\`;`}
                >
                  <Show when={job.failedReason}>
                    <As
                      as="button"
                      onClick={() => {
                        handleRetryJob(expandedQueue()!, job.id);
                        setSelectedJob(null);
                      }}
                      css={`return \`._id {
  padding: 0.625rem 1.25rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  border: none;
  background: \${args.theme.var.color.success};
  color: \${args.theme.var.color.success_text};
}
._id:hover {
  background: \${args.theme.var.color.success_dark_200};
}\`;`}
                    >
                      Retry Job
                    </As>
                  </Show>
                  <As
                    as="button"
                    onClick={() => {
                      handleDeleteJob(expandedQueue()!, job.id);
                      setSelectedJob(null);
                    }}
                    css={`return \`._id {
  padding: 0.625rem 1.25rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  border: none;
  background: \${args.theme.var.color.error};
  color: \${args.theme.var.color.error_text};
}
._id:hover {
  background: \${args.theme.var.color.error_dark_200};
}\`;`}
                  >
                    Delete Job
                  </As>
                  <As
                    as="button"
                    onClick={() => setSelectedJob(null)}
                    css={`return \`._id {
  padding: 0.625rem 1.25rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  border: 1px solid \${args.theme.var.color.border};
  background: \${args.theme.var.color.background};
  color: \${args.theme.var.color.text};
}
._id:hover {
  background: \${args.theme.var.color.background_light_200};
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
    </As>
  );
}
