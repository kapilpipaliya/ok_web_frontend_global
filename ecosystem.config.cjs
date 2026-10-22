// @ts-check

// Load environment variables from .env file
require("dotenv").config({ path: ".env" });

const path = require("node:path");
const os = require("node:os");

/** @type {NodeJS.ProcessEnv} */
const env = { ...process.env };

// Cursor sandbox sets PLAYWRIGHT_BROWSERS_PATH under /tmp/cursor-sandbox-cache,
// which disappears between sessions and breaks signup email rendering.
// Force the stable default cache so PM2 daemon inheritance cannot reintroduce it.
if (
  !env.PLAYWRIGHT_BROWSERS_PATH ||
  env.PLAYWRIGHT_BROWSERS_PATH.includes("cursor-sandbox-cache")
) {
  env.PLAYWRIGHT_BROWSERS_PATH = path.join(
    os.homedir(),
    ".cache",
    "ms-playwright",
  );
}

/**
 * PM2 Ecosystem Configuration
 *
 * Clustering is owned by scripts/pm2/entry.mjs (Node cluster + shared PORT).
 * Nitro/srvx defaults to exclusive listen sockets; the entry patches that and
 * forks NITRO_CLUSTER_WORKERS children so every worker actually serves HTTP.
 *
 * @type {import('pm2').StartOptions}
 */
module.exports = {
  apps: [
    {
      name: "ok-web-frontend",
      script: "./scripts/pm2/entry.mjs",
      instances: 1,
      exec_mode: "fork",
      env: {
        ...env,
        NODE_ENV: process.env.NODE_ENV || "production",
        PORT: process.env.DOMAIN_PORT || 3001,
        NITRO_CLUSTER_WORKERS: process.env.NITRO_CLUSTER_WORKERS || "3",
      },
      // Primary is small; child workers hold the real heap. Keep headroom anyway.
      max_memory_restart: "3500M",
      kill_timeout: 30000,
      listen_timeout: 120000,
      shutdown_with_message: false,
      autorestart: true,
      max_restarts: 10,
      min_uptime: "10s",
      restart_delay: 1000,
      wait_ready: true,
      error_file: "./logs/err.log",
      out_file: "./logs/out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      merge_logs: true,
      log_type: "json",
    },
  ],
};
