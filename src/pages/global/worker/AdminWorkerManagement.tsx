import { createAsync } from "@solidjs/router";
import { createSignal, For, Show } from "solid-js";
import { useToast } from "~/components/styled/modal/Toast";
import { As } from "~/components/As";
import {
  getAllSubdomainWorkerStatus,
  startWorkerForSubdomain,
  stopWorkerForSubdomain,
  initAllSubdomainWorkersUI,
  stopAllSubdomainWorkersUI,
} from "~/server/queue/initWorkers";

interface Worker {
  key: string;
  description: string;
  active: boolean;
}

interface SubdomainWorkerStatus {
  subdomain: string;
  name: string;
  totalWorkers: number;
  activeWorkers: number;
  workers: Worker[];
}

export function AdminWorkerManagement() {
  const { showSuccessToast, showErrorToast } = useToast();
  const [refreshKey, setRefreshKey] = createSignal(0);

  const workerStatus = createAsync(
    async () => {
      // Use refreshKey as dependency
      refreshKey();
      return await getAllSubdomainWorkerStatus();
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
          <As as="span">Admin Worker Management</As>
        </As>
        <As
          as="p"
          css={`return \`._id {
  font-size: 0.875rem;
  margin: 0;
  line-height: 1.5;
}\`;`}
        >
          This page allows you to manage workers across all subdomains.
          Platform-level workers (like email worker) are managed automatically
          on app startup and cannot be controlled from this interface.
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
          All Subdomain Workers
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

      <Show
        when={workerStatus()?.success}
        fallback={
          <Show
            when={workerStatus()}
            fallback={
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
            }
          >
            <As
              as="div"
              css={`return \`._id {
  padding: 3rem;
  text-align: center;
  color: \${args.theme.var.color.error};
}\`;`}
            >
              {workerStatus()?.error || "Failed to load worker status"}
            </As>
          </Show>
        }
      >
        {() => {
          const data = workerStatus()!.data!;
          const totalWorkers = data.reduce(
            (sum, sd) => sum + sd.totalWorkers,
            0,
          );
          const totalActive = data.reduce(
            (sum, sd) => sum + sd.activeWorkers,
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
                    {data.length}
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
                    {totalActive}
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
  background: ${totalActive > 0 ? "${args.theme.var.color.success_light_900}" : "${args.theme.var.color.error_light_900}"};
  color: ${totalActive > 0 ? "${args.theme.var.color.success_dark_300}" : "${args.theme.var.color.error_dark_300}"};
}\`;`}
                    >
                      {totalActive > 0 ? "Active" : "Inactive"}
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
                when={data.length > 0}
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
                    <As as="p">No subdomains found.</As>
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
                  <For each={data}>
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
                              {subdomainStatus.name}
                            </As>
                            <As
                              as="span"
                              css={`return \`._id {
  font-family: monospace;
  font-size: 0.875rem;
  color: \${args.theme.var.color.text_light_600};
  background: \${args.theme.var.color.background_light_400};
  padding: 0.25rem 0.75rem;
  border-radius: 0.25rem;
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
                              Total: {subdomainStatus.totalWorkers}
                            </As>
                            <As as="span">
                              Active: {subdomainStatus.activeWorkers}
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
                              No worker functions defined for this subdomain
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
  grid-template-columns: 2fr 3fr 100px 150px;
  gap: 1rem;
  border-top: 1px solid \${args.theme.var.color.border};
}\`;`}
                          >
                            <As as="div">Worker Key</As>
                            <As as="div">Description</As>
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
  grid-template-columns: 2fr 3fr 100px 150px;
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
                                    onClick={() =>
                                      handleStartWorker(
                                        subdomainStatus.subdomain,
                                        worker.key,
                                      )
                                    }
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
                                    onClick={() =>
                                      handleStopWorker(
                                        subdomainStatus.subdomain,
                                        worker.key,
                                      )
                                    }
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
