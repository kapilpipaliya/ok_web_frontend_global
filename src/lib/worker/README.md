# Worker cluster coordination

How multi-process mode works in this app, and how Redis leases + control ACK keep sticky in-process work (like Playwright browsers) on the correct Node worker.

## Why this exists

PM2 starts **one** process ([`scripts/pm2/entry.mjs`](../../scripts/pm2/entry.mjs)). That primary forks **`NITRO_CLUSTER_WORKERS`** children (default `3`) that all share the same HTTP port.

Each child is a separate Node process:

- Memory is **not** shared (Playwright browsers, timers, in-process slots live in one worker only).
- Any HTTP request (cancel, leave, status) may land on **any** worker.

So sticky resources need Redis coordination:

1. **Lease** — which `nodeId` owns this `ownerId` right now.
2. **Control bus** — send cancel/leave to the owning process and wait for an **ACK**.

```
                    ┌─────────────┐
                    │  PM2 (1×)   │
                    │  entry.mjs  │
                    └──────┬──────┘
           ┌───────────────┼───────────────┐
           ▼               ▼               ▼
      Worker 0         Worker 1         Worker 2
   (nodeId …-0)     (nodeId …-1)     (nodeId …-2)
           │               │               │
           └───────────────┼───────────────┘
                           ▼
                     Redis (leases + pub/sub)
```

## Modules

| File | Role |
|------|------|
| [`workerCluster.ts`](./workerCluster.ts) | Generic leases + pub/sub ACK |
| [`../zoom/askzoomPlaywrightCluster.ts`](../zoom/askzoomPlaywrightCluster.ts) | Zoom facade (`userId` → `ownerId`, Zoom control fields) |
| [`../zoom/askzoomPlaywrightStore.ts`](../zoom/askzoomPlaywrightStore.ts) | **In-process only** Playwright slots (not shared) |

Server functions get:

- `_.workerCluster('my-namespace')` — generic API (subdomain already bound)
- `_.askzoomPlaywright` — Zoom slots + same cluster under the hood (`namespace: askzoom-pw`)

## Node identity

Each process has a stable id:

```text
{hostname}-{WORKER_ID|NODE_APP_INSTANCE|pid}
```

`WORKER_ID` is set by `entry.mjs` (0, 1, 2, …). Prefer that over `pid` so identity survives restarts of the same slot.

## Redis keys

Prefix: `worker:{namespace}:…`

| Key | Purpose |
|-----|---------|
| `worker:{ns}:lease:{subdomain}:{ownerId}` | JSON lease (TTL) |
| `worker:{ns}:busy:{subdomain}` | Set of ownerIds with a live lease |
| `worker:{ns}:ctrl:{subdomain}` | Control pub/sub channel |
| `worker:{ns}:ack:{subdomain}` | ACK channel |

AskZoom uses `namespace = askzoom-pw`.

### Lease shape

```ts
{
  ownerId: string;
  nodeId: string;
  pid: number;
  updatedAt: string;
  meta: Record<string, unknown>; // e.g. { jobAction, managing }
}
```

Acquire is **atomic** (Lua): if another `nodeId` holds the key, acquire fails; same node may refresh.

Refresh extends TTL. Release deletes the lease and removes the owner from the busy set. Stale busy members (lease expired) are pruned on `countBusy`.

## Control flow (cancel / leave)

1. Owning worker registers a handler: `registerHandler(ownerId, fn)`.
2. Any worker calls `publishAndWait({ type, ownerId, data })`.
3. If the handler is **local**, it runs inline and returns an ACK (no Redis round-trip).
4. Otherwise Redis publishes on `ctrl`; the owner runs the handler and publishes on `ack`.
5. Caller waits until ACK or timeout (`ackTimeoutMs`).

Failed handlers set `ok: false` on the ACK; the caller throws.

```
Worker A (HTTP: cancel)          Redis          Worker B (owns browser)
        │                          │                      │
        │──── publishAndWait ─────►│                      │
        │                          │──── ctrl msg ───────►│
        │                          │                      │ run handler
        │                          │◄──── ack ────────────│
        │◄──── resolve ────────────│                      │
```

### Example: request on Worker 2, browser on Worker 1

Worker 2 never touches the browser. It only talks to Redis; Worker 1 runs the action.

**Setup**

- Login/manage ran on **Worker 1** → browser lives in Worker 1’s memory.
- Worker 1 called `acquireLease(userId)` → Redis lease says `nodeId = host-1`.
- Worker 1 registered a control handler for that `userId`.

**Cancel/leave hits Worker 2**

1. Worker 2 runs `publishControlAndWait({ type: 'leave', userId })` (or generic `publishAndWait`).
2. Worker 2 has **no** local handler for that user → it does **not** run leave locally.
3. It publishes on Redis `worker:askzoom-pw:ctrl:{subdomain}` and waits on the ACK channel.
4. All workers receive the message; only Worker 1 has the handler → it runs leave/forceClose on **its** Playwright slot.
5. Worker 1 publishes ACK → Worker 2’s wait resolves and the HTTP response returns.

```
Client ──HTTP──► Worker 2                    Worker 1 (has browser)
                    │                              │
                    │ publishAndWait(leave)         │
                    ├──────── Redis ctrl ──────────►│ leave on local page
                    │◄─────── Redis ack ────────────┤
                    │                              │
                 200 OK
```

If Worker 2 called `getSlot(userId)` directly, it would see nothing useful — slots are in-process only. That is why cancel/leave go through Redis, not through “open the browser here.”

**Same-worker shortcut:** if the request already landed on Worker 1, the handler runs inline (no Redis wait).

## Typical usage

### Generic worker

```js
const wc = _.workerCluster('my-worker');

await wc.ensureBus();
const acquired = await wc.acquireLease(ownerId, { kind: 'job' });
if (!acquired.ok) throw new Error(acquired.reason);

wc.registerHandler(ownerId, async (msg) => {
  if (msg.type === 'cancel') {
    // stop local work for this owner
  }
});

// heartbeat
await wc.refreshLease(ownerId, { kind: 'job' });

// from another request / worker
await wc.publishAndWait({ type: 'cancel', ownerId, data: { reason: 'user' } });

await wc.releaseLease(ownerId);
wc.unregisterHandler(ownerId);
```

### AskZoom (existing schemas)

Keep using `_.askzoomPlaywright` — it maps to the same Redis layer:

- `acquireLease(userId, { jobAction, managing })`
- `publishControlAndWait({ type: 'leave' | 'cancel' | …, userId, … })`
- In-process `getSlot(userId)` stays local to the worker that launched the browser

## Environment

| Variable | Default | Meaning |
|----------|---------|---------|
| `NITRO_CLUSTER_WORKERS` | `3` | Child processes forked by `entry.mjs` |
| `REDIS_HOST` / `REDIS_PORT` / `REDIS_PASSWORD` | localhost:6379 | Redis for leases + pub/sub |
| `WORKER_CLUSTER_LEASE_TTL_SEC` | `90` | Default lease TTL (min 30) |
| `WORKER_CLUSTER_CONTROL_ACK_MS` | `8000` | Default ACK wait (min 1000) |
| `ZOOM_PW_LEASE_TTL_SEC` | `90` | AskZoom lease override |
| `ZOOM_PW_CONTROL_ACK_MS` | `8000` | AskZoom ACK override |
| `ZOOM_PW_MAX_SLOTS` | `3` | Max concurrent Zoom browsers (uses cluster busy count) |

There is **no silent local fallback** if Redis is down: coordination must fail visibly rather than double-open browsers.

## Rules of thumb

1. Acquire a lease **before** creating sticky local state (browser, long timer).
2. Register the control handler **before** any wait that can be cancelled.
3. Refresh the lease on a heartbeat while work is active.
4. Always `releaseLease` + `unregisterHandler` in cleanup.
5. Use `publishAndWait` for cross-process commands that must run on the owner; use `publish` only for fire-and-forget.
6. Cap concurrency with `countBusy()` vs your max slots — do not trust in-process counts alone when `NITRO_CLUSTER_WORKERS > 1`.

## Tests

```bash
npx playwright test tests/worker/worker-cluster.spec.ts --project=chromium
npx playwright test tests/askzoom/playwright-cluster.spec.ts --project=chromium
```

Requires a reachable Redis. Tests skip if Redis is unavailable.
