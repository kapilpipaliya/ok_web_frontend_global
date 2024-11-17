import * as path from "path";
import * as compose from "docker-compose";
import { getBaseDir } from "../upload/getBaseDir";

export async function startMemgraphService(subdomain: string): Promise<string> {
  const dir: string = getBaseDir();
  const mgplatDir: string = path.join(dir, subdomain, "memgraph-platform");
  const mgplatComposePath: string = path.join(mgplatDir, "docker-compose.yml");

  console.log(
    `Starting Memgraph service using docker-compose file from: ${mgplatComposePath}`
  );

  try {
    await compose.upOne("memgraph", { cwd: path.join(mgplatDir), log: true });
    console.log("Memgraph service started successfully");
  } catch (err: any) {
    console.log("Failed to start Memgraph service:", err.message);
    return "Error: Failed to start Memgraph service";
  }

  return "";
}

