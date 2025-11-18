import { createAsync } from "@solidjs/router";
import { createSignal, For, Show } from "solid-js";
import { useToast } from "~/components/styled/modal/Toast";
import { As } from "~/components/As";
import {
  startWorkerForSubdomain,
  stopWorkerForSubdomain,
  initAllSubdomainWorkersUI,
  stopAllSubdomainWorkersUI,
  getClusterWorkerStatus,
  getClusterNodes,
} from "~/server/queue/initWorkers";

interface Worker {
  workerKey: string;
  nodeId: string;
  hostname: string;
  status: string;
}

interface SubdomainWorkerStatus {
  subdomain: string;
  workers: Worker[];
}

interface NodeInfo {
  nodeId: string;
  hostname: string;
  pid: number;
  startedAt: number;
  lastHeartbeat: number;
}

export function AdminWorkerManagement() {
  const { showSuccessToast, showErrorToast } = useToast();
  const [refreshKey, setRefreshKey] = createSignal(0);
  const [errorMessage, setErrorMessage] = createSignal<string | null>(null);

  const workerStatus = createAsync(
    async () => {
      // Use refreshKey as dependency
      refreshKey();
      setErrorMessage(null); // Clear previous errors
      const result = await getClusterWorkerStatus();
      if (result.success && result.data) {
        return { success: true, data: result.data };
      }
      // Handle error case
      if (!result.success && result.error) {
        setErrorMessage(result.error);
      }
      return null;
    },
    { deferStream: true },
  );

  const clusterNodes = createAsync(
    async () => {
      // Use refreshKey as dependency
      refreshKey();
      const result = await getClusterNodes();
      if (result.success && result.data) {
        return result.data;
      }
      return null;
    },
    { deferStream: true },
  );

  const handleInitAllWorkers = async () => {
    try {
      const result = await initAllSubdomainWorkersUI();
      if (result.success) {
        showSuccessToast("All subdomain workers initialized successfully");
        setRefreshKey((prev) => prev + 1);
      } else {
        showErrorToast(result.error || "Failed to initialize all workers");
      }
    } catch (error) {
      showErrorToast(
        error instanceof Error
          ? error.message
          : "Failed to initialize all workers",
      );
    }
  };

  const handleStopAllWorkers = async () => {
    try {
      const result = await stopAllSubdomainWorkersUI();
      if (result.success) {
        showSuccessToast("All subdomain workers stopped successfully");
        setRefreshKey((prev) => prev + 1);
      } else {
        showErrorToast(result.error || "Failed to stop all workers");
      }
    } catch (error) {
      showErrorToast(
        error instanceof Error ? error.message : "Failed to stop all workers",
      );
    }
  };

  const handleStartWorker = async (subdomain: string, workerKey: string) => {
    try {
      const result = await startWorkerForSubdomain(subdomain, workerKey);
      if (result.success) {
        showSuccessToast(
          `Worker ${workerKey} started for ${subdomain} successfully`,
        );
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

  const handleStopWorker = async (subdomain: string, workerKey: string) => {
    try {
      const result = await stopWorkerForSubdomain(subdomain, workerKey);
      if (result.success) {
        showSuccessToast(
          `Worker ${workerKey} stopped for ${subdomain} successfully`,
        );
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

  const formatUptime = (startedAt: number) => {
    const uptimeMs = Date.now() - startedAt;
    const seconds = Math.floor(uptimeMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ${hours % 24}h`;
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
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
          <As as="span">Cluster Worker Management</As>
        </As>
        <As
          as="p"
          css={`return \`._id {
  font-size: 0.875rem;
  margin: 0;
  line-height: 1.5;
}\`;`}
        >
          This page shows workers across all nodes in the cluster. Workers are
          automatically distributed across available nodes. Platform-level
          workers (like email worker) are managed automatically.
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
          Cluster Worker Status
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

      {/* Cluster Nodes Section */}
      <Show when={clusterNodes()?.success && !errorMessage()}>
        {() => {
          const nodesData = clusterNodes()!.data!;
          return (
            <As
              as="div"
              css={`return \`._id {
  margin-bottom: 2rem;
  border: 1px solid \${args.theme.var.color.border};
  border-radius: 0.5rem;
  overflow: hidden;
}\`;`}
            >
              <As
                as="div"
                css={`return \`._id {
  background: \${args.theme.var.color.primary_light_900};
  border-bottom: 1px solid \${args.theme.var.color.border};
  padding: 1rem 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}\`;`}
              >
                <As
                  as="h2"
                  css={`return \`._id {
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}\`;`}
                >
                  <As as="span">🖥️</As>
                  <As as="span">Cluster Nodes</As>
                  <As
                    as="span"
                    css={`return \`._id {
  background: \${args.theme.var.color.primary};
  color: \${args.theme.var.color.primary_text};
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.875rem;
}\`;`}
                  >
                    {nodesData.totalNodes}
                  </As>
                </As>
              </As>
              <As
                as="div"
                css={`return \`._id {
  display: grid;
  gap: 0;
}\`;`}
              >
                <For each={nodesData.nodes}>
                  {(node: NodeInfo) => {
                    const isCurrent =
                      nodesData.currentNode?.nodeId === node.nodeId;
                    return (
                      <As
                        as="div"
                        css={`return \`._id {
  padding: 1rem 1.5rem;
  background: \${args.theme.var.color.background};
  border-top: 1px solid \${args.theme.var.color.border};
  display: grid;
  grid-template-columns: 1fr auto auto auto;
  gap: 1.5rem;
  align-items: center;
  transition: background 0.2s;
}
._id:hover {
  background: \${args.theme.var.color.background_light_200};
}\`;`}
                      >
                        <As
                          as="div"
                          css={`return \`._id {
  display: flex;
  align-items: center;
  gap: 1rem;
}\`;`}
                        >
                          <As
                            as="div"
                            css={`return \`._id {
  width: 8px;
  height: 8px;
  border-radius: 9999px;
  background: \${args.theme.var.color.success};
  box-shadow: 0 0 8px \${args.theme.var.color.success};
}\`;`}
                          />
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
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}\`;`}
                            >
                              <As as="span">{node.hostname}</As>
                              <Show when={isCurrent}>
                                <As
                                  as="span"
                                  css={`return \`._id {
  background: \${args.theme.var.color.info_light_900};
  color: \${args.theme.var.color.info_dark_300};
  padding: 0.125rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-weight: 500;
}\`;`}
                                >
                                  Current
                                </As>
                              </Show>
                            </As>
                            <As
                              as="div"
                              css={`return \`._id {
  font-family: monospace;
  font-size: 0.75rem;
  color: \${args.theme.var.color.text_light_600};
}\`;`}
                            >
                              {node.nodeId}
                            </As>
                          </As>
                        </As>
                        <As
                          as="div"
                          css={`return \`._id {
  text-align: center;
}\`;`}
                        >
                          <As
                            as="div"
                            css={`return \`._id {
  font-size: 0.75rem;
  color: \${args.theme.var.color.text_light_600};
  margin-bottom: 0.25rem;
}\`;`}
                          >
                            PID
                          </As>
                          <As
                            as="div"
                            css={`return \`._id {
  font-weight: 600;
  font-family: monospace;
}\`;`}
                          >
                            {node.pid}
                          </As>
                        </As>
                        <As
                          as="div"
                          css={`return \`._id {
  text-align: center;
}\`;`}
                        >
                          <As
                            as="div"
                            css={`return \`._id {
  font-size: 0.75rem;
  color: \${args.theme.var.color.text_light_600};
  margin-bottom: 0.25rem;
}\`;`}
                          >
                            Uptime
                          </As>
                          <As
                            as="div"
                            css={`return \`._id {
  font-weight: 600;
}\`;`}
                          >
                            {formatUptime(node.startedAt)}
                          </As>
                        </As>
                        <As
                          as="div"
                          css={`return \`._id {
  display: flex;
  justify-content: flex-end;
}\`;`}
                        >
                          <As
                            as="span"
                            css={`return \`._id {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.375rem 0.75rem;
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
  width: 6px;
  height: 6px;
  border-radius: 9999px;
  background: \${args.theme.var.color.success};
}\`;`}
                            />
                            <As as="span">Online</As>
                          </As>
                        </As>
                      </As>
                    );
                  }}
                </For>
              </As>
            </As>
          );
        }}
      </Show>

      <Show
        when={workerStatus()?.success && !errorMessage()}
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
              Loading cluster worker status...
            </As>
          </Show>
        }
      >
        {() => {
          const data = workerStatus()!.data!;
          const subdomains = data.subdomains;
          const totalWorkers = subdomains.reduce(
            (sum, sd) => sum + sd.workers.length,
            0,
          );

          return (
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
                    Total Subdomains
                  </As>
                  <As
                    as="p"
                    css={`return \`._id {
  font-size: 1.875rem;
  font-weight: 600;
  margin: 0;
}\`;`}
                  >
                    {subdomains.length}
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
                    {totalWorkers}
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
                    {data.clusterResult.totalNodes + 1}{" "}
                    {/* +1 for current node */}
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
  background: ${totalWorkers > 0 ? "${args.theme.var.color.success_light_900}" : "${args.theme.var.color.error_light_900}"};
  color: ${totalWorkers > 0 ? "${args.theme.var.color.success_dark_300}" : "${args.theme.var.color.error_dark_300}"};
}\`;`}
                    >
                      {totalWorkers > 0 ? "Active" : "Inactive"}
                    </As>
                  </As>
                </As>
              </As>

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
                  onClick={handleInitAllWorkers}
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
                  {"▶️ Initialize All Workers"}
                </As>
                <As
                  as="button"
                  onClick={handleStopAllWorkers}
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
._id:hover {
  background: \${args.theme.var.color.error_dark_200};
}\`;`}
                >
                  {"⏹️ Stop All Workers"}
                </As>
              </As>

              <Show
                when={subdomains.length > 0}
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
                    <As as="p">No workers found in the cluster.</As>
                  </As>
                }
              >
                <As
                  as="div"
                  css={`return \`._id {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}\`;`}
                >
                  <For each={subdomains}>
                    {(subdomainStatus: SubdomainWorkerStatus) => (
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
  display: flex;
  justify-content: space-between;
  align-items: center;
}\`;`}
                        >
                          <As
                            as="div"
                            css={`return \`._id {
  display: flex;
  align-items: center;
  gap: 1rem;
}\`;`}
                          >
                            <As
                              as="h2"
                              css={`return \`._id {
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0;
}\`;`}
                            >
                              {subdomainStatus.subdomain}
                            </As>
                          </As>
                          <As
                            as="div"
                            css={`return \`._id {
  display: flex;
  gap: 1rem;
  align-items: center;
  font-size: 0.875rem;
  color: \${args.theme.var.color.text_light_600};
}\`;`}
                          >
                            <As as="span">
                              Workers: {subdomainStatus.workers.length}
                            </As>
                          </As>
                        </As>

                        <Show
                          when={subdomainStatus.workers.length > 0}
                          fallback={
                            <As
                              as="div"
                              css={`return \`._id {
  padding: 2rem;
  text-align: center;
  color: \${args.theme.var.color.text_light_600};
  font-size: 0.875rem;
}\`;`}
                            >
                              No worker functions running for this subdomain
                            </As>
                          }
                        >
                          <As
                            as="div"
                            css={`return \`._id {
  background: \${args.theme.var.color.background_light_200};
  padding: 0.75rem 1.5rem;
  font-weight: 600;
  font-size: 0.875rem;
  display: grid;
  grid-template-columns: 2fr 2fr 150px 100px 150px;
  gap: 1rem;
  border-top: 1px solid \${args.theme.var.color.border};
}\`;`}
                          >
                            <As as="div">Worker Key</As>
                            <As as="div">Node</As>
                            <As as="div">Hostname</As>
                            <As as="div">Status</As>
                            <As as="div">Actions</As>
                          </As>
                          <For each={subdomainStatus.workers}>
                            {(worker) => (
                              <As
                                as="div"
                                css={`return \`._id {
  padding: 1rem 1.5rem;
  border-top: 1px solid \${args.theme.var.color.border};
  display: grid;
  grid-template-columns: 2fr 2fr 150px 100px 150px;
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
                                  {worker.workerKey}
                                </As>
                                <As
                                  as="div"
                                  css={`return \`._id {
  font-family: monospace;
  font-size: 0.75rem;
  color: \${args.theme.var.color.text_light_600};
}\`;`}
                                >
                                  {worker.nodeId.substring(0, 30)}...
                                </As>
                                <As
                                  as="div"
                                  css={`return \`._id {
  font-size: 0.875rem;
  font-weight: 500;
}\`;`}
                                >
                                  {worker.hostname}
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
  background: ${worker.status === "running" ? "${args.theme.var.color.success_light_900}" : "${args.theme.var.color.error_light_900}"};
  color: ${worker.status === "running" ? "${args.theme.var.color.success_dark_300}" : "${args.theme.var.color.error_dark_300}"};
}\`;`}
                                  >
                                    {worker.status}
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
                                    onClick={() =>
                                      handleStartWorker(
                                        subdomainStatus.subdomain,
                                        worker.workerKey,
                                      )
                                    }
                                    disabled={worker.status === "running"}
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
  opacity: 0.5;
}\`;`}
                                  >
                                    Start
                                  </As>
                                  <As
                                    as="button"
                                    onClick={() =>
                                      handleStopWorker(
                                        subdomainStatus.subdomain,
                                        worker.workerKey,
                                      )
                                    }
                                    disabled={worker.status !== "running"}
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
  opacity: 0.5;
}\`;`}
                                  >
                                    Stop
                                  </As>
                                </As>
                              </As>
                            )}
                          </For>
                        </Show>
                      </As>
                    )}
                  </For>
                </As>
              </Show>
            </>
          );
        }}
      </Show>
    </As>
  );
}
