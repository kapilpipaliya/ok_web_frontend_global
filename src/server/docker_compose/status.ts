import * as compose from "docker-compose";
import * as path from "path";

import { getBaseDir } from "../upload/getBaseDir";

export async function getDockerComposeStatus(subdomains: string[]): Promise<compose.TypedDockerComposeResult<compose.DockerComposePsResult>[]> {
  'use server';
  const dir: string = getBaseDir();
  const statuses: compose.TypedDockerComposeResult<compose.DockerComposePsResult>[] = [];

  for (const subdomain of subdomains) {
    if (!subdomain) continue;
    const mgplatDir: string = path.join(dir, subdomain, "memgraph-platform");
    const mgplatComposePath: string = path.join(mgplatDir, "docker-compose.yml");

    console.log(
      `Fetching status for Memgraph service using docker-compose file from: ${mgplatComposePath}`,
    );

    try {
      const status = await compose.ps({
        composeOptions: ["--project-name", subdomain],
        cwd: path.join(mgplatDir),
      });
      console.log("Memgraph service status retrieved successfully");
      statuses.push(status);
    } catch (err: any) {
      console.log("Failed to get Memgraph service status:", err.message);
      statuses.push({
        data: {
          services: [],
        },
        err: `Error: Failed to get Memgraph service status for ${subdomain}`,
        exitCode: 1,
        out: "",
      });
    }
  }

  return statuses;
}
