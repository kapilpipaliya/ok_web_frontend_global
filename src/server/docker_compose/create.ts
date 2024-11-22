
import * as compose from "docker-compose";
import * as fs from "fs";
import * as path from "path";

import { getBaseDir } from "../upload/getBaseDir";

export async function executeDockerCompose(
  subdomain: string,
  driverPort: number,
  logsPort: number,
  labPort: number,
): Promise<string> {
  const dir: string = getBaseDir();
  const mgplatDir: string = path.join(dir, subdomain, "memgraph-platform");
  const mgplatComposePath: string = path.join(mgplatDir, "docker-compose.yml");

  const yamlError = createYamlFile(
    mgplatComposePath,
    mgplatDir,
    driverPort,
    logsPort,
    labPort,
  );
  if (yamlError) {
    return yamlError;
  }

  const composeError = await startDockerCompose(mgplatDir, mgplatComposePath);
  if (composeError) {
    return composeError;
  }

  return "";
}

export function createYamlFile(
  mgplatComposePath: string,
  mgplatDir: string,
  driverPort: number,
  logsPort: number,
  labPort: number,
): string {
  const dockerComposeContent = `
services:
  memgraph:
    image: memgraph/memgraph-mage:latest
    container_name: memgraph-mage
    pull_policy: always
    ports:
      - "${driverPort}:7687"
      - "${logsPort}:7444"
    command: ["--log-level=TRACE"]

  lab:
    image: memgraph/lab:latest
    container_name: memgraph-lab
    pull_policy: always
    ports:
      - "${labPort}:3000"
    depends_on:
      - memgraph
    environment:
      - QUICK_CONNECT_MG_HOST=memgraph
      - QUICK_CONNECT_MG_PORT=7687
`;

  // Ensure directory exists
  if (fs.existsSync(mgplatComposePath)) {
    console.log(
      `Overwriting docker-compose file found at: ${mgplatComposePath}`,
    );
  } else if (!fs.existsSync(mgplatDir)) {
    try {
      fs.mkdirSync(mgplatDir, { recursive: true });
    } catch (error: any) {
      return `Error: Failed to create directory ${mgplatDir}: ${error.message}`;
    }
  }

  // Write docker-compose content to file
  try {
    console.log(`Writing docker-compose content to: ${mgplatComposePath}`);
    fs.writeFileSync(mgplatComposePath, dockerComposeContent);
  } catch (error: any) {
    return `Error: Failed to write docker-compose content to ${mgplatComposePath}: ${error.message}`;
  }

  return "";
}

export async function startDockerCompose(
  mgplatDir: string,
  mgplatComposePath: string,
): Promise<string> {
  console.log(
    `Spinning up Memgraph Lab and Memgraph with MAGE using docker-compose file from: ${mgplatComposePath}`,
  );

  try {
    await compose.upOne("memgraph", { cwd: path.join(mgplatDir), log: true });
    console.log("done");
  } catch (err: any) {
    console.log("something went wrong:", err.message);
    return "Error: Failed to start Docker Compose";
  }

  return "";
}
