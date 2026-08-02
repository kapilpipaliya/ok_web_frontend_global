#!/usr/bin/env node
/**
 * Rolling PM2 reload for 2 Nitro workers + local LB.
 *
 * `pm2 reload ecosystem.config.cjs` restarts both workers at once, so the LB
 * has no healthy upstream and LiteSpeed returns 503 on POST /_server.
 * Reload one worker at a time, wait until it accepts TCP, then the other,
 * then refresh the LB last.
 */
import net from "node:net";
import { spawnSync } from "node:child_process";

const publicPort = Number(process.env.DOMAIN_PORT || 3001);
const backends = [
  { name: "ok-web-frontend", port: publicPort + 2 },
  { name: "ok-web-frontend-2", port: publicPort + 3 },
];
const lbName = "ok-web-lb";
const readyTimeoutMs = Number(process.env.PM2_READY_TIMEOUT_MS || 120_000);
const readyPollMs = 500;

function run(cmd, args) {
  console.log(`$ ${cmd} ${args.join(" ")}`);
  const r = spawnSync(cmd, args, { stdio: "inherit" });
  if (r.status !== 0) {
    process.exit(r.status ?? 1);
  }
}

function waitForPort(port, timeoutMs) {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    const tryOnce = () => {
      const socket = net.connect({ host: "127.0.0.1", port });
      const onFail = () => {
        socket.destroy();
        if (Date.now() - start >= timeoutMs) {
          reject(new Error(`timeout waiting for :${port}`));
          return;
        }
        setTimeout(tryOnce, readyPollMs);
      };
      socket.once("connect", () => {
        socket.end();
        resolve();
      });
      socket.once("error", onFail);
    };
    tryOnce();
  });
}

console.log("🔄 Rolling PM2 reload (one worker at a time)...");

for (const { name, port } of backends) {
  run("pm2", ["reload", name, "--update-env"]);
  process.stdout.write(`⏳ waiting for ${name} on :${port}... `);
  await waitForPort(port, readyTimeoutMs);
  console.log("ready");
}

run("pm2", ["restart", lbName, "--update-env"]);
process.stdout.write(`⏳ waiting for LB on :${publicPort}... `);
await waitForPort(publicPort, readyTimeoutMs);
console.log("ready");

run("pm2", ["status"]);
console.log("✅ Rolling PM2 reload complete");
