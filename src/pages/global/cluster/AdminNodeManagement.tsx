import { createAsync } from "@solidjs/router";
import { createSignal, For, Show, onCleanup, createEffect } from "solid-js";
import { useToast } from "~/components/styled/modal/Toast";
import { As } from "~/components/As";
import {
  getClusterNodes,
  getClusterWorkerStatus,
} from "~/server/queue/initWorkers";

interface NodeInfo {
  nodeId: string;
  hostname: string;
  pid: number;
  startedAt: number;
  lastHeartbeat: number;
}

interface WorkerInfo {
  workerKey: string;
  nodeId: string;
  hostname: string;
  status: string;
}

export function AdminNodeManagement() {
  const { showSuccessToast, showErrorToast } = useToast();
  const [refreshKey, setRefreshKey] = createSignal(0);
  const [errorMessage, setErrorMessage] = createSignal<string | null>(null);
  const [expandedNodeId, setExpandedNodeId] = createSignal<string | null>(null);
  const [nodeWorkers, setNodeWorkers] = createSignal<
    Record<string, WorkerInfo[]>
  >({});

  // Auto-refresh state - properly initialize from localStorage
  const getInitialAutoRefresh = () => {
    if (typeof window === "undefined") return false;
    const saved = localStorage.getItem("clusterNodes_autoRefresh");
    return saved === "true";
  };

  const getInitialInterval = () => {
    if (typeof window === "undefined") return 30;
    const saved = localStorage.getItem("clusterNodes_refreshInterval");
    return saved ? parseInt(saved) : 30;
  };

  const [autoRefreshEnabled, setAutoRefreshEnabled] = createSignal(
    getInitialAutoRefresh(),
  );
  const [refreshInterval, setRefreshInterval] = createSignal(
    getInitialInterval(),
  );

  // Previous state for change detection
  const [previousNodeCount, setPreviousNodeCount] = createSignal<number | null>(
    null,
  );
  const [previousHealthyCount, setPreviousHealthyCount] = createSignal<
    number | null
  >(null);
  const [isInitialLoad, setIsInitialLoad] = createSignal(true);

  const clusterNodes = createAsync(
    async () => {
      // Use refreshKey as dependency (read it to track changes)
      const key = refreshKey();
      const result = await getClusterNodes();
      return result;
    },
    { deferStream: true },
  );

  // Error handling effect
  createEffect(() => {
    const data = clusterNodes();
    if (data) {
      if (data.success && data.data) {
        setErrorMessage(null);
      } else if (!data.success && data.error) {
        setErrorMessage(data.error);
      }
    }
  });

  // Auto-refresh effect
  createEffect(() => {
    const enabled = autoRefreshEnabled();
    const intervalSeconds = refreshInterval();

    if (enabled) {
      const interval = setInterval(() => {
        setRefreshKey((prev) => prev + 1);
      }, intervalSeconds * 1000);

      onCleanup(() => {
        clearInterval(interval);
      });
    }
  });

  // Change detection effect
  createEffect(() => {
    const data = clusterNodes();
    if (!(data?.success && data.data)) {
      return;
    }

    const nodes = data.data.nodes;
    const currentCount = nodes.length;
    const currentHealthy = nodes.filter((n: NodeInfo) =>
      isNodeHealthy(n.lastHeartbeat),
    ).length;

    // Skip notifications on initial load
    if (isInitialLoad()) {
      setIsInitialLoad(false);
      setPreviousNodeCount(currentCount);
      setPreviousHealthyCount(currentHealthy);
      return;
    }

    const prevCount = previousNodeCount();
    const prevHealthy = previousHealthyCount();

    // Check for node count changes - only update if different
    if (prevCount !== null && prevCount !== currentCount) {
      if (currentCount > prevCount) {
        showSuccessToast(
          `🆕 New node joined the cluster (${currentCount} total)`,
        );
      } else {
        showErrorToast(`❌ Node left the cluster (${currentCount} remaining)`);
      }
      setPreviousNodeCount(currentCount);
    } else if (prevCount === null) {
      setPreviousNodeCount(currentCount);
    }

    // Check for health status changes - only update if different
    if (prevHealthy !== null && prevHealthy !== currentHealthy) {
      if (currentHealthy < prevHealthy) {
        showErrorToast(
          `⚠️ Node became unhealthy (${currentHealthy}/${currentCount} healthy)`,
        );
      } else if (currentHealthy > prevHealthy) {
        showSuccessToast(
          `✅ Node recovered (${currentHealthy}/${currentCount} healthy)`,
        );
      }
      setPreviousHealthyCount(currentHealthy);
    } else if (prevHealthy === null) {
      setPreviousHealthyCount(currentHealthy);
    }
  });

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
    showSuccessToast("Node status refreshed");
  };

  const toggleAutoRefresh = () => {
    const newValue = !autoRefreshEnabled();
    setAutoRefreshEnabled(newValue);
    localStorage.setItem("clusterNodes_autoRefresh", String(newValue));
    if (newValue) {
      showSuccessToast(`Auto-refresh enabled (${refreshInterval()}s)`);
    } else {
      showSuccessToast("Auto-refresh disabled");
    }
  };

  const handleIntervalChange = (seconds: number) => {
    setRefreshInterval(seconds);
    localStorage.setItem("clusterNodes_refreshInterval", String(seconds));
    showSuccessToast(`Refresh interval set to ${seconds}s`);
  };

  const toggleNodeDetails = async (nodeId: string) => {
    if (expandedNodeId() === nodeId) {
      setExpandedNodeId(null);
    } else {
      setExpandedNodeId(nodeId);

      // Load workers for this node if not already loaded
      if (!nodeWorkers()[nodeId]) {
        try {
          const workerResult = await getClusterWorkerStatus();
          if (workerResult.success && workerResult.data) {
            const workersMap: Record<string, WorkerInfo[]> = {};

            // Group workers by node
            workerResult.data.subdomains.forEach((subdomain: any) => {
              subdomain.workers.forEach((worker: WorkerInfo) => {
                if (!workersMap[worker.nodeId]) {
                  workersMap[worker.nodeId] = [];
                }
                workersMap[worker.nodeId].push(worker);
              });
            });

            setNodeWorkers(workersMap);
          }
        } catch (error) {
          console.error("Error loading workers:", error);
        }
      }
    }
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

  const formatLastSeen = (lastHeartbeat: number) => {
    const timeSinceMs = Date.now() - lastHeartbeat;
    const seconds = Math.floor(timeSinceMs / 1000);
    const minutes = Math.floor(seconds / 60);

    if (minutes > 1) return `${minutes} minutes ago`;
    if (seconds > 10) return `${seconds} seconds ago`;
    return "Just now";
  };

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const isNodeHealthy = (lastHeartbeat: number) => {
    const timeSinceMs = Date.now() - lastHeartbeat;
    return timeSinceMs < 90000; // Consider healthy if heartbeat within 90 seconds
  };

  return (
    <As
      as="div"
      css={`return \`._id {
  padding: 2rem;
}\`;`}
    >
      {/* Pulsing animation keyframes */}
      <As
        as="style"
        dangerouslySetInnerHTML={{
          __html: `
            @keyframes pulse-dot {
              0%, 100% { opacity: 1; transform: scale(1); }
              50% { opacity: 0.7; transform: scale(1.1); }
            }
          `,
        }}
      />

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
          <As as="span">Cluster Node Management</As>
        </As>
        <As
          as="p"
          css={`return \`._id {
  font-size: 0.875rem;
  margin: 0;
  line-height: 1.5;
}\`;`}
        >
          This page shows all active nodes in the cluster. Nodes automatically
          register themselves when they start and send heartbeat signals every
          30 seconds. Click any node to view details and workers running on it.
        </As>
      </As>

      <As
        as="div"
        css={`return \`._id {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
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
          Cluster Nodes
        </As>

        {/* Controls */}
        <As
          as="div"
          css={`return \`._id {
  display: flex;
  align-items: center;
  gap: 1rem;
}\`;`}
        >
          {/* Auto-refresh toggle */}
          <As
            as="div"
            css={`return \`._id {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  border: 1px solid \${args.theme.var.color.border};
  background: \${args.theme.var.color.background};
}\`;`}
          >
            <As
              as="input"
              type="checkbox"
              checked={autoRefreshEnabled()}
              onChange={toggleAutoRefresh}
              css={`return \`._id {
  cursor: pointer;
}\`;`}
            />
            <As
              as="span"
              css={`return \`._id {
  font-size: 0.875rem;
  font-weight: 500;
}\`;`}
            >
              Auto-refresh
            </As>

            {/* Interval selector */}
            <Show when={autoRefreshEnabled()}>
              <As
                as="select"
                value={refreshInterval()}
                onChange={(e: Event) =>
                  handleIntervalChange(
                    parseInt((e.target as HTMLSelectElement).value),
                  )
                }
                css={`return \`._id {
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  border: 1px solid \${args.theme.var.color.border};
  background: \${args.theme.var.color.background};
  font-size: 0.875rem;
  cursor: pointer;
}\`;`}
              >
                <As as="option" value="5">
                  5s
                </As>
                <As as="option" value="10">
                  10s
                </As>
                <As as="option" value="30">
                  30s
                </As>
                <As as="option" value="60">
                  60s
                </As>
              </As>
            </Show>
          </As>

          {/* Manual refresh button */}
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
                Error Loading Node Status
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
        when={clusterNodes()?.success && !errorMessage()}
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
              Loading cluster node status...
            </As>
          </Show>
        }
      >
        {() => {
          const data = clusterNodes()!.data!;
          const nodes = data.nodes;
          const currentNode = data.currentNode;
          const totalNodes = nodes.length;
          const healthyCount = nodes.filter((n: NodeInfo) =>
            isNodeHealthy(n.lastHeartbeat),
          ).length;

          return (
            <>
              {/* Stats Cards */}
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
                    Total Nodes
                  </As>
                  <As
                    as="p"
                    css={`return \`._id {
  font-size: 1.875rem;
  font-weight: 600;
  margin: 0;
}\`;`}
                  >
                    {totalNodes}
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
                    Healthy Nodes
                  </As>
                  <As
                    as="p"
                    css={`return \`._id {
  font-size: 1.875rem;
  font-weight: 600;
  margin: 0;
}\`;`}
                  >
                    {healthyCount}
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
                    Current Node
                  </As>
                  <As
                    as="p"
                    css={`return \`._id {
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0;
  font-family: monospace;
}\`;`}
                  >
                    {currentNode?.hostname || "Unknown"}
                  </As>
                </As>
              </As>

              {/* Nodes List */}
              <Show
                when={nodes.length > 0}
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
                      {"🖥️"}
                    </As>
                    <As as="p">No nodes found in the cluster.</As>
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
                  {/* Header */}
                  <As
                    as="div"
                    css={`return \`._id {
  background: \${args.theme.var.color.background_light_200};
  padding: 0.75rem 1.5rem;
  font-weight: 600;
  font-size: 0.875rem;
  display: grid;
  grid-template-columns: 2fr 1fr 120px 150px 150px 150px 100px;
  gap: 1rem;
  border-bottom: 1px solid \${args.theme.var.color.border};
}\`;`}
                  >
                    <As as="div">Node ID / Hostname</As>
                    <As as="div">PID</As>
                    <As as="div">Status</As>
                    <As as="div">Uptime</As>
                    <As as="div">Started At</As>
                    <As as="div">Last Heartbeat</As>
                    <As as="div">Actions</As>
                  </As>

                  {/* Node Rows */}
                  <For each={nodes}>
                    {(node: NodeInfo) => {
                      const isCurrent = currentNode?.nodeId === node.nodeId;
                      const healthy = isNodeHealthy(node.lastHeartbeat);
                      const isExpanded = () => expandedNodeId() === node.nodeId;
                      const workers = () => nodeWorkers()[node.nodeId] || [];

                      return (
                        <>
                          <As
                            as="div"
                            css={`return \`._id {
  padding: 1rem 1.5rem;
  border-top: 1px solid \${args.theme.var.color.border};
  display: grid;
  grid-template-columns: 2fr 1fr 120px 150px 150px 150px 100px;
  gap: 1rem;
  align-items: center;
  background: \${args.theme.var.color.background};
  transition: background 0.2s;
  cursor: pointer;
}
._id:hover {
  background: \${args.theme.var.color.background_light_200};
}\`;`}
                            onClick={() => toggleNodeDetails(node.nodeId)}
                          >
                            {/* Node ID / Hostname */}
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
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}\`;`}
                                title={node.nodeId}
                              >
                                {node.nodeId}
                              </As>
                            </As>

                            {/* PID */}
                            <As
                              as="div"
                              css={`return \`._id {
  font-weight: 600;
  font-family: monospace;
}\`;`}
                            >
                              {node.pid}
                            </As>

                            {/* Status with pulsing indicator */}
                            <As as="div">
                              <As
                                as="span"
                                css={`return \`._id {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 500;
  background: ${healthy ? "${args.theme.var.color.success_light_900}" : "${args.theme.var.color.warning_light_900}"};
  color: ${healthy ? "${args.theme.var.color.success_dark_300}" : "${args.theme.var.color.warning_dark_300}"};
}\`;`}
                              >
                                <As
                                  as="span"
                                  css={`return \`._id {
  width: 6px;
  height: 6px;
  border-radius: 9999px;
  background: ${healthy ? "${args.theme.var.color.success}" : "${args.theme.var.color.warning}"};
  ${healthy ? "animation: pulse-dot 2s ease-in-out infinite;" : ""}
}\`;`}
                                />
                                <As as="span">
                                  {healthy ? "Healthy" : "Stale"}
                                </As>
                              </As>
                            </As>

                            {/* Uptime */}
                            <As
                              as="div"
                              css={`return \`._id {
  font-size: 0.875rem;
}\`;`}
                            >
                              {formatUptime(node.startedAt)}
                            </As>

                            {/* Started At */}
                            <As
                              as="div"
                              css={`return \`._id {
  font-size: 0.875rem;
  color: \${args.theme.var.color.text_light_600};
}\`;`}
                            >
                              {formatTimestamp(node.startedAt)}
                            </As>

                            {/* Last Heartbeat */}
                            <As
                              as="div"
                              css={`return \`._id {
  font-size: 0.875rem;
  color: \${args.theme.var.color.text_light_600};
}\`;`}
                            >
                              {formatLastSeen(node.lastHeartbeat)}
                            </As>

                            {/* Actions */}
                            <As
                              as="div"
                              css={`return \`._id {
  display: flex;
  align-items: center;
  justify-content: center;
}\`;`}
                            >
                              <As
                                as="span"
                                css={`return \`._id {
  font-size: 1.25rem;
  transition: transform 0.2s;
  transform: rotate(${isExpanded() ? "180deg" : "0deg"});
}\`;`}
                              >
                                ▼
                              </As>
                            </As>
                          </As>

                          {/* Expanded Details */}
                          <Show when={isExpanded()}>
                            <As
                              as="div"
                              css={`return \`._id {
  padding: 1.5rem;
  border-top: 1px solid \${args.theme.var.color.border};
  background: \${args.theme.var.color.background_light_100};
  animation: slideDown 0.2s ease-out;
}
@keyframes slideDown {
  from {
    opacity: 0;
    max-height: 0;
  }
  to {
    opacity: 1;
    max-height: 500px;
  }
}\`;`}
                            >
                              <As
                                as="h4"
                                css={`return \`._id {
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 1rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}\`;`}
                              >
                                <As as="span">📋</As>
                                <As as="span">Node Details</As>
                              </As>

                              <As
                                as="div"
                                css={`return \`._id {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin-bottom: 1.5rem;
}\`;`}
                              >
                                <As
                                  as="div"
                                  css={`return \`._id {
  padding: 1rem;
  border-radius: 0.375rem;
  background: \${args.theme.var.color.background};
  border: 1px solid \${args.theme.var.color.border};
}\`;`}
                                >
                                  <As
                                    as="div"
                                    css={`return \`._id {
  font-size: 0.75rem;
  color: \${args.theme.var.color.text_light_600};
  margin-bottom: 0.25rem;
  text-transform: uppercase;
}\`;`}
                                  >
                                    Full Node ID
                                  </As>
                                  <As
                                    as="div"
                                    css={`return \`._id {
  font-family: monospace;
  font-size: 0.875rem;
  word-break: break-all;
}\`;`}
                                  >
                                    {node.nodeId}
                                  </As>
                                </As>

                                <As
                                  as="div"
                                  css={`return \`._id {
  padding: 1rem;
  border-radius: 0.375rem;
  background: \${args.theme.var.color.background};
  border: 1px solid \${args.theme.var.color.border};
}\`;`}
                                >
                                  <As
                                    as="div"
                                    css={`return \`._id {
  font-size: 0.75rem;
  color: \${args.theme.var.color.text_light_600};
  margin-bottom: 0.25rem;
  text-transform: uppercase;
}\`;`}
                                  >
                                    Workers Running
                                  </As>
                                  <As
                                    as="div"
                                    css={`return \`._id {
  font-size: 1.5rem;
  font-weight: 600;
}\`;`}
                                  >
                                    {workers().length}
                                  </As>
                                </As>
                              </As>

                              {/* Workers List */}
                              <Show when={workers().length > 0}>
                                <As
                                  as="h5"
                                  css={`return \`._id {
  font-size: 0.875rem;
  font-weight: 600;
  margin: 0 0 0.75rem 0;
  color: \${args.theme.var.color.text_light_600};
  text-transform: uppercase;
}\`;`}
                                >
                                  Active Workers
                                </As>
                                <As
                                  as="div"
                                  css={`return \`._id {
  display: grid;
  gap: 0.5rem;
}\`;`}
                                >
                                  <For each={workers()}>
                                    {(worker) => (
                                      <As
                                        as="div"
                                        css={`return \`._id {
  padding: 0.75rem 1rem;
  border-radius: 0.375rem;
  background: \${args.theme.var.color.background};
  border: 1px solid \${args.theme.var.color.border};
  display: flex;
  justify-content: space-between;
  align-items: center;
}\`;`}
                                      >
                                        <As
                                          as="span"
                                          css={`return \`._id {
  font-family: monospace;
  font-size: 0.875rem;
}\`;`}
                                        >
                                          {worker.workerKey}
                                        </As>
                                        <As
                                          as="span"
                                          css={`return \`._id {
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
  background: ${worker.status === "running" ? "${args.theme.var.color.success_light_900}" : "${args.theme.var.color.error_light_900}"};
  color: ${worker.status === "running" ? "${args.theme.var.color.success_dark_300}" : "${args.theme.var.color.error_dark_300}"};
}\`;`}
                                        >
                                          {worker.status}
                                        </As>
                                      </As>
                                    )}
                                  </For>
                                </As>
                              </Show>

                              <Show when={workers().length === 0}>
                                <As
                                  as="div"
                                  css={`return \`._id {
  padding: 2rem;
  text-align: center;
  color: \${args.theme.var.color.text_light_600};
  font-size: 0.875rem;
}\`;`}
                                >
                                  No workers running on this node
                                </As>
                              </Show>
                            </As>
                          </Show>
                        </>
                      );
                    }}
                  </For>
                </As>
              </Show>

              {/* Additional Node Details */}
              <As
                as="div"
                css={`return \`._id {
  margin-top: 2rem;
  padding: 1.5rem;
  border: 1px solid \${args.theme.var.color.border};
  border-radius: 0.5rem;
  background: \${args.theme.var.color.background_light_100};
}\`;`}
              >
                <As
                  as="h3"
                  css={`return \`._id {
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 1rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}\`;`}
                >
                  <As as="span">📊</As>
                  <As as="span">Node Health Information</As>
                </As>
                <As
                  as="div"
                  css={`return \`._id {
  display: grid;
  gap: 0.75rem;
  font-size: 0.875rem;
  line-height: 1.6;
}\`;`}
                >
                  <As
                    as="div"
                    css={`return \`._id {
  display: flex;
  align-items: start;
  gap: 0.5rem;
}\`;`}
                  >
                    <As
                      as="span"
                      css={`return \`._id {
  color: \${args.theme.var.color.success};
  font-weight: 600;
}\`;`}
                    >
                      Healthy:
                    </As>
                    <As as="span">
                      Node has sent a heartbeat within the last 90 seconds
                      (pulsing green indicator)
                    </As>
                  </As>
                  <As
                    as="div"
                    css={`return \`._id {
  display: flex;
  align-items: start;
  gap: 0.5rem;
}\`;`}
                  >
                    <As
                      as="span"
                      css={`return \`._id {
  color: \${args.theme.var.color.warning};
  font-weight: 600;
}\`;`}
                    >
                      Stale:
                    </As>
                    <As as="span">
                      Node hasn't sent a heartbeat for more than 90 seconds (may
                      be offline or experiencing issues)
                    </As>
                  </As>
                  <As
                    as="div"
                    css={`return \`._id {
  margin-top: 0.5rem;
  padding-top: 0.75rem;
  border-top: 1px solid \${args.theme.var.color.border};
  color: \${args.theme.var.color.text_light_600};
}\`;`}
                  >
                    Nodes automatically register when they start and send
                    heartbeat signals every 30 seconds. Click any node row to
                    expand and view detailed information including workers
                    running on that node.
                    {autoRefreshEnabled() &&
                      ` Page auto-refreshes every ${refreshInterval()} seconds.`}
                  </As>
                </As>
              </As>
            </>
          );
        }}
      </Show>
    </As>
  );
}
