/**
 * PM2 entry: Node cluster primary + workers.
 *
 * PM2 runs ONE fork of this file. It forks NITRO_CLUSTER_WORKERS children that
 * share PORT via the cluster module (and a srvx listen patch).
 *
 * This avoids srvx's exclusive:true default, which left secondary PM2 instances
 * with no listen socket (~60MB idle forever).
 */
import cluster from "node:cluster";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import "./force-shared-port.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const serverEntry = pathToFileURL(join(root, "production/server/index.mjs")).href;
const ssrEntry = pathToFileURL(join(root, "production/server/_ssr/ssr.mjs")).href;

const workerCount = Math.max(
  1,
  Number.parseInt(
    process.env.NITRO_CLUSTER_WORKERS || process.env.WEB_CONCURRENCY || "3",
    10,
  ) || 3,
);

if (cluster.isPrimary) {
  console.log(
    `[Cluster] primary pid=${process.pid} forking ${workerCount} workers`,
  );

  let readyCount = 0;
  let pm2ReadySent = false;

  const noteReady = () => {
    readyCount += 1;
    if (!pm2ReadySent && readyCount >= workerCount) {
      pm2ReadySent = true;
      console.log(`[Cluster] all ${workerCount} workers ready`);
      try {
        process.send?.("ready");
      } catch {
        /* not under PM2 */
      }
    }
  };

  const forkOne = (workerId) => {
    const worker = cluster.fork({
      WORKER_ID: String(workerId),
      NODE_APP_INSTANCE: String(workerId - 1),
    });
    worker.on("message", (msg) => {
      if (msg === "ready" || msg?.type === "ready") noteReady();
    });
  };

  for (let i = 1; i <= workerCount; i++) forkOne(i);

  cluster.on("exit", (worker, code, signal) => {
    if (worker.exitedAfterDisconnect) return;
    const workerId = Number(worker.process.env?.WORKER_ID) || worker.id;
    console.error(
      `[Cluster] worker pid=${worker.process.pid} exited code=${code} signal=${signal}; restarting #${workerId}`,
    );
    forkOne(workerId);
  });

  const stopWorkers = (signal) => {
    console.log(`[Cluster] primary received ${signal}; stopping workers`);
    for (const id of Object.keys(cluster.workers || {})) {
      cluster.workers?.[id]?.process.kill(signal);
    }
  };
  process.on("SIGINT", () => stopWorkers("SIGINT"));
  process.on("SIGTERM", () => stopWorkers("SIGTERM"));
} else {
  const workerId = process.env.WORKER_ID || "?";
  console.log(`[Cluster] worker #${workerId} pid=${process.pid} starting`);

  try {
    await import(serverEntry);
  } catch (error) {
    console.error(`[Cluster] worker #${workerId} server start failed:`, error);
    process.exit(1);
  }

  try {
    await import(ssrEntry);
    console.log(`[Cluster] worker #${workerId} SSR preloaded`);
  } catch (error) {
    console.warn(
      `[Cluster] worker #${workerId} SSR preload failed:`,
      error instanceof Error ? error.message : error,
    );
  }

  console.log(`[Cluster] worker #${workerId} ready`);
  process.send?.("ready");
}
