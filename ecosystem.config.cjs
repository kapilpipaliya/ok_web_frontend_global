// @ts-check

const fs = require("node:fs");
const path = require("node:path");

/**
 * Load KEY=VALUE pairs from a .env file into process.env.
 * Existing env vars are not overwritten. No dotenv dependency required.
 * @param {string} [envFilePath]
 */
function loadEnvFile(envFilePath = path.join(__dirname, ".env")) {
  if (!fs.existsSync(envFilePath)) return;
  for (const line of fs.readFileSync(envFilePath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    if (!key || process.env[key] !== undefined) continue;
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    process.env[key] = value;
  }
}

loadEnvFile();

const publicPort = Number(process.env.DOMAIN_PORT || 3001);
const workerA = publicPort + 2; // 3003
const workerB = publicPort + 3; // 3004

/** @type {import('pm2').StartOptions} */
const workerShared = {
  script: "./production/server/index.mjs",
  instances: 1,
  exec_mode: "fork",
  max_memory_restart: "2G",
  kill_timeout: 5000,
  listen_timeout: 10000,
  shutdown_with_message: false,
  autorestart: true,
  max_restarts: 10,
  min_uptime: "10s",
  restart_delay: 1000,
  wait_ready: false,
  error_file: "./logs/err.log",
  out_file: "./logs/out.log",
  log_date_format: "YYYY-MM-DD HH:mm:ss Z",
  merge_logs: true,
  log_type: "json",
};

/**
 * 2 Nitro workers + local TCP LB on DOMAIN_PORT (LiteSpeed stays on :3001).
 * PM2 cluster mode leaves the 2nd Nitro worker dead (~65MB) and causes
 * intermittent LiteSpeed 503 on POST /_server.
 * @type {{ apps: import('pm2').StartOptions[] }}
 */
module.exports = {
  apps: [
    {
      ...workerShared,
      name: "ok-web-frontend",
      env: {
        ...process.env,
        NODE_ENV: process.env.NODE_ENV || "production",
        PORT: workerA,
      },
    },
    {
      ...workerShared,
      name: "ok-web-frontend-2",
      env: {
        ...process.env,
        NODE_ENV: process.env.NODE_ENV || "production",
        PORT: workerB,
      },
    },
    {
      name: "ok-web-lb",
      script: "./scripts/localLb.mjs",
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      max_restarts: 20,
      min_uptime: "5s",
      // Start after workers so first accepts aren't connection-refused 503s.
      restart_delay: 2000,
      kill_timeout: 3000,
      error_file: "./logs/lb-err.log",
      out_file: "./logs/lb-out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      merge_logs: true,
      env: {
        LB_PORT: publicPort,
        LB_BACKENDS: `127.0.0.1:${workerA},127.0.0.1:${workerB}`,
        LB_CONNECT_TIMEOUT_MS: 2000,
      },
    },
  ],
};
