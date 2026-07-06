import { createAsync } from "@solidjs/router";
import { createSignal, For, Show } from "solid-js";
import { useToast } from "~/components/styled/modal/Toast";
import { As } from "~/components/As";
import {
  getSubdomainClusterWorkerStatus,
  initSubdomainWorkersUI,
  startWorker,
  stopWorker,
  stopWorkers,
} from "~/server/queue/initWorkers";

interface Worker {
  key: string;
  description: string;
  active: boolean;
  nodeId: string;
  hostname: string;
}

interface WorkerStatus {
  initialized: boolean;
  enabled: boolean;
  totalWorkers: number;
  activeWorkers: number;
  workers: Worker[];
  nodes?: Array<{
    nodeId: string;
    hostname: string;
    pid: number;
    startedAt: number;
    lastHeartbeat: number;
  }>;
  currentNode?: {
    nodeId: string;
    hostname: string;
    pid: number;
    startedAt: number;
    lastHeartbeat: number;
  } | null;
  clusterInfo?: {
    totalNodes: number;
    respondedNodes: number;
    timedOutNodes: number;
    duration: number;
  };
}

export function WorkerManagement() {
  const { showSuccessToast, showErrorToast } = useToast();
  const [refreshKey, setRefreshKey] = createSignal(0);

  const [errorMessage, setErrorMessage] = createSignal<string | null>(null);

  const workerStatus = createAsync(
    async () => {
      // Use refreshKey as dependency
      refreshKey();
      setErrorMessage(null); // Clear previous errors
      const result = await getSubdomainClusterWorkerStatus();
      if (result.success && result.data) {
        return result.data;
      }
      // Handle error case
      if (!result.success && result.error) {
        setErrorMessage(result.error);
      }
      return null;
    },
    { deferStream: true },
  );

  const handleInitWorkers = async () => {
    try {
      await initSubdomainWorkersUI();
      showSuccessToast("Subdomain workers initialized successfully");
      setRefreshKey((prev) => prev + 1);
    } catch (error) {
      showErrorToast(
        error instanceof Error
          ? error.message
          : "Failed to initialize subdomain workers",
      );
    }
  };

  const handleStopAllWorkers = async () => {
    try {
      await stopWorkers();
      showSuccessToast("All workers stopped successfully");
      setRefreshKey((prev) => prev + 1);
    } catch (error) {
      showErrorToast(
        error instanceof Error ? error.message : "Failed to stop all workers",
      );
    }
  };

  const handleStartWorker = async (workerKey: string) => {
    try {
      const result = await startWorker(workerKey);
      if (result.success) {
        showSuccessToast(`Worker ${workerKey} started successfully`);
        setRefreshKey((prev) => prev + 1);
      } else {
        showErrorToast(result.error || `Failed to start worker ${workerKey}`);
      }
    } catch (error) {
      showErrorToast(
        error instanceof Error ? error.message : "Failed to start worker",
      );
    }
  };

  const handleStopWorker = async (workerKey: string) => {
    try {
      const result = await stopWorker(workerKey);
      if (result.success) {
        showSuccessToast(`Worker ${workerKey} stopped successfully`);
        setRefreshKey((prev) => prev + 1);
      } else {
        showErrorToast(result.error || `Failed to stop worker ${workerKey}`);
      }
    } catch (error) {
      showErrorToast(
        error instanceof Error ? error.message : "Failed to stop worker",
      );
    }
  };

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
    showSuccessToast("Status refreshed");
  };

  return (
    <As
      as="div"
      css={`return \`._id {
  padding: 2rem;
}\`;`}
    >
      <As
        as="div"
        css={`return \`._id {
  background: \${args.theme.var.color.info_light_900};
  border: 1px solid \${args.theme.var.color.info_light_700};
  border-radius: 0.5rem;
  padding: 1rem 1.25rem;
  margin-bottom: 1.5rem;
  color: \${args.theme.var.color.info_dark_300};
}\`;`}
      >
        <As
          as="div"
          css={`return \`._id {
  font-weight: 600;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}\`;`}
        >
          <As as="span">ℹ️</As>
          <As as="span">Subdomain Workers Only</As>
        </As>
        <As
          as="p"
          css={`return \`._id {
  font-size: 0.875rem;
  margin: 0;
  line-height: 1.5;
}\`;`}
        >
          This page manages subdomain-specific workers only. Platform-level
          workers (like the email worker) are managed automatically on app
          startup and cannot be controlled from this interface.
        </As>
      </As>

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
          Subdomain Worker Management
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

      {/* Error Display */}
      <Show when={errorMessage()}>
        <As
          as="div"
          css={`return \`._id {
  padding: 1.5rem;
  border-radius: 0.5rem;
  border: 1px solid \${args.theme.var.color.error};
  background: \${args.theme.var.color.error_light_900};
  margin-bottom: 2rem;
}\`;`}
        >
          <As
            as="div"
            css={`return \`._id {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
}\`;`}
          >
            <As
              as="span"
              css={`return \`._id {
  font-size: 1.25rem;
  flex-shrink: 0;
}\`;`}
            >
              ⚠️
            </As>
            <As as="div">
              <As
                as="div"
                css={`return \`._id {
  font-weight: 600;
  color: \${args.theme.var.color.error_dark_300};
  margin-bottom: 0.5rem;
}\`;`}
              >
                Error Loading Worker Status
              </As>
              <As
                as="div"
                css={`return \`._id {
  color: \${args.theme.var.color.error_dark_300};
  font-size: 0.875rem;
}\`;`}
              >
                {errorMessage()}
              </As>
            </As>
          </As>
        </As>
      </Show>

      <Show
        when={workerStatus()}
        fallback={
          <Show when={!errorMessage()}>
            <As
              as="div"
              css={`return \`._id {
  padding: 3rem;
  text-align: center;
  color: \${args.theme.var.color.text_light_600};
}\`;`}
            >
              Loading worker status...
            </As>
          </Show>
        }
      >
        {(status) => (
          <>
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
  color: \${args.theme.var.color.text_light_600};
  margin: 0 0 0.5rem 0;
  text-transform: uppercase;
}\`;`}
                >
                  Status
                </As>
                <As
                  as="p"
                  css={`return \`._id {
  font-size: 1.875rem;
  font-weight: 600;
  margin: 0;
}\`;`}
                >
                  <As
                    as="span"
                    css={`return \`._id {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 500;
  background: ${status().enabled ? "${args.theme.var.color.success_light_900}" : "${args.theme.var.color.error_light_900}"};
  color: ${status().enabled ? "${args.theme.var.color.success_dark_300}" : "${args.theme.var.color.error_dark_300}"};
}\`;`}
                  >
                    {status().enabled ? "Enabled" : "Disabled"}
                  </As>
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
  color: \${args.theme.var.color.text_light_600};
  margin: 0 0 0.5rem 0;
  text-transform: uppercase;
}\`;`}
                >
                  Initialized
                </As>
                <As
                  as="p"
                  css={`return \`._id {
  font-size: 1.875rem;
  font-weight: 600;
  margin: 0;
}\`;`}
                >
                  <As
                    as="span"
                    css={`return \`._id {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 500;
  background: ${status().initialized ? "${args.theme.var.color.info_light_900}" : "${args.theme.var.color.background_light_300}"};
  color: ${status().initialized ? "${args.theme.var.color.info_dark_300}" : "${args.theme.var.color.text_light_600}"};
}\`;`}
                  >
                    {status().initialized ? "Yes" : "No"}
                  </As>
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
  color: \${args.theme.var.color.text_light_600};
  margin: 0 0 0.5rem 0;
  text-transform: uppercase;
}\`;`}
                >
                  Cluster Nodes
                </As>
                <As
                  as="p"
                  css={`return \`._id {
  font-size: 1.875rem;
  font-weight: 600;
  margin: 0;
}\`;`}
                >
                  {status().clusterInfo?.totalNodes || 0}
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
  color: \${args.theme.var.color.text_light_600};
  margin: 0 0 0.5rem 0;
  text-transform: uppercase;
}\`;`}
                >
                  Total Workers
                </As>
                <As
                  as="p"
                  css={`return \`._id {
  font-size: 1.875rem;
  font-weight: 600;
  margin: 0;
}\`;`}
                >
                  {status().totalWorkers}
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
  color: \${args.theme.var.color.text_light_600};
  margin: 0 0 0.5rem 0;
  text-transform: uppercase;
}\`;`}
                >
                  Active Workers
                </As>
                <As
                  as="p"
                  css={`return \`._id {
  font-size: 1.875rem;
  font-weight: 600;
  margin: 0;
}\`;`}
                >
                  {status().activeWorkers}
                </As>
              </As>
            </As>

            {/* Cluster Nodes Section */}
            <Show when={status().nodes && status().nodes!.length > 0}>
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
  margin-bottom: 1rem;
}\`;`}
                >
                  Active Cluster Nodes for this Subdomain
                </As>
                <As
                  as="div"
                  css={`return \`._id {
  display: grid;
  gap: 1rem;
}\`;`}
                >
                  <For each={status().nodes}>
                    {(node) => {
                      const isCurrentNode =
                        status().currentNode?.nodeId === node.nodeId;
                      const uptime = Date.now() - node.startedAt;
                      const uptimeMinutes = Math.floor(uptime / 1000 / 60);
                      const uptimeHours = Math.floor(uptimeMinutes / 60);
                      const uptimeStr =
                        uptimeHours > 0
                          ? `${uptimeHours}h ${uptimeMinutes % 60}m`
                          : `${uptimeMinutes}m`;

                      return (
                        <As
                          as="div"
                          css={`return \`._id {
  padding: 1rem 1.5rem;
  border-radius: 0.5rem;
  border: 1px solid \${args.theme.var.color.border};
  background: \${args.theme.var.color.background};
  display: grid;
  grid-template-columns: 1fr auto auto auto;
  gap: 2rem;
  align-items: center;
}\`;`}
                        >
                          <As as="div">
                            <As
                              as="div"
                              css={`return \`._id {
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}\`;`}
                            >
                              {node.hostname}
                              {isCurrentNode && (
                                <As
                                  as="span"
                                  css={`return \`._id {
  padding: 0.125rem 0.5rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  background: \${args.theme.var.color.primary_light_900};
  color: \${args.theme.var.color.primary_dark_300};
}\`;`}
                                >
                                  Current
                                </As>
                              )}
                            </As>
                            <As
                              as="div"
                              css={`return \`._id {
  font-size: 0.75rem;
  color: \${args.theme.var.color.text_light_600};
  font-family: monospace;
  margin-top: 0.25rem;
}\`;`}
                            >
                              {node.nodeId}
                            </As>
                          </As>
                          <As
                            as="div"
                            css={`return \`._id {
  text-align: right;
}\`;`}
                          >
                            <As
                              as="div"
                              css={`return \`._id {
  font-size: 0.875rem;
  color: \${args.theme.var.color.text_light_600};
}\`;`}
                            >
                              PID: {node.pid}
                            </As>
                          </As>
                          <As
                            as="div"
                            css={`return \`._id {
  text-align: right;
}\`;`}
                          >
                            <As
                              as="div"
                              css={`return \`._id {
  font-size: 0.875rem;
  color: \${args.theme.var.color.text_light_600};
}\`;`}
                            >
                              Uptime: {uptimeStr}
                            </As>
                          </As>
                          <As as="div">
                            <As
                              as="span"
                              css={`return \`._id {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 500;
  background: \${args.theme.var.color.success_light_900};
  color: \${args.theme.var.color.success_dark_300};
}\`;`}
                            >
                              <As
                                as="span"
                                css={`return \`._id {
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 50%;
  background: \${args.theme.var.color.success};
}\`;`}
                              />
                              Online
                            </As>
                          </As>
                        </As>
                      );
                    }}
                  </For>
                </As>
              </As>
            </Show>

            <As
              as="div"
              css={`return \`._id {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 2rem;
}\`;`}
            >
              <As
                as="button"
                onClick={handleInitWorkers}
                disabled={status().initialized}
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
._id:hover:not(:disabled) {
  background: \${args.theme.var.color.primary_dark_200};
}
._id:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}\`;`}
              >
                {"▶️ Initialize Subdomain Workers"}
              </As>
              <As
                as="button"
                onClick={handleStopAllWorkers}
                disabled={!status().initialized}
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
                {"⏹️ Stop All Subdomain Workers"}
              </As>
            </As>

            <Show
              when={status().workers.length > 0}
              fallback={
                <As
                  as="div"
                  css={`return \`._id {
  padding: 3rem;
  text-align: center;
  color: \${args.theme.var.color.text_light_600};
}\`;`}
                >
                  <As
                    as="div"
                    css={`return \`._id {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}\`;`}
                  >
                    {"📦"}
                  </As>
                  <As as="p">No subdomain worker functions found.</As>
                  <As
                    as="p"
                    css={`return \`._id {
  font-size: 0.875rem;
  margin-top: 0.5rem;
}\`;`}
                  >
                    Create Function vertices with keys starting with 'process'
                    or 'background' to see them here.
                  </As>
                  <As
                    as="p"
                    css={`return \`._id {
  font-size: 0.875rem;
  margin-top: 0.5rem;
  color: \${args.theme.var.color.text_light_500};
}\`;`}
                  >
                    Note: Platform-level workers (like email worker) are managed
                    automatically and do not appear here.
                  </As>
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
  grid-template-columns: 1.5fr 2fr 1fr 1fr 100px 150px;
  gap: 1rem;
}\`;`}
                >
                  <As as="div">Worker Key</As>
                  <As as="div">Description</As>
                  <As as="div">Hostname</As>
                  <As as="div">Node ID</As>
                  <As as="div">Status</As>
                  <As as="div">Actions</As>
                </As>
                <For each={status().workers}>
                  {(worker) => (
                    <As
                      as="div"
                      css={`return \`._id {
  padding: 1rem 1.5rem;
  border-top: 1px solid \${args.theme.var.color.border};
  display: grid;
  grid-template-columns: 1.5fr 2fr 1fr 1fr 100px 150px;
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
}\`;`}
                      >
                        {worker.key}
                      </As>
                      <As
                        as="div"
                        css={`return \`._id {
  color: \${args.theme.var.color.text_light_600};
  font-size: 0.875rem;
}\`;`}
                      >
                        {worker.description || "No description"}
                      </As>
                      <As
                        as="div"
                        css={`return \`._id {
  font-size: 0.875rem;
  color: \${args.theme.var.color.text};
}\`;`}
                      >
                        {worker.hostname}
                      </As>
                      <As
                        as="div"
                        css={`return \`._id {
  font-size: 0.75rem;
  color: \${args.theme.var.color.text_light_600};
  font-family: monospace;
  overflow: hidden;
  text-overflow: ellipsis;
}\`;`}
                        title={worker.nodeId}
                      >
                        {worker.nodeId.length > 20
                          ? `${worker.nodeId.substring(0, 20)}...`
                          : worker.nodeId}
                      </As>
                      <As as="div">
                        <As
                          as="span"
                          css={`return \`._id {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 500;
  background: ${worker.active ? "${args.theme.var.color.success_light_900}" : "${args.theme.var.color.error_light_900}"};
  color: ${worker.active ? "${args.theme.var.color.success_dark_300}" : "${args.theme.var.color.error_dark_300}"};
}\`;`}
                        >
                          {worker.active ? "Active" : "Inactive"}
                        </As>
                      </As>
                      <As
                        as="div"
                        css={`return \`._id {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
}\`;`}
                      >
                        <As
                          as="button"
                          onClick={() => handleStartWorker(worker.key)}
                          disabled={worker.active}
                          css={`return \`._id {
  padding: 0.375rem 0.75rem;
  font-size: 0.875rem;
  border-radius: 0.25rem;
  cursor: pointer;
  border: none;
  font-weight: 500;
  transition: all 0.2s;
  background: \${args.theme.var.color.success};
  color: \${args.theme.var.color.success_text};
}
._id:hover:not(:disabled) {
  background: \${args.theme.var.color.success_dark_200};
}
._id:disabled {
  background: \${args.theme.var.color.background_dark_200};
  cursor: not-allowed;
}\`;`}
                        >
                          Start
                        </As>
                        <As
                          as="button"
                          onClick={() => handleStopWorker(worker.key)}
                          disabled={!worker.active}
                          css={`return \`._id {
  padding: 0.375rem 0.75rem;
  font-size: 0.875rem;
  border-radius: 0.25rem;
  cursor: pointer;
  border: none;
  font-weight: 500;
  transition: all 0.2s;
  background: \${args.theme.var.color.warning};
  color: \${args.theme.var.color.warning_text};
}
._id:hover:not(:disabled) {
  background: \${args.theme.var.color.warning_dark_200};
}
._id:disabled {
  background: \${args.theme.var.color.background_dark_200};
  cursor: not-allowed;
}\`;`}
                        >
                          Stop
                        </As>
                      </As>
                    </As>
                  )}
                </For>
              </As>
            </Show>
          </>
        )}
      </Show>
    </As>
  );
}
