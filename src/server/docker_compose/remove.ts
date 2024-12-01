
import * as compose from "docker-compose";
import * as fs from "fs";
import * as path from "path";

import { getBaseDir } from "../upload/getBaseDir";

export async function removeDockerComposeDirectory(
  subdomain: string,
): Promise<string> {
  const dir: string = getBaseDir();
  const mgplatDir: string = path.join(dir, subdomain, "memgraph-platform");
  const mgplatComposePath: string = path.join(mgplatDir, "docker-compose.yml");

  try {
    // Stop Docker Compose
    await compose.downAll({
      composeOptions: ["--project-name", subdomain],
      config: mgplatComposePath,
      cwd: mgplatDir,
    });

    // Remove directory
    fs.rmdirSync(mgplatDir, { recursive: true });

    return "";
  } catch (error: any) {
    return `Failed to remove Docker Compose directory ${mgplatDir}: ${error.message}`;
  }
}
