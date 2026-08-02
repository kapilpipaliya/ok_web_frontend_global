#!/usr/bin/env node
/**
 * Tiny round-robin TCP proxy so LiteSpeed can keep proxying to :3001
 * while two Nitro workers listen on adjacent ports.
 *
 * LiteSpeed -> :3001 (this) -> :3003 / :3004 (PM2 fork workers)
 *
 * Retries the other backend on connect failure so a cold/restarting
 * worker does not surface as LiteSpeed 503.
 */
import net from "node:net";

const listenPort = Number(process.env.LB_PORT || 3001);
const connectTimeoutMs = Number(process.env.LB_CONNECT_TIMEOUT_MS || 2000);
const backends = String(process.env.LB_BACKENDS || "127.0.0.1:3003,127.0.0.1:3004")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean)
  .map((s) => {
    const [host, port] = s.split(":");
    return { host, port: Number(port) };
  });

if (backends.length === 0) {
  console.error("[lb] no backends configured");
  process.exit(1);
}

let next = 0;

function connectBackend(backend) {
  return new Promise((resolve, reject) => {
    const socket = net.connect({
      host: backend.host,
      port: backend.port,
    });
    const timer = setTimeout(() => {
      socket.destroy();
      reject(new Error(`connect timeout ${backend.host}:${backend.port}`));
    }, connectTimeoutMs);

    socket.once("connect", () => {
      clearTimeout(timer);
      resolve(socket);
    });
    socket.once("error", (err) => {
      clearTimeout(timer);
      reject(err);
    });
  });
}

async function pickUpstream(startIndex) {
  let lastError;
  for (let i = 0; i < backends.length; i++) {
    const backend = backends[(startIndex + i) % backends.length];
    try {
      const socket = await connectBackend(backend);
      return { socket, backend };
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError || new Error("no backends available");
}

function sendBadGateway(client) {
  if (client.destroyed || client.writableEnded) return;
  try {
    client.end(
      "HTTP/1.1 502 Bad Gateway\r\nConnection: close\r\nContent-Type: text/plain\r\nContent-Length: 11\r\n\r\nBad Gateway",
    );
  } catch {
    try {
      client.destroy();
    } catch {
      /* ignore */
    }
  }
}

const server = net.createServer((client) => {
  const startIndex = next % backends.length;
  next += 1;

  pickUpstream(startIndex)
    .then(({ socket: upstream }) => {
      client.pipe(upstream);
      upstream.pipe(client);

      const fail = () => {
        try {
          client.destroy();
        } catch {
          /* ignore */
        }
        try {
          upstream.destroy();
        } catch {
          /* ignore */
        }
      };

      client.on("error", fail);
      upstream.on("error", fail);
      client.on("close", () => upstream.destroy());
      upstream.on("close", () => client.destroy());
    })
    .catch((err) => {
      console.error("[lb] all backends failed:", err?.message || err);
      sendBadGateway(client);
    });
});

async function waitForAnyBackend(maxMs = 120_000) {
  const start = Date.now();
  while (Date.now() - start < maxMs) {
    for (let i = 0; i < backends.length; i++) {
      try {
        const { socket } = await pickUpstream(i);
        socket.destroy();
        return;
      } catch {
        /* retry */
      }
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  console.warn("[lb] starting without healthy backend (will retry per request)");
}

await waitForAnyBackend();

server.listen(listenPort, "127.0.0.1", () => {
  console.log(
    `[lb] listening on ${listenPort} -> ${backends
      .map((b) => `${b.host}:${b.port}`)
      .join(", ")}`,
  );
});

for (const sig of ["SIGINT", "SIGTERM"]) {
  process.on(sig, () => {
    server.close(() => process.exit(0));
  });
}
