import * as compose from "docker-compose";
import * as fs from "fs";
import * as path from "path";

import { getBaseDir } from "../upload/getBaseDir";

export async function deleteDockerComposeDirectory(
  subdomain: string,
): Promise<string> {
  const dir: string = getBaseDir();
  const mgplatDir: string = path.join(dir, subdomain, "memgraph-platform");
  const mgplatComposePath: string = path.join(mgplatDir, "docker-compose.yml");

  try {
    // Stop Docker Compose
    await compose.downAll({
      config: mgplatComposePath,
      cwd: mgplatDir,
    });

    // Remove docker-compose file
    if (fs.existsSync(mgplatComposePath)) {
      fs.unlinkSync(mgplatComposePath);
      console.log(`Deleted docker-compose file at: ${mgplatComposePath}`);
    }

    // Remove directory
    if (fs.existsSync(mgplatDir)) {
      fs.rmdirSync(mgplatDir, { recursive: true });
      console.log(`Deleted directory at: ${mgplatDir}`);
    }

    return "";
  } catch (error: any) {
    return `Failed to delete Docker Compose directory ${mgplatDir}: ${error.message}`;
  }
}
