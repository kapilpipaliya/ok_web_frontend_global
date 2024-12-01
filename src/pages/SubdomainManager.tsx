import { DockerComposePsResult, TypedDockerComposeResult } from "docker-compose";
import { createEffect, createSignal, For, Show } from "solid-js";
import { createStore, reconcile } from "solid-js/store";

import { fetchDataFromMG } from "~/cypher/get/fetchDataFromMG";
import { Vertex } from "~/lib/graph/graph";
import { startMemgraphService } from "~/server/docker_compose/start"; // Import the start function
import { getDockerComposeStatus } from "~/server/docker_compose/status"; // Import the function

export function SubdomainManager() {
  const [subdomains, setSubdomains] = createStore<Vertex[]>([]);
  const [loading, setLoading] = createSignal(true);
  const [statuses, setStatuses] = createStore<TypedDockerComposeResult<DockerComposePsResult>[]>([]); // State for statuses

  // Fetch subdomains on component mount
  createEffect(() => {
    const loadSubdomains = async () => {
      setLoading(true);
      try {
        const data = await fetchDataFromMG({
          expression: `g:'SubDomain'`,
        });
        setSubdomains(data.result || []);
        
        // Fetch the status after loading subdomains
        const subdomainKeys = data.result.map((subdomain: Vertex) => subdomain.P.key);
        const statusResults = await getDockerComposeStatus(subdomainKeys);
        setStatuses(statusResults);
      } catch (error) {
        console.error("Error loading subdomains or statuses:", error);
      } finally {
        setLoading(false);
      }
    };
    loadSubdomains();
  });

  const startSubdomain = async (subdomain: Vertex) => {
    try {
      const result = await startMemgraphService(subdomain.P.key);
      if (result === "") {
        alert(`Subdomain ${subdomain.P.key} started successfully.`);
        
        // Fetch new status after 2 seconds
        setTimeout(async () => {
          const updatedStatuses = await getDockerComposeStatus([subdomain.P.key]);
          const index = subdomains.findIndex(sd => sd.P.key === subdomain.P.key);
          setStatuses(index, reconcile(updatedStatuses[0]));
        }, 2000);
      } else {
        alert(`Failed to start subdomain ${subdomain.P.key}: ${result}`);
      }
    } catch (error: unknown) {
      console.error("Error starting subdomain:", error);
      alert(`Error starting subdomain ${subdomain.P.key}: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  };

  return (
    <div class="p:1rem bg:rgb(243,244,246) rounded:0.5rem shadow:0|2px|4px|rgba(0,0,0,0.1)">
      <h2 class="text:1.5rem mb:1rem">Subdomain Manager</h2>
      <Show when={loading()}>
        <p class="text:rgb(107,114,128)">Loading...</p>
      </Show>
      <Show when={!loading()}>
        <table class="min-w-full bg:white border:1px|solid|rgb(209,213,219)">
          <thead>
            <tr class="bg:rgb(229,231,235)">
              <th class="px:1rem py:0.5rem">Key</th>
              <th class="px:1rem py:0.5rem">Status</th>
              <th class="px:1rem py:0.5rem">Docker Status</th> {/* New column for Docker status */}
              <th class="px:1rem py:0.5rem">Driver Port</th>
              <th class="px:1rem py:0.5rem">Lab Port</th>
              <th class="px:1rem py:0.5rem">Logs Port</th>
              <th class="px:1rem py:0.5rem">Services Running</th> {/* New column for services running */}
              <th class="px:1rem py:0.5rem">Action</th>
            </tr>
          </thead>
          <tbody>
            <For each={subdomains}>
              {(subdomain, index) => {
                const dockerStatus = () => statuses[index()] || {};
                const serviceData = () => dockerStatus().data?.services || [];
                const serviceInfo = () => serviceData().find((service) => service.name.includes(subdomain.P.key)) || {};
                const servicesRunning = () =>serviceData().length > 0 ? serviceData().map(service => service.name).join(", ") : "None";

                return (
                  <tr class="hover:bg:rgb(229,231,235)">
                    <td class="border:1px|solid|rgb(209,213,219) px:1rem py:0.5rem">{subdomain.P.key}</td>
                    <td class="border:1px|solid|rgb(209,213,219) px:1rem py:0.5rem">{subdomain.P.status}</td>
                    <td class="border:1px|solid|rgb(209,213,219) px:1rem py:0.5rem">{serviceInfo().state || "N/A"}</td> {/* Display Docker status */}
                    <td class="border:1px|solid|rgb(209,213,219) px:1rem py:0.5rem">{subdomain.P.driverPort}</td>
                    <td class="border:1px|solid|rgb(209,213,219) px:1rem py:0.5rem">{subdomain.P.labPort}</td>
                    <td class="border:1px|solid|rgb(209,213,219) px:1rem py:0.5rem">{subdomain.P.logsPort}</td>
                    <td class="border:1px|solid|rgb(209,213,219) px:1rem py:0.5rem">{servicesRunning()}</td> {/* Display services running */}
                    <td class="border:1px|solid|rgb(209,213,219) px:1rem py:0.5rem">
                      <Show when={servicesRunning() === "None"}>
                        <button class="bg:rgb(37,99,235) text:white px:1rem py:0.5rem rounded:0.25rem" onClick={() => startSubdomain(subdomain)}>
                          Start Database
                        </button>
                      </Show>
                    </td>
                  </tr>
                );
              }}
            </For>
          </tbody>
        </table>
      </Show>
    </div>
  );
}