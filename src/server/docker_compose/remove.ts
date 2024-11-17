import { execSync } from "child_process";
import * as path from "path";
import * as fs from "fs";
import { getBaseDir } from "../upload/getBaseDir";
import * as compose from "docker-compose";

export async function removeDockerComposeDirectory(
  subdomain: string
): Promise<string> {
  const dir: string = getBaseDir();
  const mgplatDir: string = path.join(dir, subdomain, "memgraph-platform");
  const mgplatComposePath: string = path.join(mgplatDir, "docker-compose.yml");

  try {
    // Stop Docker Compose
    await compose.downAll({
      cwd: mgplatDir,
      config: mgplatComposePath,
    });

    // Remove directory
    fs.rmdirSync(mgplatDir, { recursive: true });

    return "";
  } catch (error: any) {
    return `Failed to remove Docker Compose directory ${mgplatDir}: ${error.message}`;
  }
}
